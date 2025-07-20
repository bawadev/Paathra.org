import { test, expect } from '@playwright/test';

test.describe('Monasteries Pages', () => {
  test('should load monasteries page', async ({ page }) => {
    await page.goto('/monasteries');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded successfully
    expect(page.url()).toContain('/monasteries');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/monasteries-page.png' });
  });

  test('should handle navigation between different monastery views', async ({ page }) => {
    // Test different monastery page variations if they exist
    const pages = ['/monasteries'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Check for any error messages
      const errorText = await page.textContent('body');
      expect(errorText).not.toContain('Error');
      expect(errorText).not.toContain('404');
    }
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/monasteries');
    await page.waitForLoadState('networkidle');
    
    // Check for basic accessibility features
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    if (await headings.count() > 0) {
      await expect(headings.first()).toBeVisible();
    }
    
    // Check for proper document structure
    await expect(page.locator('main, [role="main"]')).toBeVisible();
  });
});
