import { test, expect } from '@playwright/test'
import { AUTH_FILE } from './global-setup'
import { createClient, deleteClient } from './helpers'

test.use({ storageState: AUTH_FILE })
test.describe.configure({ mode: 'serial' })

test.describe('Policies and Claims', () => {
  let clientId: number
  let clientDetailUrl: string

  test.beforeAll(async ({ request }) => {
    // Isolated client so this suite never collides with the clients suite.
    clientId = await createClient(request, {
      name: 'E2E Policy Client',
      date_of_birth: '1980-05-10',
      address: '1 Policy Lane',
      contact: '5554440000',
    })
    clientDetailUrl = `/clients/${clientId}`
  })

  test.afterAll(async ({ request }) => {
    await deleteClient(request, clientId)
  })

  // ── Policies ──────────────────────────────────────────────────────────────

  test('client detail shows Policies section with Add Policy button', async ({ page }) => {
    await page.goto(clientDetailUrl)
    await expect(page.getByRole('heading', { name: 'Policies' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Policy' })).toBeVisible()
    await expect(page.getByText('No policies yet.')).toBeVisible()
  })

  test('creates a new policy and shows it as a card', async ({ page }) => {
    await page.goto(clientDetailUrl)
    await page.getByRole('button', { name: 'Add Policy' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'New Policy' })).toBeVisible()

    await dialog.getByLabel('Policy Type').fill('Health')
    await dialog.getByLabel('Coverage Amount').fill('50000')
    await dialog.getByLabel('Premium').fill('500')
    await dialog.getByLabel('Start Date').fill('2025-01-01')
    await dialog.getByLabel('End Date').fill('2026-01-01')
    await dialog.getByRole('button', { name: 'Save' }).click()

    await expect(dialog).not.toBeVisible()

    // Policy card appears with the type as the card title
    await expect(page.getByRole('heading', { name: 'Health' })).toBeVisible()
    await expect(page.getByText('$50,000')).toBeVisible()
    await expect(page.getByText('$500')).toBeVisible()
  })

  test('edits a policy and reflects updated values', async ({ page }) => {
    await page.goto(clientDetailUrl)

    // The policy card has an Edit button
    const policyCard = page.locator('[data-slot="card"]').filter({ hasText: 'Health' })
    await policyCard.getByRole('button', { name: 'Edit' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: 'Edit Policy' })).toBeVisible()

    await dialog.getByLabel('Policy Type').clear()
    await dialog.getByLabel('Policy Type').fill('Life')
    await dialog.getByRole('button', { name: 'Save' }).click()

    await expect(dialog).not.toBeVisible()
    await expect(page.getByRole('heading', { name: 'Life' })).toBeVisible()
  })

  // ── Claims ─────────────────────────────────────────────────────────────────

  test('creates a claim via the async queue and shows Pending badge', async ({ page }) => {
    await page.goto(clientDetailUrl)

    // Claims section lives inside the policy card
    await page.getByRole('button', { name: 'Add Claim' }).click()

    const sheet = page.getByRole('dialog')
    await expect(sheet.getByRole('heading', { name: 'New Claim' })).toBeVisible()

    await sheet.getByLabel('Description').fill('Routine check-up claim')
    // Status defaults to Pending — leave it
    await sheet.getByLabel('Claim Date').fill('2025-06-01')
    await sheet.getByRole('button', { name: 'Save' }).click()

    // Button shows "Processing…" while BullMQ job runs
    await expect(sheet.getByRole('button', { name: 'Processing…' })).toBeVisible()

    // Sheet closes once job completes (polled every 500 ms)
    await expect(sheet).not.toBeVisible({ timeout: 15_000 })

    // Claim row with Pending badge is now visible
    await expect(page.getByText('Routine check-up claim')).toBeVisible()
    await expect(page.getByText('Pending')).toBeVisible()
  })

  test('edits a claim status and reflects the updated badge', async ({ page }) => {
    await page.goto(clientDetailUrl)

    // Click the Edit button on the claim row
    const claimRow = page.locator('div.rounded-md.border').filter({
      hasText: 'Routine check-up claim',
    })
    await claimRow.getByRole('button', { name: 'Edit' }).click()

    const sheet = page.getByRole('dialog')
    await expect(sheet.getByRole('heading', { name: 'Edit Claim' })).toBeVisible()

    await sheet.locator('select[name="claim_status"]').selectOption('Approved')
    await sheet.getByRole('button', { name: 'Save' }).click()

    await expect(sheet).not.toBeVisible()
    await expect(page.getByText('Approved')).toBeVisible()
  })

  test('deletes a claim via confirmation dialog', async ({ page }) => {
    await page.goto(clientDetailUrl)

    const claimRow = page.locator('div.rounded-md.border').filter({
      hasText: 'Routine check-up claim',
    })
    await expect(claimRow).toBeVisible()

    await claimRow.getByRole('button', { name: 'Delete' }).click()
    const confirm = page.getByRole('dialog')
    await expect(confirm.getByText(/delete claim/i)).toBeVisible()
    await confirm.getByRole('button', { name: 'Delete' }).click()

    await expect(claimRow).not.toBeVisible()
    await expect(page.getByText('No claims yet.')).toBeVisible()
  })
})
