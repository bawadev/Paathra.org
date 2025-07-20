import { test as base, Page } from '@playwright/test';

// Test data and configuration
export const TEST_CONFIG = {
  user: {
    email: 'inbox.bawantha@gmail.com',
    password: '12345678'
  },
  timeouts: {
    navigation: 30000,
    element: 10000
  },
  urls: {
    base: 'http://localhost:3000',
    login: '/',
    dashboard: '/admin/dashboard',
    donations: '/donations',
    manage: '/manage'
  }
};

// Extend the base test with custom fixtures
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    // Auto-login for tests that need authentication
    await page.goto('/');
    
    const emailField = page.locator('input[type="email"], input[name="email"]');
    const passwordField = page.locator('input[type="password"], input[name="password"]');
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      await emailField.fill(TEST_CONFIG.user.email);
      await passwordField.fill(TEST_CONFIG.user.password);
      
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForLoadState('networkidle');
      }
    }
    
    await use(page);
  },
});

export { expect } from '@playwright/test';
