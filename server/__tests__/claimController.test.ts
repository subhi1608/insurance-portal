import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import db from '../api/v1/db/index';

// Mock Redis connection — prevents real ioredis connection in tests
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

// Mock db so no real connections are made
db.query = vi.fn() as any;
db.checkHealth = vi.fn().mockResolvedValue(undefined) as any;

// Bypass auth middleware for controller unit tests
vi.mock('../api/v1/utils', () => ({
  default: {
    isAuthenticated: (_req: any, _res: any, next: any) => next(),
    isUserLogged: (_req: any, _res: any, next: any) => next(),
  },
}));

// Mock the queue so no real Redis is needed in this test file
vi.mock('../queue/claimQueue', () => ({
  enqueueClaimJob: vi.fn().mockResolvedValue('mock-job-id-123'),
  getJobStatus: vi.fn().mockResolvedValue({
    status: 'completed',
    result: { claimId: 42 },
    failedReason: undefined,
  }),
}));

const token = jwt.sign({ id: 1 }, process.env.TOKEN as string, { expiresIn: '15m' });

const validClaimBody = {
  insurance_policy_id: 1,
  description: 'Car accident on highway',
  claim_status: 'pending',
  claim_date: '2026-05-24',
};

describe('POST /api/v1/claims — async enqueue', () => {
  it('returns 202 with jobId', async () => {
    const res = await request(app)
      .post('/api/v1/claims')
      .set('Authorization', `Bearer ${token}`)
      .send(validClaimBody);

    expect(res.status).toBe(202);
    expect(res.body.data.jobId).toBe('mock-job-id-123');
  });

  it('returns 400 when body is invalid (Zod fires before queue)', async () => {
    const res = await request(app)
      .post('/api/v1/claims')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'missing fields' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/claims/status/:jobId', () => {
  it('returns job status and result', async () => {
    const res = await request(app)
      .get('/api/v1/claims/status/mock-job-id-123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');
    expect(res.body.data.result.claimId).toBe(42);
  });

  it('returns 404 for unknown jobId', async () => {
    const { getJobStatus } = await import('../queue/claimQueue');
    vi.mocked(getJobStatus).mockResolvedValueOnce(null);

    const res = await request(app)
      .get('/api/v1/claims/status/nonexistent-job')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('JOB_NOT_FOUND');
  });
});
