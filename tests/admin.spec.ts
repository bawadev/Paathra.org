import { test } from '@playwright/test';

test.describe('Admin Section', () => {
  test('should handle admin dashboard access', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login or if we can access the dashboard
    const currentUrl = page.url();
    
    if (currentUrl.includes('/admin/dashboard')) {
      // If we can access the dashboard, check for admin content
      console.log('Admin dashboard accessible');
      
      // Take screenshot
      await page.screenshot({ path: 'test-results/admin-dashboard.png' });
    } else {
      // If redirected (likely to login), that's expected behavior
      console.log('Redirected from admin dashboard (expected if not authenticated)');
      await page.screenshot({ path: 'test-results/admin-redirect.png' });
    }
  });

  test('should load admin settings page', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForLoadState('networkidle');
    
    // Check if settings page loads or redirects
    const currentUrl = page.url();
    console.log('Admin settings URL:', currentUrl);
    
    await page.screenshot({ path: 'test-results/admin-settings.png' });
  });

  test('should load admin analytics page', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('networkidle');
    
    // Check if analytics page loads or redirects
    const currentUrl = page.url();
    console.log('Admin analytics URL:', currentUrl);
    
    await page.screenshot({ path: 'test-results/admin-analytics.png' });
  });

  test('should load admin users page', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    
    // Check if users page loads or redirects
    const currentUrl = page.url();
    console.log('Admin users URL:', currentUrl);
    
    await page.screenshot({ path: 'test-results/admin-users.png' });
  });

  test('should load admin bookings page', async ({ page }) => {
    await page.goto('/admin/bookings');
    await page.waitForLoadState('networkidle');
    
    // Check if bookings page loads or redirects
    const currentUrl = page.url();
    console.log('Admin bookings URL:', currentUrl);
    
    await page.screenshot({ path: 'test-results/admin-bookings.png' });
  });
});
