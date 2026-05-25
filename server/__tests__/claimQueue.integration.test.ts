import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import db from '../api/v1/db/index';
import app from '../app';

// Mock DB so worker doesn't hit a real database
const queryMock = vi.fn();
db.query = queryMock as any;
db.checkHealth = vi.fn().mockResolvedValue(undefined) as any;

// Bypass auth — not what we're testing here
vi.mock('../api/v1/utils', () => ({
  default: {
    isAuthenticated: (_req: any, _res: any, next: any) => next(),
    isUserLogged: (_req: any, _res: any, next: any) => next(),
  },
}));

// Import the worker AFTER mocks are registered — it will use the mocked db
import { worker } from '../queue/claimWorker';
import claimQueue from '../queue/claimQueue';

const token = jwt.sign({ id: 1 }, process.env.TOKEN as string, { expiresIn: '15m' });

const validClaimBody = {
  insurance_policy_id: 1,
  description: 'Integration test claim',
  claim_status: 'pending',
  claim_date: '2026-05-24',
};

beforeAll(async () => {
  // Drain any leftover jobs from previous runs
  await claimQueue.drain();
});

afterAll(async () => {
  await worker.close();
  await claimQueue.close();
});

describe('Full async claim flow (real Redis)', () => {
  it('POST enqueues job, worker processes it, status endpoint returns completed', async () => {
    // Worker will call db.query (INSERT) — return a fake claimId
    queryMock.mockResolvedValueOnce({ rows: [{ id: 99 }] });

    // 1. Submit the claim
    const postRes = await request(app)
      .post('/api/v1/claims')
      .set('Authorization', `Bearer ${token}`)
      .send(validClaimBody);

    expect(postRes.status).toBe(202);
    const { jobId } = postRes.body.data;
    expect(typeof jobId).toBe('string');

    // 2. Poll status until completed (max 3 seconds)
    let finalStatus = '';
    let finalResult: any = null;
    for (let i = 0; i < 15; i++) {
      const statusRes = await request(app)
        .get(`/api/v1/claims/status/${jobId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(statusRes.status).toBe(200);
      finalStatus = statusRes.body.data.status;
      finalResult = statusRes.body.data.result;
      if (finalStatus === 'completed' || finalStatus === 'failed') break;
      await new Promise((r) => setTimeout(r, 200));
    }

    // 3. Assert the job completed successfully
    expect(finalStatus).toBe('completed');
    expect(finalResult).toEqual({ claimId: 99 });
  });

  it('returns 404 for a random jobId that was never enqueued', async () => {
    const res = await request(app)
      .get('/api/v1/claims/status/completely-fake-job-xyz')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('JOB_NOT_FOUND');
  });
});
