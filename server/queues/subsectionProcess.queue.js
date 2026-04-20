import { Queue, Worker, QueueEvents } from "bullmq";
import connection from "../config/redis.js";

export const SUBSECTION_PROCESS_QUEUE = "subsection-process";

/** @typedef {{ subSectionId: string; videoUrl: string; sectionId: string; courseId: string }} SubsectionProcessJobData */

export const subsectionProcessQueue = new Queue(SUBSECTION_PROCESS_QUEUE, {
  connection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 5000, // 5s, then 10s, 20s, ...
    },
    removeOnComplete: { count: 1000 },
    removeOnFail: false, // keep failed jobs in Redis for inspection / DLQ copy
  },
});

export function createSubsectionProcessWorker(processor) {
  const worker = new Worker(SUBSECTION_PROCESS_QUEUE, processor, {
    connection,
    concurrency: 2, // tune: ffmpeg is heavy; often 1–2 per machine
    lockDuration: 1_800_000, // 30 minutes
  });

  const queueEvents = new QueueEvents(SUBSECTION_PROCESS_QUEUE, { connection });

  return { worker, queueEvents };
}