import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
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

// Pre-compute a hash so the wrong-password test has a real value to compare against.
const HASHED_CORRECT = bcrypt.hashSync('correctpassword', 4);

const queryMock = vi.fn();
const checkHealthMock = vi.fn().mockResolvedValue(undefined);
db.query = queryMock as any;
db.checkHealth = checkHealthMock as any;

beforeEach(() => {
  queryMock.mockReset();
  checkHealthMock.mockResolvedValue(undefined);
});

describe('Auth endpoints', () => {
  describe('POST /api/v1/auth/signin', () => {
    it('stores a bcrypt hash, not the plaintext password', async () => {
      const bcryptSpy = vi.spyOn(bcrypt, 'hash');
      queryMock
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/v1/auth/signin')
        .send({ email: 'new@example.com', password: 'password123' });

      expect(res.status).toBe(201);
      expect(res.body.data.accessToken).toBeDefined();
      expect(bcryptSpy).toHaveBeenCalledWith('password123', 12);
      bcryptSpy.mockRestore();
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('returns 401 on wrong password', async () => {
      queryMock.mockResolvedValueOnce({
        rows: [{ id: 1, email: 'user@example.com', password: HASHED_CORRECT, login_status: false }],
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user@example.com', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('returns a new accessToken from a valid refresh cookie', async () => {
      const refreshToken = jwt.sign({ id: 1 }, process.env.REFRESH_TOKEN_SECRET as string, {
        expiresIn: '7d',
      });

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('clears the refresh cookie and returns 200', async () => {
      const accessToken = jwt.sign({ id: 1 }, process.env.TOKEN as string, { expiresIn: '15m' });
      queryMock.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      const rawSetCookie = res.headers['set-cookie'] ?? [];
      const setCookie = Array.isArray(rawSetCookie) ? rawSetCookie : [rawSetCookie];
      expect(setCookie.some((c: string) => c.startsWith('refreshToken=;'))).toBe(true);
    });
  });
});
