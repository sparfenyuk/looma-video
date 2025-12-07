import { LinkStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeLink } from "@/lib/url";
import { logger } from "@/lib/logger";
import type { LinkAssetDTO } from "@/types/link";
import { enqueueLinkIngestJob } from "@/server/workers/queues";

export async function ingestLinks(creatorId: string, urls: string[]) {
  const uniqueUrls = Array.from(new Set(urls.map((value) => value.trim()).filter(Boolean)));

  const results: LinkAssetDTO[] = [];

  for (const url of uniqueUrls) {
    const normalized = normalizeLink(url);

    const existing = await prisma.linkAsset.findFirst({
      where: {
        creatorId,
        externalId: normalized.externalId,
      },
    });

    if (existing) {
      results.push(toDto(existing));
      continue;
    }

    const asset = await prisma.linkAsset.create({
      data: {
        creatorId,
        url: normalized.url,
        platform: normalized.platform,
        externalId: normalized.externalId,
        status: LinkStatus.PENDING,
      },
    });

    results.push(toDto(asset));

    try {
      await enqueueLinkIngestJob({ linkAssetId: asset.id });
    } catch (error) {
      logger.warn("Failed to enqueue link ingest job", {
        linkAssetId: asset.id,
        error,
      });
    }
  }

  return results;
}

export async function getLinkAsset(id: string) {
  const asset = await prisma.linkAsset.findUnique({
    where: { id },
  });

  if (!asset) {
    return null;
  }

  return toDto(asset);
}

type LinkAssetModel = Prisma.LinkAssetGetPayload<Prisma.LinkAssetDefaultArgs>;

function toDto(asset: LinkAssetModel): LinkAssetDTO {
  return {
    id: asset.id,
    creatorId: asset.creatorId,
    url: asset.url,
    platform: asset.platform,
    externalId: asset.externalId,
    title: asset.title,
    description: asset.description,
    thumbnailUrl: asset.thumbnailUrl,
    status: asset.status,
    durationSec: asset.durationSec,
    fetchedAt: asset.fetchedAt ?? undefined,
  };
}
