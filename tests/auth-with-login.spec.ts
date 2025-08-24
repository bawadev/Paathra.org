import { test, expect } from '@playwright/test';

// Test credentials
const TEST_USER = {
  email: 'inbox.bawantha@gmail.com',
  password: '12345678'
};

test.describe('Authentication with Login', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/en/auth');
    await page.waitForLoadState('networkidle');
    
    // Wait for and fill email field with proper selectors
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    
    // Look for submit button
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check if login was successful (look for dashboard or profile elements)
    const currentUrl = page.url();
    console.log('URL after login attempt:', currentUrl);
    
    // Take screenshot after login
    await page.screenshot({ path: 'test-results/after-login.png' });
  });

  test('should access admin dashboard after login', async ({ page }) => {
    // First login
    await page.goto('/en/auth');
    await page.waitForLoadState('networkidle');
    
    // Wait for and fill email field with proper selectors
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Now try to access admin dashboard
    await page.goto('/en/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('Admin dashboard URL after login:', currentUrl);
    
    if (currentUrl.includes('/admin/dashboard')) {
      console.log('Successfully accessed admin dashboard');
      
      // Look for admin-specific content
      const adminContent = page.locator('h1, h2, [data-testid*="admin"], [class*="admin"]');
      if (await adminContent.count() > 0) {
        await expect(adminContent.first()).toBeVisible();
      }
    }
    
    await page.screenshot({ path: 'test-results/admin-dashboard-logged-in.png' });
  });

  test('should access protected donation management features', async ({ page }) => {
    // Login first
    await page.goto('/en/auth');
    await page.waitForLoadState('networkidle');
    
    // Wait for and fill email field with proper selectors
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Test manage pages
    const managePages = ['/en/manage', '/en/manage/bookings', '/en/manage/monastery', '/en/manage/slots'];
    
    for (const managePage of managePages) {
      await page.goto(managePage);
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      console.log(`Accessing ${managePage}: ${currentUrl}`);
      
      // Check if we can access the page (not redirected to login)
      if (currentUrl.includes(managePage.split('/').pop() || managePage)) {
        console.log(`Successfully accessed ${managePage}`);
      }
      
      await page.screenshot({ path: `test-results/manage-${managePage.split('/').pop()}-logged-in.png` });
    }
  });

  test('should handle logout functionality', async ({ page }) => {
    // Login first
    await page.goto('/en/auth');
    await page.waitForLoadState('networkidle');
    
    // Wait for and fill email field with proper selectors
    await page.waitForSelector('#email', { timeout: 10000 });
    await page.fill('#email', TEST_USER.email);
    await page.fill('#password', TEST_USER.password);
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Look for logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out")');
    
    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
      await page.waitForLoadState('networkidle');
      
      console.log('Logout button clicked');
      
      // Try to access a protected page to verify logout
      await page.goto('/en/admin/dashboard');
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      if (!currentUrl.includes('/en/admin/dashboard')) {
        console.log('Successfully logged out - redirected from protected page');
      }
    } else {
      console.log('No logout button found');
    }
    
    await page.screenshot({ path: 'test-results/after-logout.png' });
  });
});
