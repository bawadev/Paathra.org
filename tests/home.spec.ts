import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Dhaana/i);
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'test-results/home-page.png' });
  });

  test('should have proper navigation', async ({ page }) => {
    await page.goto('/');
    
    // Wait for navigation to be loaded
    await page.waitForSelector('nav', { timeout: 10000 });
    
    // Check if navigation is visible
    const navigation = page.locator('nav');
    await expect(navigation).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that the page loads on mobile
    await page.waitForLoadState('networkidle');
    
    // Take a mobile screenshot
    await page.screenshot({ path: 'test-results/home-page-mobile.png' });
  });
});
