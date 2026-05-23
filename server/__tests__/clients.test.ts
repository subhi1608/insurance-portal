import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import db from '../api/v1/db/index';
import app from '../app';

// Prevent any accidental real DB connection.
db.query = vi.fn().mockResolvedValue({ rows: [] }) as any;
db.checkHealth = vi.fn().mockResolvedValue(undefined) as any;

describe('Clients endpoints', () => {
  describe('GET /api/v1/clients/', () => {
    it('returns 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/clients/');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
