import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

vi.mock('ioredis', () => {
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn(),
    scan: vi.fn(),
    del: vi.fn(),
    on: vi.fn(),
  };
  return {
    default: vi.fn().mockImplementation(function () { return mockRedis; }),
    __mockRedis: mockRedis,
  };
});

import Redis from 'ioredis';
import * as cache from '../api/v1/cache/redisCache';

describe('redisCache', () => {
  // The module-level `new Redis(...)` in redisCache.ts fires on import.
  // Capture the returned mock instance once before any clearAllMocks calls.
  let mockRedis: {
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    scan: ReturnType<typeof vi.fn>;
    del: ReturnType<typeof vi.fn>;
    on: ReturnType<typeof vi.fn>;
  };

  beforeAll(() => {
    // mock.results[0].value is the object returned by our mockImplementation function
    mockRedis = vi.mocked(Redis).mock.results[0]?.value;
  });

  beforeEach(() => {
    // Reset call history without wiping mock.results (which we've already captured)
    mockRedis.get.mockReset();
    mockRedis.set.mockReset();
    mockRedis.scan.mockReset();
    mockRedis.del.mockReset();
    mockRedis.on.mockReset();
  });

  describe('get', () => {
    it('returns cached string when key exists', async () => {
      mockRedis.get.mockResolvedValue('{"rows":[],"total":0}');
      const result = await cache.get('clients:page:1:limit:20');
      expect(result).toBe('{"rows":[],"total":0}');
    });

    it('returns null when key does not exist', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await cache.get('missing-key');
      expect(result).toBeNull();
    });

    it('returns null on Redis error (non-fatal)', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis down'));
      const result = await cache.get('clients:page:1:limit:20');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('stores value with TTL', async () => {
      mockRedis.set.mockResolvedValue('OK');
      await cache.set('clients:page:1:limit:20', '{"rows":[]}', 60);
      expect(mockRedis.set).toHaveBeenCalledWith(
        'clients:page:1:limit:20',
        '{"rows":[]}',
        'EX',
        60
      );
    });

    it('does not throw on Redis error', async () => {
      mockRedis.set.mockRejectedValue(new Error('Redis down'));
      await expect(cache.set('key', 'val', 60)).resolves.toBeUndefined();
    });
  });

  describe('invalidate', () => {
    it('scans and deletes matching keys', async () => {
      mockRedis.scan
        .mockResolvedValueOnce(['0', ['clients:page:1:limit:20', 'clients:page:2:limit:20']]);
      mockRedis.del.mockResolvedValue(2);

      await cache.invalidate('clients:*');

      expect(mockRedis.scan).toHaveBeenCalledWith('0', 'MATCH', 'clients:*', 'COUNT', 100);
      expect(mockRedis.del).toHaveBeenCalledWith(
        'clients:page:1:limit:20',
        'clients:page:2:limit:20'
      );
    });

    it('does nothing when no keys match', async () => {
      mockRedis.scan.mockResolvedValueOnce(['0', []]);
      await cache.invalidate('clients:*');
      expect(mockRedis.del).not.toHaveBeenCalled();
    });

    it('does not throw on Redis error', async () => {
      mockRedis.scan.mockRejectedValue(new Error('Redis down'));
      await expect(cache.invalidate('clients:*')).resolves.toBeUndefined();
    });
  });
});
