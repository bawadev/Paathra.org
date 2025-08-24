import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'inbox.bawantha@gmail.com';
const TEST_PASSWORD = '12345678';

test.describe('Donation Slot Creation', () => {
  test('should create donation slots successfully', async ({ page }) => {
    // Navigate to manage bookings page
    await page.goto('/en/manage/bookings');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check if redirected to auth
    const currentUrl = page.url();
    if (currentUrl.includes('/auth')) {
      console.log('Redirected to auth page, logging in...');
      
      // Fill login form
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      
      // Click sign in button
      await page.click('button[type="submit"]');
      
      // Wait for navigation to manage page
      await page.waitForURL('**/en/manage/bookings', { timeout: 10000 });
    }
    
    // Verify we're on manage bookings page
    await expect(page).toHaveURL(/.*\/en\/manage\/bookings/);
    
    // Check for calendar component
    const calendar = page.locator('[data-testid="calendar-view"]');
    await expect(calendar).toBeVisible();
    
    // Look for slot creation button or calendar click functionality
    const createSlotButton = page.locator('button:has-text("Create Slot")');
    const calendarDay = page.locator('[data-testid="calendar-day"]').first();
    
    console.log('Calendar loaded, testing slot creation...');
    
    // Try clicking on a calendar day to create slot
    await calendarDay.click();
    
    // Wait for slot creation modal/form
    const slotModal = page.locator('[data-testid="slot-creation-modal"]');
    await expect(slotModal).toBeVisible();
    
    // Fill slot creation form
    await page.selectOption('select[name="meal_type"]', 'breakfast');
    await page.fill('input[name="capacity"]', '50');
    await page.fill('input[name="time"]', '07:00');
    
    // Submit form
    await page.click('button[type="submit"]:has-text("Create")');
    
    // Wait for success message or slot to appear
    await page.waitForTimeout(2000);
    
    // Verify slot appears in calendar
    const newSlot = page.locator('.slot-item').first();
    await expect(newSlot).toBeVisible();
    
    console.log('Slot creation test completed successfully');
  });

  test('should validate slot creation form', async ({ page }) => {
    await page.goto('/en/manage/bookings');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Handle authentication if needed
    const currentUrl = page.url();
    if (currentUrl.includes('/auth')) {
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/en/manage/bookings', { timeout: 10000 });
    }
    
    // Open slot creation modal
    const calendarDay = page.locator('[data-testid="calendar-day"]').first();
    await calendarDay.click();
    
    // Try to submit empty form
    await page.click('button[type="submit"]:has-text("Create")');
    
    // Check for validation errors
    const validationErrors = page.locator('.error-message');
    await expect(validationErrors).toHaveCount(1);
    
    console.log('Validation test completed');
  });

  test('should display slots correctly in calendar', async ({ page }) => {
    await page.goto('/en/manage/bookings');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Handle authentication if needed
    const currentUrl = page.url();
    if (currentUrl.includes('/auth')) {
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      await page.waitForURL('**/en/manage/bookings', { timeout: 10000 });
    }
    
    // Check calendar displays existing slots
    const slots = page.locator('.slot-item');
    const slotCount = await slots.count();
    
    console.log(`Found ${slotCount} slots in calendar`);
    
    // Check slot styling and information
    if (slotCount > 0) {
      const firstSlot = slots.first();
      await expect(firstSlot).toContainText(/breakfast|lunch|dinner/i);
      
      // Check for capacity display
      const capacity = firstSlot.locator('.capacity');
      await expect(capacity).toBeVisible();
    }
    
    console.log('Calendar display test completed');
  });
});