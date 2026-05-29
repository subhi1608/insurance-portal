import { request as playwrightRequest } from '@playwright/test'
import path from 'path'
import fs from 'fs'

export const AUTH_FILE = path.join(__dirname, '.auth', 'user.json')
export const TEST_EMAIL = 'e2e-test@insurance.local'
export const TEST_PASSWORD = 'E2eTestPass99!'

const BASE = 'http://localhost:8000'

/**
 * Use Playwright's API request context (not a browser) to:
 *  1. Create the test user via /auth/signin  (idempotent — db.createUser does DELETE+INSERT)
 *  2. Log in via /auth/login  →  captures the httpOnly refreshToken Set-Cookie header
 *  3. Persist the cookie jar to .auth/user.json
 *
 * Every spec that calls `test.use({ storageState: AUTH_FILE })` will start
 * with the refresh cookie already set, so ProtectedRoute auto-authenticates
 * on page load without a UI login round-trip.
 */
export default async function globalSetup() {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

  const ctx = await playwrightRequest.newContext({ baseURL: BASE })

  // Step 1 — ensure the test user exists.
  // createUser internally does DELETE then INSERT, so this is safe to call
  // on every run regardless of whether the account already exists.
  const signupRes = await ctx.post('/api/v1/auth/signin', {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  })
  if (!signupRes.ok()) {
    const body = await signupRes.json().catch(() => ({}))
    throw new Error(
      `global-setup: /auth/signin failed ${signupRes.status()} — ${JSON.stringify(body)}`,
    )
  }

  // Step 2 — login so we get the httpOnly refreshToken cookie.
  const loginRes = await ctx.post('/api/v1/auth/login', {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  })
  if (!loginRes.ok()) {
    const body = await loginRes.json().catch(() => ({}))
    throw new Error(
      `global-setup: /auth/login failed ${loginRes.status()} — ${JSON.stringify(body)}`,
    )
  }

  // Step 3 — persist the cookie jar (contains the Set-Cookie refreshToken).
  // Browser test fixtures that use storageState: AUTH_FILE will start with
  // this cookie pre-loaded.
  await ctx.storageState({ path: AUTH_FILE })
  await ctx.dispose()
}
