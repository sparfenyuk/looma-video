import { nanoid } from "nanoid";
import { LinkPlatform } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import type { CourseModule, CourseLesson, CourseOutline } from "@/types/course";
import { enqueueSummarizeJob } from "@/server/workers/queues";
import { logger } from "@/lib/logger";

const PLATFORM_LABEL: Record<LinkPlatform, string> = {
  [LinkPlatform.YOUTUBE]: "YouTube",
  [LinkPlatform.INSTAGRAM]: "Instagram",
  [LinkPlatform.TIKTOK]: "TikTok",
  [LinkPlatform.UNKNOWN]: "Web",
};

type Asset = Awaited<ReturnType<typeof prisma.linkAsset.findMany>>[number];

type ModuleGrouping = {
  title: string;
  description?: string;
  assets: Asset[];
};

type DraftOptions = {
  creatorId: string;
  linkAssetIds: string[];
  title?: string;
};

type DraftResult = {
  course: CourseOutline;
};

export async function composeCourseDraft({ creatorId, linkAssetIds, title }: DraftOptions): Promise<DraftResult> {
  const assets = await prisma.linkAsset.findMany({
    where: {
      id: { in: linkAssetIds },
      creatorId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (assets.length === 0) {
    throw new Error("No link assets found for draft composition");
  }

  const courseTitle = title ?? deriveCourseTitle(assets);
  const courseSlugBase = slugify(courseTitle);
  const slug = await ensureUniqueSlug(courseSlugBase);

  const course = await prisma.course.create({
    data: {
      creatorId,
      slug,
      title: courseTitle,
      subtitle: deriveSubtitle(assets),
      isPaid: false,
      isPublished: false,
      currency: "usd",
    },
  });

  const grouped = groupAssetsIntoModules(assets);

  const modules: CourseModule[] = [];

  for (const [moduleIndex, { title: moduleTitle, description, assets: moduleAssets }] of grouped.entries()) {
    const createdModule = await prisma.module.create({
      data: {
        courseId: course.id,
        index: moduleIndex,
        title: moduleTitle,
        description,
      },
    });

    const moduleOutline: CourseModule = {
      id: createdModule.id,
      index: moduleIndex,
      title: moduleTitle,
      description,
      lessons: [],
    };

    modules.push(moduleOutline);

    for (const [lessonIndex, asset] of moduleAssets.entries()) {
      const lesson = await prisma.lesson.create({
        data: {
          courseId: course.id,
          moduleId: createdModule.id,
          linkAssetId: asset.id,
          index: lessonIndex,
          title: deriveLessonTitle(asset, lessonIndex + 1),
          summary: deriveLessonSummary(asset),
          keyPoints: deriveLessonKeyPoints(asset),
          difficulty: estimateDifficulty(asset),
          estMinutes: estimateDuration(asset),
        },
      });

      const lessonOutline: CourseLesson = {
        id: lesson.id,
        moduleId: createdModule.id,
        index: lessonIndex,
        title: lesson.title,
        summary: lesson.summary ?? undefined,
        keyPoints: (lesson.keyPoints as CourseLesson["keyPoints"]) ?? [],
        difficulty: (lesson.difficulty as CourseLesson["difficulty"]) ?? undefined,
        estMinutes: lesson.estMinutes ?? undefined,
        linkAssetId: asset.id,
      };

      moduleOutline.lessons.push(lessonOutline);

      // Fire-and-forget the async summarization job for future enhancements.
      enqueueSummarizeJob({ courseId: course.id, lessonId: lesson.id }).catch((error) =>
        logger.debug("Summarize job enqueue failed", { error, lessonId: lesson.id })
      );
    }
  }

  const outline: CourseOutline = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle ?? undefined,
    coverUrl: course.coverUrl ?? undefined,
    isPaid: course.isPaid,
    priceCents: course.priceCents ?? undefined,
    currency: course.currency ?? undefined,
    modules,
  };

  return {
    course: outline,
  };
}

function deriveCourseTitle(assets: Asset[]): string {
  const primaryAsset = assets[0];
  const rawTitle = primaryAsset?.title ?? primaryAsset?.description ?? "Creator Course";
  if (!rawTitle) {
    return "Creator Course";
  }
  return sentenceCase(rawTitle.split("|")[0].split(":")[0].slice(0, 80));
}

function deriveSubtitle(assets: Asset[]): string | null {
  const uniquePlatforms = Array.from(new Set(assets.map((asset) => PLATFORM_LABEL[asset.platform])));
  return `Auto-generated from ${uniquePlatforms.join(", ")} content`;
}

function groupAssetsIntoModules(assets: Asset[]): ModuleGrouping[] {
  const topicMap = new Map<string, ModuleGrouping>();

  for (const asset of assets) {
    const topic = extractTopic(asset);
    const bucket = topicMap.get(topic);

    if (bucket) {
      bucket.assets.push(asset);
    } else {
      topicMap.set(topic, {
        title: topic,
        description: buildModuleDescription(asset),
        assets: [asset],
      });
    }
  }

  const groups = Array.from(topicMap.values());

  // Guarantee ordering by first occurrence in original list
  groups.sort((a, b) => {
    const firstIndexA = assets.findIndex((asset) => a.assets.includes(asset));
    const firstIndexB = assets.findIndex((asset) => b.assets.includes(asset));
    return firstIndexA - firstIndexB;
  });

  return groups;
}

function extractTopic(asset: Asset): string {
  const source = asset.title ?? asset.description ?? PLATFORM_LABEL[asset.platform];
  const sanitized = source.split("|")[0].split(":")[0].trim();
  if (sanitized.length >= 4) {
    return sentenceCase(sanitized);
  }
  return `${PLATFORM_LABEL[asset.platform]} Highlights`;
}

function buildModuleDescription(asset: Asset) {
  if (!asset.description) {
    return undefined;
  }
  const trimmed = asset.description.slice(0, 140);
  return sentenceCase(trimmed);
}

function deriveLessonTitle(asset: Asset, order: number) {
  if (asset.title) {
    return sentenceCase(asset.title.trim());
  }
  return `Lesson ${order}`;
}

function deriveLessonSummary(asset: Asset) {
  if (asset.description) {
    return sentenceCase(asset.description.slice(0, 200));
  }
  if (asset.title) {
    return `An in-depth look at ${asset.title}`;
  }
  return undefined;
}

function deriveLessonKeyPoints(asset: Asset): CourseLesson["keyPoints"] {
  const keyPoints: CourseLesson["keyPoints"] = [];
  const source = asset.description ?? asset.title ?? "";
  const sentences = source
    .split(/\.|\n|\r|!|\?/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (sentences.length === 0) {
    keyPoints.push({ label: "Watch and reflect" });
    return keyPoints;
  }

  for (const sentence of sentences) {
    keyPoints.push({ label: sentenceCase(sentence) });
  }

  return keyPoints;
}

function estimateDifficulty(asset: Asset): CourseLesson["difficulty"] {
  const descriptor = asset?.title?.toLowerCase() ?? "";
  if (descriptor.includes("advanced") || descriptor.includes("expert")) {
    return "advanced";
  }
  if (descriptor.includes("intro") || descriptor.includes("beginner")) {
    return "beginner";
  }
  return "intermediate";
}

function estimateDuration(asset: Asset) {
  if (asset?.durationSec) {
    return Math.max(1, Math.round(asset.durationSec / 60));
  }
  return 5;
}

async function ensureUniqueSlug(base: string) {
  const sanitized = base.length > 0 ? base : `course-${nanoid(6)}`;
  const existing = await prisma.course.findUnique({ where: { slug: sanitized } });

  if (!existing) {
    return sanitized;
  }

  return `${sanitized}-${nanoid(4)}`;
}

function sentenceCase(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
