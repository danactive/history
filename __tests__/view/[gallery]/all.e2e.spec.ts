import { test, expect } from '@playwright/test'

test('server is up and renders homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/History app/i)
})

test.describe('All album', () => {
  test('shows expected count for lowercase keyword', async ({ page }) => {
    await page.goto('/demo/all?keyword=gingerbread')
    await expect(
      page.getByRole('heading', { name: /search results 1 of 6 for "gingerbread"/i }),
    ).toBeVisible()
  })

  test('shows expected count for mixed-case keyword', async ({ page }) => {
    await page.goto('/demo/all?keyword=Gingerbread')
    await expect(
      page.getByRole('heading', { name: /search results 1 of 6 for "Gingerbread"/i }),
    ).toBeVisible()
  })

  test('renders keyword chip and allows token clear', async ({ page }) => {
    await page.goto('/demo/all?keyword=gingerbread')

    await expect(page.getByText('gingerbread').first()).toBeVisible()
    await page.getByRole('button', { name: /remove keyword token gingerbread/i }).click()

    await expect(
      page.getByRole('heading', { name: /search results 6 of 6/i }),
    ).toBeVisible()
  })
})

test.describe('Admin > Walk', () => {
  test('shows key media folders', async ({ page }) => {
    await page.goto('/admin/walk/galleries/demo/media')
    await expect(page.getByRole('link', { name: 'photos' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'thumbs' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'videos' })).toBeVisible()
  })
})
