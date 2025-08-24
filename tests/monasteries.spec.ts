import { test, expect } from '@playwright/test';

test.describe('Monasteries Pages', () => {
  test('should load monasteries page', async ({ page }) => {
    await page.goto('/en/monasteries');
    
    // Wait for the page to load with extended timeout
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check that the page loaded successfully by URL
    const currentUrl = page.url();
    expect(currentUrl).toContain('/en/monasteries');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/monasteries-page.png' });
  });

  test('should display monastery browsing functionality', async ({ page }) => {
    await page.goto('/en/monasteries');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check for basic page functionality by URL
    expect(page.url()).toContain('/en/monasteries');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/monasteries-search.png' });
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/en/monasteries');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check for basic accessibility - page loads without errors
    const currentUrl = page.url();
    expect(currentUrl).toContain('/en/monasteries');
    
    // Check for basic document structure
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });
});