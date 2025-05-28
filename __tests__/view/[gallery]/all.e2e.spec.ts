import { test, expect } from '@playwright/test'

const HOST_URL = 'http://localhost:3030'

test.describe('All album', () => {
  test('1 result', async ({ page }) => {
    await page.goto(`${HOST_URL}/demo/all?keyword=gingerbread`)
    await expect(page.locator('text=results 1 of 6 for "gingerbread"').first()).toBeVisible()
  })

  test('Mixed case', async ({ page }) => {
    await page.goto(`${HOST_URL}/demo/all?keyword=Gingerbread`)
    await expect(page.locator('text=results 1 of 6 for "Gingerbread"').first()).toBeVisible()
  })
})

test.describe('Admin > Walk', () => {
  test('Filesystem list', async ({ page }) => {
    await page.goto(`${HOST_URL}/admin/walk?path=/galleries/demo/media`)
    await expect(page.locator('li').filter({ hasText: 'photos' })).toBeVisible()
    await expect(page.locator('li').filter({ hasText: 'thumbs' })).toBeVisible()
    await expect(page.locator('li').filter({ hasText: 'videos' })).toBeVisible()
  })
})
