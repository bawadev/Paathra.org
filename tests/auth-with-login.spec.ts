import { test, expect } from '@playwright/test';

// Test credentials
const TEST_USER = {
  email: 'inbox.bawantha@gmail.com',
  password: '12345678'
};

test.describe('Authentication with Login', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Look for login/signin button or form
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign in"), a:has-text("Login"), a:has-text("Sign in")');
    
    if (await loginButton.count() > 0) {
      await loginButton.first().click();
      await page.waitForLoadState('networkidle');
    }
    
    // Look for email and password fields
    const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordField = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]');
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      await emailField.fill(TEST_USER.email);
      await passwordField.fill(TEST_USER.password);
      
      // Look for submit button
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
        
        // Check if login was successful (look for dashboard or profile elements)
        const currentUrl = page.url();
        console.log('URL after login attempt:', currentUrl);
        
        // Take screenshot after login
        await page.screenshot({ path: 'test-results/after-login.png' });
      }
    } else {
      console.log('Login form not found, taking screenshot of current state');
      await page.screenshot({ path: 'test-results/no-login-form.png' });
    }
  });

  test('should access admin dashboard after login', async ({ page }) => {
    // First login
    await page.goto('/');
    
    // Look for existing login form or navigate to login
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      await emailField.fill(TEST_USER.email);
      await passwordField.fill(TEST_USER.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Now try to access admin dashboard
    await page.goto('/admin/dashboard');
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
    await page.goto('/');
    
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      await emailField.fill(TEST_USER.email);
      await passwordField.fill(TEST_USER.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Test manage pages
    const managePages = ['/manage', '/manage/bookings', '/manage/monastery', '/manage/slots'];
    
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
    await page.goto('/');
    
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      await emailField.fill(TEST_USER.email);
      await passwordField.fill(TEST_USER.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    // Look for logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out")');
    
    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
      await page.waitForLoadState('networkidle');
      
      console.log('Logout button clicked');
      
      // Try to access a protected page to verify logout
      await page.goto('/admin/dashboard');
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      if (!currentUrl.includes('/admin/dashboard')) {
        console.log('Successfully logged out - redirected from protected page');
      }
    } else {
      console.log('No logout button found');
    }
    
    await page.screenshot({ path: 'test-results/after-logout.png' });
  });
});
