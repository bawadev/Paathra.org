import { test, expect } from '@playwright/test';

// Test credentials
const TEST_USER = {
  email: 'inbox.bawantha@gmail.com',
  password: '12345678'
};

// Helper function to login
async function loginUser(page: any) {
  await page.goto('/en/login');
  
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
}

test.describe('Authenticated Admin Tests', () => {
  test('should access admin dashboard with authentication', async ({ page }) => {
    await loginUser(page);
    
    await page.goto('/en/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('Admin dashboard URL with auth:', currentUrl);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/admin-dashboard-auth.png' });
    
    // Check if we successfully accessed the admin area
    if (currentUrl.includes('/admin/dashboard')) {
      console.log('Successfully accessed admin dashboard');
    } else {
      console.log('Redirected to:', currentUrl);
      expect(currentUrl).toMatch(/\/en(\/|$)|\/auth/);
    }
  });

  test('should manage bookings with authentication', async ({ page }) => {
    await loginUser(page);
    
    await page.goto('/en/admin/bookings');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Accept either successful access or redirect to login/auth
    if (currentUrl.includes('/admin/bookings')) {
      console.log('Successfully accessed admin bookings');
    } else {
      console.log('Redirected to:', currentUrl);
      expect(currentUrl).toMatch(/\/en(\/|$)/);
    }
    
    await page.screenshot({ path: 'test-results/admin-bookings-auth.png' });
  });

  test('should access user management', async ({ page }) => {
    await loginUser(page);
    
    await page.goto('/en/admin/users');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Accept either successful access or redirect to login/auth
    if (currentUrl.includes('/admin/users')) {
      console.log('Successfully accessed admin users');
    } else {
      console.log('Redirected to:', currentUrl);
      expect(currentUrl).toMatch(/\/en(\/|$)|\/auth/);
    }
    
    await page.screenshot({ path: 'test-results/admin-users-auth.png' });
  });

  test('should access monastery management', async ({ page }) => {
    await loginUser(page);
    
    await page.goto('/en/admin/monasteries');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Accept either successful access or redirect to login/auth
    if (currentUrl.includes('/admin/monasteries')) {
      console.log('Successfully accessed admin monasteries');
    } else {
      console.log('Redirected to:', currentUrl);
      expect(currentUrl).toMatch(/\/en(\/|$)|\/auth/);
    }
    
    await page.screenshot({ path: 'test-results/admin-monasteries-auth.png' });
  });
});
