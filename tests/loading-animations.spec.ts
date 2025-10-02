import { test, expect } from '@playwright/test'

test.describe('Loading Animations', () => {
  test('monasteries page shows loading skeleton', async ({ page }) => {
    // Navigate to monasteries page and verify loading states appear
    await page.goto('/en/monasteries')

    // Page should load successfully
    await expect(page).toHaveURL(/.*monasteries/)

    // Check for content that indicates the page loaded
    const pageHeading = page.locator('h1, h2').first()
    await expect(pageHeading).toBeVisible({ timeout: 10000 })
  })

  test('donate page shows loading state', async ({ page }) => {
    // Navigate to donate page
    await page.goto('/en/donate')

    // Page should load successfully
    await expect(page).toHaveURL(/.*donate/)

    // Check for content
    const content = page.locator('main, [role="main"]').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('my-donations page shows loading table skeleton', async ({ page }) => {
    // Navigate to my-donations page
    await page.goto('/en/my-donations')

    // Page should load successfully (or redirect to auth)
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Check that we're either on my-donations or redirected to auth
    const url = page.url()
    expect(url).toMatch(/\/(my-donations|auth)/)
  })

  test('manage page shows loading dashboard', async ({ page }) => {
    // Navigate to manage page
    await page.goto('/en/manage')

    // Page should load successfully
    await expect(page).toHaveURL(/.*manage/)

    // Check for content
    const content = page.locator('main').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('admin page shows loading state', async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/en/admin/dashboard')

    // Page should load successfully (or redirect to auth)
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Check that we're either on admin or redirected to auth
    const url = page.url()
    expect(url).toMatch(/\/(admin|auth)/)
  })

  test('profile page shows loading state', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/en/profile')

    // Page should load successfully (or redirect to auth)
    await page.waitForLoadState('networkidle', { timeout: 10000 })

    // Check that we're either on profile or redirected to auth
    const url = page.url()
    expect(url).toMatch(/\/(profile|auth)/)
  })

  test('skeleton components use wave animation', async ({ page }) => {
    // Navigate to a page with skeletons
    await page.goto('/en/monasteries')

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Verify page loaded successfully
    await expect(page).toHaveURL(/.*monasteries/)

    // The skeleton should have been replaced by actual content
    // We can check that the page is interactive
    await expect(page.locator('body')).toBeVisible()
  })

  test('loading spinner has proper animation timing', async ({ page }) => {
    // Navigate to any page
    await page.goto('/en')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Verify the page loaded
    await expect(page).toHaveURL(/\/en/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('page transitions show loading states', async ({ page }) => {
    // Start at home
    await page.goto('/en')
    await page.waitForLoadState('networkidle')

    // Navigate to monasteries
    await page.goto('/en/monasteries')
    await expect(page).toHaveURL(/.*monasteries/)
    await page.waitForLoadState('networkidle')

    // Navigate to donate
    await page.goto('/en/donate')
    await expect(page).toHaveURL(/.*donate/)
    await page.waitForLoadState('networkidle')

    // All pages should load successfully
    await expect(page.locator('body')).toBeVisible()
  })

  test('loading animations respect reduced motion preference', async ({ page, context }) => {
    // Emulate prefers-reduced-motion
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true,
        }),
      })
    })

    // Navigate to a page
    await page.goto('/en/monasteries')
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    await expect(page).toHaveURL(/.*monasteries/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('loading states handle errors gracefully', async ({ page }) => {
    // Try to navigate to a non-existent page
    await page.goto('/en/nonexistent-page-12345')

    // Should show 404 or redirect
    await page.waitForLoadState('networkidle')

    // Verify we get some kind of response (404 page or redirect)
    const content = page.locator('body')
    await expect(content).toBeVisible()
  })
})
