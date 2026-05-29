import { defineConfig, devices } from '@playwright/test'
import path from 'path'

export const AUTH_FILE = path.join(__dirname, 'e2e', '.auth', 'user.json')

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  // Tests share a real DB — serial prevents data collisions
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  globalSetup: './e2e/global-setup.ts',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Assumes both dev servers are already running (npm run dev at root).
  // Set reuseExistingServer: false and add start commands for full CI.
  webServer: [
    {
      command: 'npm run dev --prefix server',
      url: 'http://localhost:8000/health',
      reuseExistingServer: true,
      timeout: 30_000,
    },
    {
      command: 'npm run dev --prefix client',
      url: 'http://localhost:5173',
      reuseExistingServer: true,
      timeout: 30_000,
    },
  ],
})
