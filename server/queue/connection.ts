import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 500, 5000),
});

connection.on("error", () => {});

export default connection;
