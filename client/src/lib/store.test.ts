import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './store'

describe('useAuthStore', () => {
  beforeEach(() => useAuthStore.setState({ accessToken: null }))

  it('starts with null token', () => {
    expect(useAuthStore.getState().accessToken).toBeNull()
  })

  it('setToken updates the token', () => {
    useAuthStore.getState().setToken('abc123')
    expect(useAuthStore.getState().accessToken).toBe('abc123')
  })

  it('clearToken resets to null', () => {
    useAuthStore.getState().setToken('abc123')
    useAuthStore.getState().clearToken()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
