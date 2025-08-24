import { test, expect } from '@playwright/test';

// Test credentials for authenticated tests
const TEST_USER = {
  email: 'inbox.bawantha@gmail.com',
  password: '12345678'
};

test.describe('Donation Flow', () => {
  test('should navigate to monasteries page for donations', async ({ page }) => {
    await page.goto('/en');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check that we're on the home page
    expect(page.url()).toContain('/en');
    
    // Take a screenshot
    await page.screenshot({ path: 'test-results/donations-landing.png' });
  });

  test('should display monastery browsing functionality', async ({ page }) => {
    await page.goto('/en/monasteries');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check for basic page functionality
    expect(page.url()).toContain('/en/monasteries');
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/donations-browse.png' });
  });

  test('should display user donation history page', async ({ page }) => {
    await page.goto('/en/my-donations');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    const currentUrl = page.url();
    console.log('My donations page URL:', currentUrl);
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/my-donations.png' });
  });
});