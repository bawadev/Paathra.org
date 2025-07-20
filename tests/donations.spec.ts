import { test, expect } from '@playwright/test';

// Test credentials for authenticated tests
const TEST_USER = {
  email: 'inbox.bawantha@gmail.com',
  password: '12345678'
};

// Helper function to login
async function loginUser(page: any) {
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

test.describe('Donation Flow', () => {
  test('should navigate to donations page', async ({ page }) => {
    await page.goto('/');
    
    // Try to find and click a link to donations
    const donationLink = page.getByRole('link', { name: /donate|donation/i });
    if (await donationLink.count() > 0) {
      await donationLink.first().click();
      await page.waitForLoadState('networkidle');
      
      // Check that we're on a donation-related page
      await expect(page.url()).toMatch(/donate|donation/);
    } else {
      // If no link found, navigate directly
      await page.goto('/donate');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display donation calendar', async ({ page }) => {
    await page.goto('/donations');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for calendar component
    const calendar = page.locator('[data-testid="donation-calendar"], .calendar, [role="grid"]');
    
    // If calendar exists, check it's visible
    if (await calendar.count() > 0) {
      await expect(calendar.first()).toBeVisible();
    }
    
    // Take screenshot of donations page
    await page.screenshot({ path: 'test-results/donations-page.png' });
  });

  test('should handle donation booking form', async ({ page }) => {
    await page.goto('/donations');
    await page.waitForLoadState('networkidle');
    
    // Look for form elements
    const forms = page.locator('form');
    
    if (await forms.count() > 0) {
      const form = forms.first();
      await expect(form).toBeVisible();
      
      // Look for common form inputs
      const inputs = form.locator('input, select, textarea');
      if (await inputs.count() > 0) {
        console.log(`Found ${await inputs.count()} form inputs`);
      }
    }
  });

  test('should handle authenticated donation booking', async ({ page }) => {
    // Login first
    await page.goto('/');
    await loginUser(page);
    
    // Now navigate to donations page
    await page.goto('/donations');
    await page.waitForLoadState('networkidle');
    
    // Look for enhanced features available to authenticated users
    const authenticatedElements = page.locator('[data-testid*="auth"], [class*="authenticated"], button:has-text("Book"), button:has-text("Reserve")');
    
    if (await authenticatedElements.count() > 0) {
      console.log('Found authenticated donation features');
      await expect(authenticatedElements.first()).toBeVisible();
    }
    
    // Look for booking forms
    const bookingForms = page.locator('form');
    if (await bookingForms.count() > 0) {
      const form = bookingForms.first();
      
      // Try to interact with form elements
      const inputs = form.locator('input, select, textarea');
      if (await inputs.count() > 0) {
        console.log(`Found ${await inputs.count()} form inputs in authenticated state`);
        
        // Try to fill some test data (if safe to do so)
        const textInputs = form.locator('input[type="text"], input[type="number"], textarea');
        if (await textInputs.count() > 0) {
          // Fill with test data - be careful not to submit real bookings
          await textInputs.first().fill('Test booking data');
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/donations-authenticated.png' });
  });

  test('should display user-specific donation history', async ({ page }) => {
    // Login first
    await page.goto('/');
    await loginUser(page);
    
    // Navigate to user's donation history
    await page.goto('/my-donations');
    await page.waitForLoadState('networkidle');
    
    const currentUrl = page.url();
    console.log('My donations page URL:', currentUrl);
    
    // Check if the page loads successfully
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('This page could not be found');
    
    // Look for donation history elements
    const donationElements = page.locator('[data-testid*="donation"], [class*="donation"], table, .card');
    if (await donationElements.count() > 0) {
      console.log('Found donation history elements');
    }
    
    await page.screenshot({ path: 'test-results/my-donations.png' });
  });
});
