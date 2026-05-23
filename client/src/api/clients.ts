import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Client, ClientInput } from '@/types'

interface PagedResponse<T> {
  data: T[]
  meta: { page: number; limit: number; total: number }
}

export function useClients(page: number, limit = 20) {
  return useQuery({
    queryKey: ['clients', page, limit],
    queryFn: async () => {
      const { data } = await api.get<PagedResponse<Client>>('/clients', {
        params: { page, limit },
      })
      return data
    },
  })
}

export function useClient(id: number) {
  return useQuery({
    queryKey: ['clients', id],
    enabled: !Number.isNaN(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Client }>(`/clients/${id}`)
      return data.data
    },
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: ClientInput) => {
      const { data } = await api.post<{ data: { id: number } }>('/clients', input)
      return data.data.id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: ClientInput }) => {
      await api.put(`/clients/${id}`, input)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/clients/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}
