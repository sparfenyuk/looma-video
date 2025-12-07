import { Queue, type JobsOptions } from "bullmq";
import { logger } from "@/lib/logger";
import { getRedisConnection } from "@/server/workers/connection";

const queues = new Map<string, Queue>();

function getQueue(name: string): Queue | null {
  const redis = getRedisConnection();
  if (!redis) {
    return null;
  }

  if (!queues.has(name)) {
    queues.set(
      name,
      new Queue(name, {
        connection: redis,
        defaultJobOptions: {
          removeOnComplete: 500,
          removeOnFail: 1000,
        },
      })
    );
  }

  return queues.get(name) ?? null;
}

async function enqueueJob(name: string, payload: unknown, options: JobsOptions = {}) {
  const queue = getQueue(name);
  if (!queue) {
    logger.warn("Queue not available. Did you configure REDIS_URL?", { queue: name });
    return { skipped: true as const };
  }

  await queue.add(name, payload, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    ...options,
  });

  return { skipped: false as const };
}

export type LinkIngestJobPayload = {
  linkAssetId: string;
};

export type TranscriptJobPayload = {
  linkAssetId: string;
};

export type SummarizeJobPayload = {
  courseId: string;
  lessonId: string;
};

export type CourseComposeJobPayload = {
  courseId: string;
};

export function enqueueLinkIngestJob(payload: LinkIngestJobPayload) {
  return enqueueJob("link_ingest", payload);
}

export function enqueueTranscriptFetchJob(payload: TranscriptJobPayload) {
  return enqueueJob("transcript_fetch", payload, {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
  });
}

export function enqueueSummarizeJob(payload: SummarizeJobPayload) {
  return enqueueJob("llm_summarize", payload, {
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
  });
}

export function enqueueCourseComposeJob(payload: CourseComposeJobPayload) {
  return enqueueJob("course_compose", payload, {
    attempts: 3,
    backoff: { type: "fixed", delay: 3000 },
  });
}
