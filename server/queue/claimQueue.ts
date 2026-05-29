import { Queue } from "bullmq";
import connection from "./connection";
import type { ClaimJobData } from "../types";

const claimQueue = new Queue<ClaimJobData>("claims", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: { age: 86400 },
    removeOnFail: { age: 86400 },
  },
});

// Suppress connection errors when Redis is unavailable (dev without Redis).
claimQueue.on("error", () => {});

export const enqueueClaimJob = async (data: ClaimJobData): Promise<string> => {
  const job = await claimQueue.add("process-claim", data);
  return job.id as string;
};

export const getJobStatus = async (jobId: string) => {
  const job = await claimQueue.getJob(jobId);
  if (!job) return null;
  const state = await job.getState();
  return {
    status: state,
    result: job.returnvalue ?? undefined,
    failedReason: job.failedReason ?? undefined,
  };
};

export default claimQueue;
