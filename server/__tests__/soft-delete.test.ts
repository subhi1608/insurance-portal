import { describe, it, expect, vi, beforeEach } from 'vitest';
import db from '../api/v1/db/index';
import clientDb from '../api/v1/db/client';
import policyDb from '../api/v1/db/policy';
import claimDb from '../api/v1/db/policyclaim';

db.query = vi.fn().mockResolvedValue({ rows: [{ count: '0' }] } as any) as any;

describe('Soft delete enforcement', () => {
  beforeEach(() => {
    vi.mocked(db.query).mockClear();
    vi.mocked(db.query).mockResolvedValue({ rows: [{ count: '0' }] } as any);
  });

  describe('getAllClients', () => {
    it('filters by deleted_at IS NULL', async () => {
      await clientDb.getAllClients(1, 20);
      const calls = vi.mocked(db.query).mock.calls;
      calls.forEach(([sql]) => {
        expect(sql as string).toContain('deleted_at IS NULL');
      });
    });
  });

  describe('getClientById', () => {
    it('filters by deleted_at IS NULL', async () => {
      await clientDb.getClientById(1);
      const [sql] = vi.mocked(db.query).mock.calls[0];
      expect(sql as string).toContain('deleted_at IS NULL');
    });
  });

  describe('deleteClient', () => {
    it('uses UPDATE SET deleted_at instead of DELETE FROM client', async () => {
      await clientDb.deleteClient(1);
      const sqlStrings = vi.mocked(db.query).mock.calls.map(([sql]) => sql as string);
      expect(sqlStrings.some(s => s.includes('DELETE FROM client'))).toBe(false);
      expect(sqlStrings.some(s => s.includes('SET deleted_at = NOW()'))).toBe(true);
    });
  });

  describe('getPolicyById', () => {
    it('filters by deleted_at IS NULL', async () => {
      await policyDb.getPolicyById(1);
      const [sql] = vi.mocked(db.query).mock.calls[0];
      expect(sql as string).toContain('deleted_at IS NULL');
    });
  });

  describe('getAllPolicies', () => {
    it('filters by deleted_at IS NULL (no clientId)', async () => {
      await policyDb.getAllPolicies(1, 20);
      const calls = vi.mocked(db.query).mock.calls;
      calls.forEach(([sql]) => {
        expect(sql as string).toContain('deleted_at IS NULL');
      });
    });

    it('filters by deleted_at IS NULL (with clientId)', async () => {
      await policyDb.getAllPolicies(1, 20, 5);
      const calls = vi.mocked(db.query).mock.calls;
      calls.forEach(([sql]) => {
        expect(sql as string).toContain('deleted_at IS NULL');
      });
    });
  });

  describe('deletePolicy', () => {
    it('uses UPDATE SET deleted_at instead of DELETE FROM insurance_policy', async () => {
      await policyDb.deletePolicy(1);
      const sqlStrings = vi.mocked(db.query).mock.calls.map(([sql]) => sql as string);
      expect(sqlStrings.some(s => s.includes('DELETE FROM insurance_policy'))).toBe(false);
      expect(sqlStrings.some(s => s.includes('SET deleted_at = NOW()'))).toBe(true);
    });
  });

  describe('getAllClaims', () => {
    it('filters by deleted_at IS NULL (no policyId)', async () => {
      await claimDb.getAllClaims(1, 20);
      const calls = vi.mocked(db.query).mock.calls;
      calls.forEach(([sql]) => {
        expect(sql as string).toContain('deleted_at IS NULL');
      });
    });

    it('filters by deleted_at IS NULL (with policyId)', async () => {
      await claimDb.getAllClaims(1, 20, 3);
      const calls = vi.mocked(db.query).mock.calls;
      calls.forEach(([sql]) => {
        expect(sql as string).toContain('deleted_at IS NULL');
      });
    });
  });

  describe('getSingleClaim', () => {
    it('filters by deleted_at IS NULL', async () => {
      await claimDb.getSingleClaim(1);
      const [sql] = vi.mocked(db.query).mock.calls[0];
      expect(sql as string).toContain('deleted_at IS NULL');
    });
  });

  describe('deleteClaim', () => {
    it('uses UPDATE SET deleted_at instead of DELETE FROM insurance_claim', async () => {
      await claimDb.deleteClaim(1);
      const sqlStrings = vi.mocked(db.query).mock.calls.map(([sql]) => sql as string);
      expect(sqlStrings.some(s => s.includes('DELETE FROM insurance_claim'))).toBe(false);
      expect(sqlStrings.some(s => s.includes('SET deleted_at = NOW()'))).toBe(true);
    });
  });
});
