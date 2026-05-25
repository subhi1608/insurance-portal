import { Worker } from "bullmq";
import connection from "./connection";
import policyClaim from "../api/v1/db/policyclaim";
import type { ClaimJobData, ClaimJobResult } from "../types";

export const worker = new Worker<ClaimJobData, ClaimJobResult>(
  "claims",
  async (job) => {
    const claimId = await policyClaim.createNewClaim(job.data);
    return { claimId };
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error(`[claimWorker] job ${job?.id} failed:`, err.message);
});
