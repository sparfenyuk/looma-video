import { LinkPlatform } from "@prisma/client";
import type { NormalizedLink } from "@/types/link";

const YOUTUBE_PATTERNS = [
  /(?:v=|v%3D)([a-zA-Z0-9_-]{6,})/, // watch?v=
  /youtu\.be\/([a-zA-Z0-9_-]{6,})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/,
];

const INSTAGRAM_PATTERNS = [/(?:instagram\.com|instagr\.am)\/p\/([a-zA-Z0-9_-]+)/];
const TIKTOK_PATTERNS = [/tiktok\.com\/.+\/video\/([0-9]+)/];

function detectPlatformFromHost(host: string): LinkPlatform {
  const normalized = host.toLowerCase();
  if (normalized.includes("youtube") || normalized.includes("youtu.be")) {
    return LinkPlatform.YOUTUBE;
  }
  if (normalized.includes("instagram")) {
    return LinkPlatform.INSTAGRAM;
  }
  if (normalized.includes("tiktok")) {
    return LinkPlatform.TIKTOK;
  }
  return LinkPlatform.UNKNOWN;
}

function extractExternalId(url: URL, platform: LinkPlatform): string {
  const href = url.href;
  const matchFromPatterns = (patterns: RegExp[]): string | undefined => {
    for (const pattern of patterns) {
      const match = href.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }
    return undefined;
  };

  switch (platform) {
    case LinkPlatform.YOUTUBE:
      return matchFromPatterns(YOUTUBE_PATTERNS) ?? url.searchParams.get("v") ?? url.pathname.replaceAll("/", "");
    case LinkPlatform.INSTAGRAM:
      return matchFromPatterns(INSTAGRAM_PATTERNS) ?? url.pathname.replaceAll("/", "");
    case LinkPlatform.TIKTOK:
      return matchFromPatterns(TIKTOK_PATTERNS) ?? url.pathname.replaceAll("/", "");
    case LinkPlatform.UNKNOWN:
    default:
      return Buffer.from(href).toString("base64");
  }
}

export function normalizeLink(input: string): NormalizedLink {
  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    throw new Error(`Invalid URL provided: ${input}`);
  }

  const platform = detectPlatformFromHost(parsed.hostname);
  const externalId = extractExternalId(parsed, platform);

  return {
    url: parsed.toString(),
    platform,
    externalId,
  };
}
