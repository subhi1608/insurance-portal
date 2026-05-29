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
import clientService from '../api/v1/Services/clientService';

describe('clientService cache behaviour', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(cache.get).mockResolvedValue(null);
    vi.mocked(cache.set).mockResolvedValue(undefined);
    vi.mocked(cache.invalidate).mockResolvedValue(undefined);
  });

  describe('getAllClients', () => {
    it('returns cached result without hitting DB on cache hit', async () => {
      const cached = JSON.stringify({ rows: [{ id: 1, name: 'Alice' }], total: 1 });
      vi.mocked(cache.get).mockResolvedValue(cached);

      const result = await clientService.getAllClients(1, 20);

      expect(cache.get).toHaveBeenCalledWith('clients:page:1:limit:20');
      expect(result).toEqual({ rows: [{ id: 1, name: 'Alice' }], total: 1 });
    });

    it('stores result in cache on miss', async () => {
      vi.mocked(cache.get).mockResolvedValue(null);

      await clientService.getAllClients(1, 20);

      expect(cache.set).toHaveBeenCalledWith(
        'clients:page:1:limit:20',
        expect.any(String),
        60
      );
    });
  });

  describe('createClient', () => {
    it('invalidates clients cache after creating', async () => {
      await clientService.createClient({ name: 'Bob', date_of_birth: '', address: '', contact: '' });
      expect(cache.invalidate).toHaveBeenCalledWith('clients:*');
    });
  });

  describe('updateClient', () => {
    it('invalidates clients cache after updating', async () => {
      await clientService.updateClient(1, { name: 'Bob', date_of_birth: '', address: '', contact: '' });
      expect(cache.invalidate).toHaveBeenCalledWith('clients:*');
    });
  });

  describe('deleteClient', () => {
    it('invalidates clients cache after deleting', async () => {
      await clientService.deleteClient(1);
      expect(cache.invalidate).toHaveBeenCalledWith('clients:*');
    });
  });
});
