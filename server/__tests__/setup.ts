process.env.TOKEN = 'test-jwt-access-secret-that-is-long-enough-for-256bit';
process.env.REFRESH_TOKEN_SECRET = 'test-jwt-refresh-secret-that-is-long-enough-for-256bit';
process.env.NODE_ENV = 'test';
process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
