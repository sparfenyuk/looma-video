import Redis from "ioredis";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

let connection: Redis | null = null;

export function getRedisConnection(): Redis | null {
  if (!env.REDIS_URL) {
    logger.warn("Redis URL not configured. Background jobs will be disabled.");
    return null;
  }

  if (!connection) {
    connection = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true,
    });
  }

  return connection;
}
