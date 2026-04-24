import { Queue, Worker } from "bullmq";
import connection from "../config/redis.js";

export const DEAD_LETTER_QUEUE = "dead-letter";

export const deadLetterQueue = new Queue(DEAD_LETTER_QUEUE, {
  connection,
  defaultJobOptions: {
    removeOnComplete: false,
    removeOnFail: false,
  },
});

/** Listen on subsection worker and copy exhausted jobs to DLQ */
export function attachDeadLetterForwarding(subsectionWorker) {
  subsectionWorker.on("failed", async (job, err) => {
    if (!job) return;
    const max = job.opts.attempts ?? 1;
    if (job.attemptsMade < max) return; // still retrying

    await deadLetterQueue.add(
      "subsection-process-failed",
      {
        sourceQueue: "subsection-process",
        originalJobId: job.id,
        payload: job.data,
        failedReason: err?.message || String(err),
        attemptsMade: job.attemptsMade,
      },
      { jobId: `dlq-subsection-${job.id}` }
    );
  });
}