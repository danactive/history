import { test, expect } from '@playwright/test'

test('1 result', async ({ page }) => {
  await page.goto('/demo/all?keyword=gingerbread')
  await expect(page.locator('text=results 1 of 6 for "gingerbread"').first()).toBeVisible()
})

test('Mixed case', async ({ page }) => {
  await page.goto('/demo/all?keyword=Gingerbread')
  await expect(page.locator('text=results 1 of 6 for "Gingerbread"').first()).toBeVisible()
})
