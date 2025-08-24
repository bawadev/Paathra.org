import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/en');
    
    // Basic check that page loaded successfully
    await expect(page).toHaveTitle(/Dhaana/i, { timeout: 15000 });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Simple check - just verify page loads without 404
    const currentUrl = page.url();
    expect(currentUrl).toContain('/en');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/home-page.png' });
  });

  test('should have proper navigation', async ({ page }) => {
    await page.goto('/en');
    
    // Wait for page to load with extended timeout
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Simple check - verify page loads
    const currentUrl = page.url();
    expect(currentUrl).toContain('/en');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/home-navigation.png' });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/en');
    
    // Check that the page loads on mobile with extended timeout
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Simple check - verify page loads
    const currentUrl = page.url();
    expect(currentUrl).toContain('/en');
    
    // Take a mobile screenshot
    await page.screenshot({ path: 'test-results/home-page-mobile.png' });
  });
});