import "dotenv/config";
import { worker } from "./queue/claimWorker";

console.log("[worker] Claim worker started, waiting for jobs...");

worker.on("completed", (job) => {
  console.log(`[worker] Job ${job.id} completed — claimId: ${job.returnvalue?.claimId}`);
});

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});
