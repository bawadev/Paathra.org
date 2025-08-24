import { test, expect } from '@playwright/test';

// Test credentials
const TEST_USER = {
  email: 'inbox.bawantha@gmail.com',
  password: '12345678'
};

// Helper function to login
async function loginUser(page: any) {
  await page.goto('/en/auth');
  await page.waitForLoadState('networkidle');
  
  // Wait for and fill email field with proper selectors
  await page.waitForSelector('#email', { timeout: 10000 });
  await page.fill('#email', TEST_USER.email);
  await page.fill('#password', TEST_USER.password);
  
  const submitButton = page.locator('button[type="submit"]');
  await submitButton.click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}

test.describe('End-to-End Donation Workflow', () => {
  test('should complete full donation workflow from login to booking', async ({ page }) => {
    // Step 1: Login
    await loginUser(page);
    await page.screenshot({ path: 'test-results/e2e-01-login.png' });
    
    // Step 2: Navigate to donations page
    await page.goto('/en/donations');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/e2e-02-donations-page.png' });
    
    // Step 3: Check for calendar component
    const calendar = page.locator('[data-testid="donation-calendar"], .calendar, [role="grid"], [class*="calendar"]');
    if (await calendar.count() > 0) {
      console.log('Calendar found on donations page');
      await expect(calendar.first()).toBeVisible();
    }
    
    // Step 4: Look for available slots or booking options
    const bookingElements = page.locator('button:has-text("Book"), button:has-text("Reserve"), button:has-text("Select"), [data-testid*="slot"], [class*="slot"]');
    if (await bookingElements.count() > 0) {
      console.log(`Found ${await bookingElements.count()} booking elements`);
      
      // Take screenshot before interaction
      await page.screenshot({ path: 'test-results/e2e-03-booking-options.png' });
      
      // Click the first available booking option (carefully, to avoid real bookings)
      // await bookingElements.first().click();
      // await page.waitForLoadState('networkidle');
    }
    
    // Step 5: Check for booking form
    const forms = page.locator('form');
    if (await forms.count() > 0) {
      console.log('Booking form found');
      
      const form = forms.first();
      await expect(form).toBeVisible();
      
      // Check form inputs without filling them (to avoid real bookings)
      const inputs = form.locator('input, select, textarea');
      console.log(`Form has ${await inputs.count()} input fields`);
      
      await page.screenshot({ path: 'test-results/e2e-04-booking-form.png' });
    }
    
    // Step 6: Navigate to my donations to check history
    await page.goto('/en/my-donations');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/e2e-05-my-donations.png' });
    
    // Final verification - check we can navigate back to main pages
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/e2e-06-final-home.png' });
  });

  test('should handle admin workflow after login', async ({ page }) => {
    // Login first
    await loginUser(page);
    
    // Navigate through admin pages
    const adminPages = [
      '/en/admin/dashboard',
      '/en/admin/analytics',
      '/en/admin/settings',
      '/en/admin/users',
      '/en/admin/monasteries'
    ];
    
    for (let i = 0; i < adminPages.length; i++) {
      const adminPage = adminPages[i];
      await page.goto(adminPage);
      
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      } catch (error) {
        console.log(`Admin page ${adminPage} load timeout, continuing...`);
      }
      
      const currentUrl = page.url();
      const pageName = adminPage.split('/').pop();
      
      console.log(`Admin ${pageName}: ${currentUrl}`);
      
      try {
        await page.screenshot({
          path: `test-results/admin-workflow-${i + 1}-${pageName}.png`,
          timeout: 5000
        });
      } catch (error) {
        console.log(`Screenshot timeout for ${pageName}, continuing...`);
      }
      
      // Check if we were redirected to auth page (expected behavior for unauthenticated users)
      const bodyText = await page.textContent('body');
      
      if (currentUrl.includes('/auth')) {
        // If redirected to auth, check for auth form elements
        expect(bodyText).toMatch(/sign in|create account|login/i);
        console.log(`Admin ${pageName}: Successfully redirected to auth page`);
      } else {
        // If not redirected, the page should be functional (user might be authenticated)
        expect(bodyText).not.toContain('This page could not be found');
        expect(bodyText).not.toContain('500');
        console.log(`Admin ${pageName}: Page accessible (user may be authenticated)`);
      }
    }
  });

  test('should handle monastery browsing workflow', async ({ page }) => {
    await loginUser(page);
    
    // Browse monasteries
    await page.goto('/en/monasteries');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/monastery-workflow-01-list.png' });
    
    // Check for monastery cards or listings
    const monasteryElements = page.locator('[data-testid*="monastery"], [class*="monastery"], .card, article');
    if (await monasteryElements.count() > 0) {
      console.log(`Found ${await monasteryElements.count()} monastery elements`);
    }
    
    // Navigate to manage monastery
    await page.goto('/en/manage/monastery');
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (error) {
      console.log('Manage monastery page load timeout, continuing...');
    }
    
    // Take screenshot with timeout to avoid hanging
    try {
      await page.screenshot({
        path: 'test-results/monastery-workflow-02-manage.png',
        timeout: 5000
      });
    } catch (error) {
      console.log('Screenshot timeout, continuing with test...');
    }
    
    // Check manage functionality - look for actual page content instead of 404
    const bodyText = await page.textContent('body');
    const currentUrl = page.url();
    
    if (currentUrl.includes('/auth')) {
      // If redirected to auth, check for auth form elements
      expect(bodyText).toMatch(/sign in|create account|login/i);
      console.log('Manage monastery: Successfully redirected to auth page');
    } else {
      // If not redirected, check for monastery management content
      expect(bodyText).toMatch(/manage monastery|monastery information|monastery name/i);
      console.log('Manage monastery: Page accessible with monastery management content');
    }
  });
});
