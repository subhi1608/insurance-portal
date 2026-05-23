import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { api } from '@/lib/axios'
import { useAuthStore } from '@/lib/store'
import { queryClient } from '@/lib/queryClient'

export async function refresh(): Promise<string> {
  const { data } = await axios.post<{ data: { accessToken: string } }>(
    '/api/v1/auth/refresh', {}, { withCredentials: true }
  )
  return data.data.accessToken
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<{ data: { accessToken: string } }>('/auth/login', credentials)
      return data.data.accessToken
    },
    onSuccess: (token) => useAuthStore.getState().setToken(token),
  })
}

export function useSignIn() {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post<{ data: { accessToken: string } }>('/auth/signin', credentials)
      return data.data.accessToken
    },
    onSuccess: (token) => useAuthStore.getState().setToken(token),
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => {
      useAuthStore.getState().clearToken()
      queryClient.clear()
      window.location.replace('/login')
    },
  })
}
