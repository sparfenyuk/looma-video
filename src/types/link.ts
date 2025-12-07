import type { LinkPlatform, LinkStatus } from "@prisma/client";

export type NormalizedLink = {
  url: string;
  platform: LinkPlatform;
  externalId: string;
};

export type LinkAssetDTO = {
  id: string;
  creatorId: string;
  url: string;
  platform: LinkPlatform;
  externalId: string;
  title?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  status: LinkStatus;
  durationSec?: number | null;
  fetchedAt?: Date | null;
};
