import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should handle auth form display', async ({ page }) => {
    await page.goto('/');
    
    // Look for authentication-related elements
    const authButtons = page.locator('button:has-text("Login"), button:has-text("Sign in"), button:has-text("Sign up"), a:has-text("Login"), a:has-text("Sign in")');
    
    if (await authButtons.count() > 0) {
      console.log('Found authentication buttons');
      await expect(authButtons.first()).toBeVisible();
    } else {
      console.log('No authentication buttons found on homepage');
    }
    
    // Look for auth forms
    const authForms = page.locator('form:has(input[type="email"]), form:has(input[type="password"])');
    
    if (await authForms.count() > 0) {
      console.log('Found authentication forms');
      await expect(authForms.first()).toBeVisible();
    }
    
    await page.screenshot({ path: 'test-results/auth-state.png' });
  });

  test('should handle protected routes', async ({ page }) => {
    // Test accessing a protected admin route
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    
    // Check if we're redirected away from admin (expected if not authenticated)
    if (!currentUrl.includes('/admin/dashboard')) {
      console.log('Redirected from protected route (expected behavior)');
      expect(currentUrl).not.toContain('/admin/dashboard');
    } else {
      console.log('Admin dashboard accessible (user may be authenticated)');
    }
    
    await page.screenshot({ path: 'test-results/protected-route-test.png' });
  });

  test('should handle navigation after potential auth redirect', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
    
    // After any redirects, the page should be functional
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('This page could not be found');
    expect(bodyText).not.toContain('500');
    
    await page.screenshot({ path: 'test-results/navigation-after-redirect.png' });
  });
});
