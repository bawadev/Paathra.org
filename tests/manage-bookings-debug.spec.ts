import { test, expect } from '@playwright/test';

test.describe('Debug Manage Bookings Authentication', () => {
  test('should authenticate and access manage bookings page', async ({ page }) => {
    // Navigate to auth page first
    await page.goto('/en/auth');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot to see the current state
    await page.screenshot({ path: 'debug-auth-page.png', fullPage: true });
    
    // Check if we can see the login form
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    
    // Fill the form with proper waiting
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.fill('#email', 'inbox.bawantha@gmail.com');
    
    await page.waitForSelector('#password', { timeout: 10000 });
    await page.fill('#password', '12345678');
    
    // Take screenshot before submitting
    await page.screenshot({ path: 'debug-before-submit.png', fullPage: true });
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for any navigation or form submission to complete
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Take screenshot after submit to see what happened
    await page.screenshot({ path: 'debug-after-submit.png', fullPage: true });
    
    // Check current URL
    console.log('Current URL after login:', page.url());
    
    // Now navigate to manage bookings
    await page.goto('/en/manage/bookings');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of manage bookings page
    await page.screenshot({ path: 'debug-manage-bookings.png', fullPage: true });
    
    // Verify we're on the correct page
    await expect(page.getByText('Manage Bookings')).toBeVisible({ timeout: 10000 });
  });
});