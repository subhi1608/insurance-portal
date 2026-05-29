import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api/v1/cache/redisCache', () => ({
  get: vi.fn().mockResolvedValue(null),
  set: vi.fn().mockResolvedValue(undefined),
  invalidate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../api/v1/db/index', () => ({
  default: {
    query: vi.fn().mockResolvedValue({ rows: [{ count: '0' }] }),
    checkHealth: vi.fn().mockResolvedValue(undefined),
  },
}));

import * as cache from '../api/v1/cache/redisCache';
import policyService from '../api/v1/Services/policyService';

describe('policyService cache behaviour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cache.get).mockResolvedValue(null);
    vi.mocked(cache.set).mockResolvedValue(undefined);
    vi.mocked(cache.invalidate).mockResolvedValue(undefined);
  });

  describe('getAllPolicies', () => {
    it('returns cached result on cache hit (no clientId)', async () => {
      const cached = JSON.stringify({ rows: [], total: 0 });
      vi.mocked(cache.get).mockResolvedValue(cached);

      const result = await policyService.getAllPolicies(1, 20);

      expect(cache.get).toHaveBeenCalledWith('policies:page:1:limit:20:clientId:none');
      expect(result).toEqual({ rows: [], total: 0 });
    });

    it('uses clientId in cache key when provided', async () => {
      await policyService.getAllPolicies(1, 20, 5);
      expect(cache.get).toHaveBeenCalledWith('policies:page:1:limit:20:clientId:5');
    });

    it('stores result in cache on miss', async () => {
      vi.mocked(cache.get).mockResolvedValue(null);
      await policyService.getAllPolicies(1, 20);
      expect(cache.set).toHaveBeenCalledWith(
        'policies:page:1:limit:20:clientId:none',
        expect.any(String),
        60
      );
    });
  });

  describe('createPolicy', () => {
    it('invalidates policies cache after creating', async () => {
      await policyService.createPolicy({
        client_id: 1, type: 'health', coverage_amount: 1000,
        premium: 100, start_date: '2026-01-01', end_date: '2027-01-01',
      });
      expect(cache.invalidate).toHaveBeenCalledWith('policies:*');
    });
  });

  describe('updatePolicy', () => {
    it('invalidates policies cache after updating', async () => {
      await policyService.updatePolicy(1, {
        type: 'health', coverage_amount: 1000,
        premium: 100, start_date: '2026-01-01', end_date: '2027-01-01',
      });
      expect(cache.invalidate).toHaveBeenCalledWith('policies:*');
    });
  });

  describe('deletePolicy', () => {
    it('invalidates policies cache after deleting', async () => {
      await policyService.deletePolicy(1);
      expect(cache.invalidate).toHaveBeenCalledWith('policies:*');
    });
  });
});
