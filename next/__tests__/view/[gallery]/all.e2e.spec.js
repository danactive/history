const { test, expect } = require('@playwright/test')

const HOST_URL = 'http://localhost:3030'

test('0 results', async ({ page }) => {
  await page.goto(`${HOST_URL}/demo/all?keyword=fake`)
  await expect(page.locator('text=results 0 of 6 for "fake"').first()).toBeVisible()
})

test('1 result', async ({ page }) => {
  await page.goto(`${HOST_URL}/demo/all?keyword=gingerbread`)
  await expect(page.locator('text=results 1 of 6 for "gingerbread"').first()).toBeVisible()
})

test('Mixed case', async ({ page }) => {
  await page.goto(`${HOST_URL}/demo/all?keyword=Gingerbread`)
  await expect(page.locator('text=results 1 of 6 for "Gingerbread"').first()).toBeVisible()
})
