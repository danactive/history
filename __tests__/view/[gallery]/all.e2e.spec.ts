import { test, expect } from '@playwright/test'

test('server is up and renders homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/History app/i)
})

test.describe('All album', () => {
  test('1 result', async ({ page }) => {
    await page.goto('/demo/all?keyword=gingerbread')
    await expect(page.locator('text=results 1 of 6 for "gingerbread"').first()).toBeVisible()
  })

  test('Mixed case', async ({ page }) => {
    await page.goto('/demo/all?keyword=Gingerbread')
    await expect(page.locator('text=results 1 of 6 for "Gingerbread"').first()).toBeVisible()
  })
})

test.describe('Admin > Walk', () => {
  test('Filesystem list', async ({ page }) => {
    await page.goto('/admin/walk/galleries/demo/media')
    await expect(page.locator('li').filter({ hasText: 'photos' })).toBeVisible()
    await expect(page.locator('li').filter({ hasText: 'thumbs' })).toBeVisible()
    await expect(page.locator('li').filter({ hasText: 'videos' })).toBeVisible()
  })
})
