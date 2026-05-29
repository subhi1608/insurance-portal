import { test, expect } from '@playwright/test'
import { AUTH_FILE } from './global-setup'
import { createClient, deleteClient, SHARED_CLIENT } from './helpers'

test.use({ storageState: AUTH_FILE })

// Run serially — each test mutates shared DB state.
test.describe.configure({ mode: 'serial' })

test.describe('Clients CRUD', () => {
  let sharedClientId: number

  // Create one client via API before the suite so read-only tests have data.
  test.beforeAll(async ({ request }) => {
    sharedClientId = await createClient(request, SHARED_CLIENT)
  })

  test.afterAll(async ({ request }) => {
    await deleteClient(request, sharedClientId)
  })

  test('clients page loads with expected layout', async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'New Client' })).toBeVisible()
    // Table headers
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Contact' })).toBeVisible()
  })

  test('creates a new client and shows it in the table', async ({ page }) => {
    const name = `E2E-Create-${Date.now()}`
    let createdId: number | undefined

    await page.goto('/clients')
    await page.getByRole('button', { name: 'New Client' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'New Client' })).toBeVisible()

    await dialog.getByLabel('Name').fill(name)
    await dialog.getByLabel('Date of Birth').fill('1985-06-20')
    await dialog.getByLabel('Address').fill('99 Playwright Ave')
    await dialog.getByLabel('Contact').fill('5559998888')
    await dialog.getByRole('button', { name: 'Save' }).click()

    // Dialog closes and new row appears
    await expect(dialog).not.toBeVisible()
    const row = page.getByRole('row').filter({ hasText: name })
    await expect(row).toBeVisible()
    await expect(row.getByRole('cell', { name: '5559998888' })).toBeVisible()

    // Cleanup: delete via the row's Delete button
    await row.getByRole('button', { name: 'Delete' }).click()
    const confirm = page.getByRole('dialog')
    await expect(confirm).toBeVisible()
    await confirm.getByRole('button', { name: 'Delete' }).click()
    await expect(row).not.toBeVisible()
  })

  test('filter input narrows visible rows', async ({ page }) => {
    await page.goto('/clients')

    // Ensure our shared client is visible before filtering
    await expect(
      page.getByRole('row').filter({ hasText: SHARED_CLIENT.name }),
    ).toBeVisible()

    // Filter to the shared client name
    await page.getByPlaceholder(/filter this page/i).fill(SHARED_CLIENT.name)
    await expect(
      page.getByRole('row').filter({ hasText: SHARED_CLIENT.name }),
    ).toBeVisible()

    // Filter to something that matches nothing in our data
    await page.getByPlaceholder(/filter this page/i).fill('zzzzznosuchthing')
    await expect(page.getByText('No clients found.')).toBeVisible()
  })

  test('clicking a row navigates to the client detail page', async ({ page }) => {
    await page.goto('/clients')

    const row = page.getByRole('row').filter({ hasText: SHARED_CLIENT.name })
    await expect(row).toBeVisible()
    await row.click()

    await expect(page).toHaveURL(/\/clients\/\d+/)
    await expect(page.getByRole('heading', { name: SHARED_CLIENT.name })).toBeVisible()
    // Back button and Edit/Delete are present
    await expect(page.getByRole('button', { name: '← Back' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
  })

  test('edits a client and reflects the updated name in the list', async ({ page }) => {
    const updatedName = `E2E-Edited-${Date.now()}`

    await page.goto('/clients')
    const row = page.getByRole('row').filter({ hasText: SHARED_CLIENT.name })
    await row.getByRole('button', { name: 'Edit' }).click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel('Name').clear()
    await dialog.getByLabel('Name').fill(updatedName)
    await dialog.getByRole('button', { name: 'Save' }).click()

    await expect(dialog).not.toBeVisible()
    await expect(
      page.getByRole('row').filter({ hasText: updatedName }),
    ).toBeVisible()

    // Restore original name so afterAll cleanup works
    const editedRow = page.getByRole('row').filter({ hasText: updatedName })
    await editedRow.getByRole('button', { name: 'Edit' }).click()
    const restoreDialog = page.getByRole('dialog')
    await restoreDialog.getByLabel('Name').clear()
    await restoreDialog.getByLabel('Name').fill(SHARED_CLIENT.name)
    await restoreDialog.getByRole('button', { name: 'Save' }).click()
    await expect(restoreDialog).not.toBeVisible()
  })

  test('deletes a client via confirmation dialog', async ({ page }) => {
    const name = `E2E-Delete-${Date.now()}`
    await page.goto('/clients')

    // Create via UI
    await page.getByRole('button', { name: 'New Client' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByLabel('Name').fill(name)
    await dialog.getByLabel('Date of Birth').fill('1992-03-10')
    await dialog.getByLabel('Address').fill('Delete Road')
    await dialog.getByLabel('Contact').fill('5551112222')
    await dialog.getByRole('button', { name: 'Save' }).click()
    await expect(dialog).not.toBeVisible()

    const row = page.getByRole('row').filter({ hasText: name })
    await expect(row).toBeVisible()

    // Delete via confirmation dialog
    await row.getByRole('button', { name: 'Delete' }).click()
    const confirmDialog = page.getByRole('dialog')
    await expect(confirmDialog.getByText(/delete client/i)).toBeVisible()
    await confirmDialog.getByRole('button', { name: 'Delete' }).click()

    // Row is gone from the table
    await expect(row).not.toBeVisible()
  })
})
