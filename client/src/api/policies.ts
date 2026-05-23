import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Policy } from '@/types'

interface PagedResponse<T> {
  data: T[]
  meta: { page: number; limit: number; total: number }
}

export function usePolicies(clientId: number) {
  return useQuery({
    queryKey: ['policies', clientId],
    enabled: !Number.isNaN(clientId),
    queryFn: async () => {
      const { data } = await api.get<PagedResponse<Policy>>('/policies', {
        params: { client_id: clientId, limit: 100 },
      })
      return data.data
    },
  })
}

export function useCreatePolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { clientId: number; type: string; coverage_amount: number; premium: number; start_date: string; end_date: string }) => {
      const { data } = await api.post<{ data: { id: number } }>('/policies', {
        client_id: input.clientId,
        type: input.type,
        coverage_amount: input.coverage_amount,
        premium: input.premium,
        start_date: input.start_date,
        end_date: input.end_date,
      })
      return data.data.id
    },
    onSuccess: (_id, variables) => qc.invalidateQueries({ queryKey: ['policies', variables.clientId] }),
  })
}

export function useUpdatePolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { id: number; clientId: number; type: string; coverage_amount: number; premium: number; start_date: string; end_date: string }) => {
      await api.put(`/policies/${input.id}`, {
        type: input.type,
        coverage_amount: input.coverage_amount,
        premium: input.premium,
        start_date: input.start_date,
        end_date: input.end_date,
      })
    },
    onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['policies', variables.clientId] }),
  })
}

export function useDeletePolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: number; clientId: number }) => {
      await api.delete(`/policies/${id}`)
    },
    onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['policies', variables.clientId] }),
  })
}
