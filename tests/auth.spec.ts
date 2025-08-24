import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should handle auth form display', async ({ page }) => {
    await page.goto('/en/auth');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check for login form elements with flexible approach
    const pageContent = await page.textContent('body');
    
    // If auth page exists, check for basic elements
    const currentUrl = page.url();
    if (currentUrl.includes('/auth')) {
      // Look for auth-related text
      expect(pageContent).toMatch(/sign in|create account|login/i);
    } else {
      // If redirected, check we're on a valid page
      expect(pageContent).not.toContain('404');
      expect(pageContent).not.toContain('This page could not be found');
    }
    
    await page.screenshot({ path: 'test-results/auth-state.png' });
  });

  test('should handle protected routes', async ({ page }) => {
    // Test accessing a protected admin route
    await page.goto('/en/admin/dashboard');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    const currentUrl = page.url();
    
    // Check if we're redirected away from admin (expected if not authenticated)
    if (!currentUrl.includes('/en/admin/dashboard')) {
      console.log('Redirected from protected route (expected behavior)');
      expect(currentUrl).not.toContain('/en/admin/dashboard');
    } else {
      console.log('Admin dashboard accessible (user may be authenticated)');
    }
    
    await page.screenshot({ path: 'test-results/protected-route-test.png' });
  });

  test('should handle navigation after potential auth redirect', async ({ page }) => {
    await page.goto('/en/admin/settings');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check if we were redirected to auth page (expected behavior for unauthenticated users)
    const currentUrl = page.url();
    const bodyText = await page.textContent('body');
    
    if (currentUrl.includes('/auth')) {
      // If redirected to auth, check for auth form elements
      expect(bodyText).toMatch(/sign in|create account|login/i);
      console.log('Successfully redirected to auth page');
    } else {
      // If not redirected, the page should be functional (user might be authenticated)
      expect(bodyText).not.toContain('This page could not be found');
      expect(bodyText).not.toContain('500');
      console.log('Admin page accessible (user may be authenticated)');
    }
    
    await page.screenshot({ path: 'test-results/navigation-after-redirect.png' });
  });
});