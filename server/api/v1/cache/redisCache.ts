import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: 0,
  lazyConnect: true,
  retryStrategy: () => null,
});

redis.on("error", (err) => {
  if (process.env.NODE_ENV !== "test") {
    console.warn("[redis] connection error — caching disabled:", err.message);
  }
});

export async function get(key: string): Promise<string | null> {
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function set(key: string, value: string, ttlSeconds: number): Promise<void> {
  try {
    await redis.set(key, value, "EX", ttlSeconds);
  } catch {
    // Cache write failure is non-fatal
  }
}

export async function invalidate(pattern: string): Promise<void> {
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length) await redis.del(...keys);
    } while (cursor !== "0");
  } catch {
    // Cache invalidation failure is non-fatal
  }
}
