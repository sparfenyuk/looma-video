import "dotenv/config";
import { Worker } from "bullmq";
import { LinkStatus } from "@prisma/client";
import { getRedisConnection } from "@/server/workers/connection";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { enqueueSummarizeJob, enqueueTranscriptFetchJob } from "@/server/workers/queues";

async function bootstrap() {
  const connection = getRedisConnection();

  if (!connection) {
    logger.warn("Skipping worker bootstrap because Redis is not configured.");
    return;
  }

  new Worker(
    "link_ingest",
    async (job) => {
      const { linkAssetId } = job.data as { linkAssetId: string };
      if (!linkAssetId) {
        return;
      }

      const asset = await prisma.linkAsset.update({
        where: { id: linkAssetId },
        data: {
          status: LinkStatus.INGESTING,
        },
      });

      const thumbnailUrl = deriveThumbnail(asset.url, asset.externalId);

      await prisma.linkAsset.update({
        where: { id: asset.id },
        data: {
          title: asset.title ?? buildTitleFromUrl(asset.url),
          description: asset.description ?? `Auto-ingested lesson for ${asset.platform}`,
          thumbnailUrl,
          fetchedAt: new Date(),
          status: LinkStatus.READY,
          metadataJson: {
            host: new URL(asset.url).hostname,
          },
        },
      });

      await enqueueTranscriptFetchJob({ linkAssetId }).catch((error) =>
        logger.warn("Failed to enqueue transcript job", { error })
      );
    },
    { connection }
  );

  new Worker(
    "transcript_fetch",
    async (job) => {
      const { linkAssetId } = job.data as { linkAssetId: string };
      if (!linkAssetId) {
        return;
      }

      await prisma.linkAsset.update({
        where: { id: linkAssetId },
        data: {
          rawTranscriptText: `Transcript placeholder for asset ${linkAssetId}. Replace with real captions during integration.`,
        },
      });

      const lessons = await prisma.lesson.findMany({
        where: { linkAssetId },
      });

      for (const lesson of lessons) {
        await enqueueSummarizeJob({ courseId: lesson.courseId, lessonId: lesson.id }).catch((error) =>
          logger.warn("Failed to enqueue summarize job", { error })
        );
      }
    },
    { connection }
  );

  new Worker(
    "llm_summarize",
    async (job) => {
      const { lessonId } = job.data as { lessonId: string };
      if (!lessonId) {
        return;
      }

      const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: {
          linkAsset: true,
        },
      });

      if (!lesson) {
        return;
      }

      const summary = lesson.summary ?? buildSummaryFromLesson(lesson.linkAsset?.title ?? "Lesson");

      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          summary,
          keyPoints: lesson.keyPoints ?? [{ label: "Review the key idea" }],
        },
      });
    },
    { connection }
  );

  new Worker(
    "course_compose",
    async (job) => {
      const { courseId } = job.data as { courseId: string };
      if (!courseId) {
        return;
      }

      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          lessons: true,
        },
      });

      if (!course) {
        return;
      }

      logger.info("Course compose job acknowledged", {
        courseId,
        lessonCount: course.lessons.length,
      });
    },
    { connection }
  );

  logger.info("Worker bootstrapped successfully");
}

function deriveThumbnail(url: string, externalId: string | null) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu")) {
      return `https://img.youtube.com/vi/${externalId}/hqdefault.jpg`;
    }
  } catch (error) {
    logger.debug("Failed to derive thumbnail", { url, error });
  }
  return null;
}

function buildTitleFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.split("/").filter(Boolean).join(" ");
    const host = parsed.hostname.replace("www.", "");
    return `${host} ${pathname}`.trim() || "Creator Lesson";
  } catch {
    return "Creator Lesson";
  }
}

function buildSummaryFromLesson(title: string) {
  return `A concise walkthrough of ${title}.`;
}

bootstrap().catch((error) => {
  logger.error("Worker bootstrap failed", { error });
  process.exit(1);
});
