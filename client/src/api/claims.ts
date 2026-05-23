import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Claim } from '@/types'

interface PagedResponse<T> {
  data: T[]
  meta: { page: number; limit: number; total: number }
}

export function useClaims(policyId: number) {
  return useQuery({
    queryKey: ['claims', policyId],
    enabled: !Number.isNaN(policyId),
    queryFn: async () => {
      const { data } = await api.get<PagedResponse<Claim>>('/claims', {
        params: { policy_id: policyId, limit: 100 },
      })
      return data.data
    },
  })
}

export function useCreateClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { policyId: number; description: string; claim_status: string; claim_date: string }) => {
      const { data } = await api.post<{ data: { id: number } }>('/claims', {
        insurance_policy_id: input.policyId,
        description: input.description,
        claim_status: input.claim_status,
        claim_date: input.claim_date,
      })
      return data.data.id
    },
    onSuccess: (_id, variables) => qc.invalidateQueries({ queryKey: ['claims', variables.policyId] }),
  })
}

export function useUpdateClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: number; policyId: number; description: string; claim_status: string; claim_date: string }) => {
      await api.put(`/claims/${input.id}`, {
        insurance_policy_id: input.policyId,
        description: input.description,
        claim_status: input.claim_status,
        claim_date: input.claim_date,
      })
    },
    onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['claims', variables.policyId] }),
  })
}

export function useDeleteClaim() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: number; policyId: number }) => {
      await api.delete(`/claims/${id}`)
    },
    onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['claims', variables.policyId] }),
  })
}
