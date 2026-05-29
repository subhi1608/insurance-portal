import { test, expect } from '@playwright/test'
import { TEST_EMAIL, TEST_PASSWORD } from './global-setup'

// Auth tests run WITHOUT saved auth state — they test the auth flow itself.

test.describe('Authentication', () => {
  test('unauthenticated visit to / redirects to /login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('unauthenticated visit to /clients redirects to /login', async ({ page }) => {
    await page.goto('/clients')
    await expect(page).toHaveURL(/\/login/)
  })

  test('invalid credentials show an error alert', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('nobody@nowhere.example')
    await page.getByLabel('Password').fill('definitelywrong')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  })

  test('valid credentials log in and land on /clients', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(TEST_EMAIL)
    await page.getByLabel('Password').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/clients/)
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible()
  })

  test('signup form enforces minimum password length', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Create one' }).click()
    await page.getByLabel('Email').fill('newuser@example.com')
    await page.getByLabel('Password').fill('short') // < 8 chars
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(
      page.getByText('Password must be at least 8 characters'),
    ).toBeVisible()
    // Should NOT navigate away
    await expect(page).toHaveURL(/\/login/)
  })
})
