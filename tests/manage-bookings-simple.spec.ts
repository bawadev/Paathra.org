import { test, expect } from '@playwright/test';

test.describe('Manage Bookings Page - Simple Tests', () => {
  test('should access manage bookings page directly', async ({ page }) => {
    // Navigate directly to the manage bookings page
    await page.goto('/en/manage/bookings');
    
    // If redirected to auth, fill the form
    if (page.url().includes('/auth')) {
      // Fill login form using IDs
      await page.fill('#email', 'inbox.bawantha@gmail.com');
      await page.fill('#password', '12345678');
      await page.click('button[type="submit"]');
      
      // Wait for redirect back to manage bookings
      await page.waitForURL('**/manage/bookings');
    }
    
    // Verify we're on the manage bookings page
    await expect(page.getByText('Manage Bookings')).toBeVisible();
    await expect(page.getByText('Calendar View')).toBeVisible();
  });

  test('should display calendar and navigate months', async ({ page }) => {
    await page.goto('/en/manage/bookings');
    
    // Handle auth if needed
    if (page.url().includes('/auth')) {
      await page.fill('#email', 'inbox.bawantha@gmail.com');
      await page.fill('#password', '12345678');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/manage/bookings');
    }
    
    // Wait for calendar to load
    await page.waitForSelector('text=August 2025, September 2025', { timeout: 10000 });
    
    // Test month navigation
    const nextButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1);
    await nextButton.click();
    
    // Should navigate to next month
    await page.waitForTimeout(1000);
    
    // Calendar should still be visible
    await expect(page.getByText('Calendar View')).toBeVisible();
  });

  test('should create a slot and booking', async ({ page }) => {
    await page.goto('/en/manage/bookings');
    
    // Handle auth if needed
    if (page.url().includes('/auth')) {
      await page.fill('#email', 'inbox.bawantha@gmail.com');
      await page.fill('#password', '12345678');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/manage/bookings');
    }
    
    // Wait for page to load
    await page.waitForSelector('text=Calendar View');
    
    // Navigate to September if needed
    while (!await page.locator('text=September 2025').isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.locator('button').filter({ has: page.locator('svg') }).nth(1).click();
      await page.waitForTimeout(500);
    }
    
    // Click on September 15th
    const sept15 = page.getByRole('button', { name: '15' }).first();
    await sept15.click();
    await page.waitForTimeout(1000);
    
    // Check if slots exist, if not create one
    const noSlotsText = page.locator('text=No slots for this date');
    if (await noSlotsText.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Create a breakfast slot
      await page.getByText('Breakfast (7:00 AM)').click();
      
      // Should open create slot dialog
      await expect(page.getByText('Create New Slot')).toBeVisible();
      
      // Create the slot with default values
      await page.getByRole('button', { name: 'Create Slot' }).click();
      
      // Wait for slot to be created
      await page.waitForTimeout(2000);
    }
    
    // Now try to create a booking
    await page.getByRole('button', { name: 'Book Donation' }).click();
    
    // Should open booking dialog
    await expect(page.getByText('Create New Booking')).toBeVisible();
    
    // Test with registered user phone
    await page.fill('input[placeholder*="phone number"]', '0717553797');
    await page.getByRole('button', { name: 'Lookup' }).click();
    
    // Wait for lookup to complete
    await page.waitForTimeout(1500);
    
    // Should auto-fill user details
    await expect(page.getByDisplayValue('Pasindu Bawantha Munasinghe')).toBeVisible();
    
    // Fill remaining required fields
    await page.fill('input[placeholder*="Rice and curry"]', 'Test Food for Playwright');
    
    // Select time slot if dropdown exists
    const timeSlotCombo = page.locator('div[role="combobox"]').first();
    if (await timeSlotCombo.isVisible({ timeout: 1000 }).catch(() => false)) {
      await timeSlotCombo.click();
      await page.locator('div[role="option"]').first().click();
    }
    
    // Add special notes
    await page.fill('textarea[placeholder*="special requirements"]', 'Automated test booking');
    
    // Create the booking
    await page.getByRole('button', { name: 'Create Booking' }).click();
    
    // Wait for booking creation
    await page.waitForTimeout(3000);
    
    // Dialog should close on success
    await expect(page.getByText('Create New Booking')).not.toBeVisible({ timeout: 10000 });
    
    // Should show booking in calendar
    await expect(page.locator('text=1 bookings, 2 bookings, 3 bookings').first()).toBeVisible({ timeout: 5000 });
  });

  test('should filter bookings', async ({ page }) => {
    await page.goto('/en/manage/bookings');
    
    // Handle auth if needed  
    if (page.url().includes('/auth/')) {
      await page.fill('#email', 'inbox.bawantha@gmail.com');
      await page.fill('#password', '12345678');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/manage/bookings');
    }
    
    await page.waitForSelector('text=Calendar View');
    
    // Test search functionality
    const searchBox = page.getByPlaceholder('Search by donor name, food type, or email...');
    await searchBox.fill('Pasindu');
    await page.waitForTimeout(1000);
    
    // Clear search
    await searchBox.clear();
    
    // Test status filter
    await page.getByText('All Statuses').click();
    await page.getByText('Monastery Approved').click();
    await page.waitForTimeout(1000);
    
    // Reset filter
    await page.getByText('Monastery Approved').click();
    await page.getByText('All Statuses').click();
  });

  test('should validate form fields', async ({ page }) => {
    await page.goto('/en/manage/bookings');
    
    // Handle auth if needed
    if (page.url().includes('/auth')) {
      await page.fill('#email', 'inbox.bawantha@gmail.com');
      await page.fill('#password', '12345678');
      await page.click('button[type="submit"]');
      await page.waitForURL('**/manage/bookings');
    }
    
    await page.waitForSelector('text=Calendar View');
    
    // Navigate to a date and ensure we can open booking dialog
    while (!await page.locator('text=September 2025').isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.locator('button').filter({ has: page.locator('svg') }).nth(1).click();
      await page.waitForTimeout(500);
    }
    
    await page.getByRole('button', { name: '16' }).first().click();
    await page.waitForTimeout(1000);
    
    // Create slot if needed
    if (await page.locator('text=No slots for this date').isVisible({ timeout: 2000 }).catch(() => false)) {
      await page.getByText('Breakfast (7:00 AM)').click();
      await page.getByRole('button', { name: 'Create Slot' }).click();
      await page.waitForTimeout(2000);
    }
    
    // Open booking dialog
    await page.getByRole('button', { name: 'Book Donation' }).click();
    await expect(page.getByText('Create New Booking')).toBeVisible();
    
    // Create Booking button should be disabled initially
    const createButton = page.getByRole('button', { name: 'Create Booking' });
    await expect(createButton).toBeDisabled();
    
    // Fill phone number for new user
    await page.fill('input[placeholder*="phone number"]', '0999999999');
    await page.getByRole('button', { name: 'Lookup' }).click();
    await page.waitForTimeout(1000);
    
    // Should still be disabled
    await expect(createButton).toBeDisabled();
    
    // Fill name
    await page.fill('input[placeholder*="donor name"]', 'Test User');
    await expect(createButton).toBeDisabled();
    
    // Fill email  
    await page.fill('input[placeholder*="donor email"]', 'test@example.com');
    await expect(createButton).toBeDisabled();
    
    // Fill food type - now button should be enabled
    await page.fill('input[placeholder*="Rice and curry"]', 'Test Food');
    await expect(createButton).toBeEnabled();
    
    // Close dialog
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});