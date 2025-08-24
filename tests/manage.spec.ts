import { test, expect } from '@playwright/test';

test.describe('Management Pages', () => {
  test('should load manage page', async ({ page }) => {
    await page.goto('/en/manage');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check current URL and handle redirects
    const currentUrl = page.url();
    const bodyText = await page.textContent('body');
    
    if (currentUrl.includes('/auth')) {
      // If redirected to auth, check for auth form elements
      expect(bodyText).toMatch(/sign in|create account|login/i);
      console.log('Manage page: Successfully redirected to auth page');
    } else {
      // If not redirected, check for manage page content
      expect(currentUrl).toContain('/en/manage');
      expect(bodyText).toMatch(/manage|dashboard|monastery/i);
      console.log('Manage page: Page accessible with management content');
    }
    
    await page.screenshot({ path: 'test-results/manage-page.png' });
  });

  test('should load manage bookings page', async ({ page }) => {
    await page.goto('/en/manage/bookings');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check current URL and handle redirects
    const currentUrl = page.url();
    const bodyText = await page.textContent('body');
    
    if (currentUrl.includes('/auth')) {
      // If redirected to auth, check for auth form elements
      expect(bodyText).toMatch(/sign in|create account|login/i);
      console.log('Manage bookings: Successfully redirected to auth page');
    } else {
      // If not redirected, check for bookings page content
      expect(bodyText).toMatch(/booking|manage|reservation/i);
      console.log('Manage bookings: Page accessible with booking content');
    }
    
    await page.screenshot({ path: 'test-results/manage-bookings.png' });
  });

  test('should load manage monastery page', async ({ page }) => {
    await page.goto('/en/manage/monastery');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check current URL and handle redirects
    const currentUrl = page.url();
    const bodyText = await page.textContent('body');
    
    if (currentUrl.includes('/auth')) {
      // If redirected to auth, check for auth form elements
      expect(bodyText).toMatch(/sign in|create account|login/i);
      console.log('Manage monastery: Successfully redirected to auth page');
    } else {
      // If not redirected, check for monastery management content
      expect(bodyText).toMatch(/monastery|manage|information/i);
      console.log('Manage monastery: Page accessible with monastery content');
    }
    
    await page.screenshot({ path: 'test-results/manage-monastery.png' });
  });
});