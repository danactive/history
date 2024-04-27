import { test, expect } from '@playwright/test'

test('H1', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('List of Galleries').first()).toBeVisible()
})

test('Demo gallery', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTitle('demo gallery').first()).toBeVisible()
})
