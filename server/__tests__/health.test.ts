import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import db from '../api/v1/db/index';
import app from '../app';

const checkHealthMock = vi.fn().mockResolvedValue(undefined);
const queryMock = vi.fn();
db.checkHealth = checkHealthMock as any;
db.query = queryMock as any;

beforeEach(() => {
  checkHealthMock.mockResolvedValue(undefined);
  queryMock.mockReset();
});

describe('GET /health', () => {
  it('returns { status: "ok", db: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('ok');
  });
});
