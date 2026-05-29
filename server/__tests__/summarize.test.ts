import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Anthropic SDK before any imports that use it
vi.mock('@anthropic-ai/sdk', () => {
  const mockStream = {
    on: vi.fn().mockImplementation(function (event: string, cb: (text: string) => void) {
      if (event === 'text') {
        cb('Hello ');
        cb('world.');
      }
      return mockStream;
    }),
    finalMessage: vi.fn().mockResolvedValue({}),
  };
  return {
    default: vi.fn().mockImplementation(function () {
      return {
        messages: {
          stream: vi.fn().mockReturnValue(mockStream),
        },
      };
    }),
  };
});

import { streamClaimSummary } from '../api/v1/Services/summarizeService';

function makeMockRes() {
  const written: string[] = [];
  return {
    setHeader: vi.fn(),
    write: vi.fn((data: string) => { written.push(data); }),
    end: vi.fn(),
    writableEnded: false,
    _written: written,
  };
}

const CLAIM = {
  description: 'Car accident on highway',
  claim_status: 'pending',
  claim_date: '2026-05-01',
  type: 'auto',
  coverage_amount: 25000,
};

describe('streamClaimSummary', () => {
  it('sets SSE headers', async () => {
    const res = makeMockRes();
    await streamClaimSummary(CLAIM, res as any);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
    expect(res.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
  });

  it('writes token data events and a [DONE] terminator', async () => {
    const res = makeMockRes();
    await streamClaimSummary(CLAIM, res as any);
    expect(res._written).toContain('data: Hello \n\n');
    expect(res._written).toContain('data: world.\n\n');
    expect(res._written).toContain('data: [DONE]\n\n');
  });

  it('ends the response', async () => {
    const res = makeMockRes();
    await streamClaimSummary(CLAIM, res as any);
    expect(res.end).toHaveBeenCalled();
  });

  it('writes [ERROR] and ends response when stream throws', async () => {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    // The service creates `const anthropic = new Anthropic()` at module scope (singleton).
    // We cannot replace the constructor after the fact; instead, reach into the already-
    // constructed instance and override its `messages.stream` for this one call.
    const anthropicInstance = vi.mocked(Anthropic).mock.results[0].value as {
      messages: { stream: ReturnType<typeof vi.fn> };
    };
    const failingStream = {
      on: vi.fn().mockReturnThis(),
      finalMessage: vi.fn().mockRejectedValue(new Error('API error')),
    };
    anthropicInstance.messages.stream.mockImplementationOnce(() => failingStream);
    const res = makeMockRes();
    await streamClaimSummary(CLAIM, res as any);
    expect(res._written).toContain('data: [ERROR]\n\n');
    expect(res.end).toHaveBeenCalled();
  });
});

import db from '../api/v1/db/index';
import request from 'supertest';
import app from '../app';

db.query = vi.fn().mockResolvedValue({ rows: [{ count: '0' }] }) as any;
db.checkHealth = vi.fn().mockResolvedValue(undefined) as any;

describe('GET /api/v1/claims/:id/summarize', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/v1/claims/1/summarize');
    expect(res.status).toBe(401);
  });
});
