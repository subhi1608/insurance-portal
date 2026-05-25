import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import db from '../api/v1/db/index';

// Mock Redis connection before importing app — prevents real ioredis connection in tests
vi.mock('../queue/connection', () => ({
  default: {
    ping: vi.fn().mockResolvedValue('PONG'),
    call: vi.fn().mockResolvedValue(null),
  },
}));

// Mock rate-limit-redis RedisStore — prevents store init from calling Redis SCRIPT LOAD
vi.mock('rate-limit-redis', () => ({
  RedisStore: class {
    async init() {}
    async increment() { return { totalHits: 1, resetTime: new Date() }; }
    async decrement() {}
    async resetKey() {}
  },
}));

import app from '../app';

db.checkHealth = vi.fn().mockResolvedValue(undefined) as any;
db.query = vi.fn() as any;

describe('GET /health', () => {
  it('returns { status: "ok", db: "ok", redis: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('ok');
    expect(res.body.redis).toBe('ok');
  });
});
