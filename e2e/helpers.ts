import type { APIRequestContext } from '@playwright/test'

// All API calls go through the Vite proxy so the same cookies apply.
const API = 'http://localhost:5173/api/v1'

/**
 * Exchange the httpOnly refresh cookie for a short-lived access token.
 * The request context must carry the saved storageState cookies.
 */
export async function getToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API}/auth/refresh`)
  const json = await res.json()
  return json.data.accessToken
}

export interface ClientPayload {
  name: string
  date_of_birth: string
  address: string
  contact: string
}

/** Create a client directly via API — use in beforeAll for shared test data. */
export async function createClient(
  request: APIRequestContext,
  payload: ClientPayload,
): Promise<number> {
  const token = await getToken(request)
  const res = await request.post(`${API}/clients`, {
    data: payload,
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  return json.data.id as number
}

/** Delete a client (cascades to policies and claims). */
export async function deleteClient(
  request: APIRequestContext,
  id: number,
): Promise<void> {
  const token = await getToken(request)
  await request.delete(`${API}/clients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

/** A stable test client used across all non-destructive specs. */
export const SHARED_CLIENT: ClientPayload = {
  name: 'E2E Shared Client',
  date_of_birth: '1990-01-15',
  address: '123 Test Street, Test City',
  contact: '5550001234',
}
