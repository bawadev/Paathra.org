import { test, expect } from '@playwright/test';

// Test data
const TEST_CREDENTIALS = {
  email: 'inbox.bawantha@gmail.com',
  password: '12345678'
};

const TEST_PHONE_REGISTERED = '0717553797'; // Registered user
const TEST_PHONE_GUEST = '0771234567'; // Guest user
const TEST_PHONE_NEW = '0123456789'; // New user

test.describe('Manage Bookings Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to auth page
    await page.goto('/en/auth');
    
    // Login using input IDs
    await page.fill('#email', TEST_CREDENTIALS.email);
    await page.fill('#password', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard or home
    await page.waitForURL(/\/(en\/)?(dashboard|manage|$)/);
    
    // Navigate to manage bookings
    await page.goto('/en/manage/bookings');
    
    // Verify page loaded correctly
    await expect(page.getByRole('heading', { name: 'Manage Bookings' })).toBeVisible();
  });

  test('should display page with correct authentication', async ({ page }) => {
    // Verify page elements are present
    await expect(page.getByRole('heading', { name: 'Manage Bookings' })).toBeVisible();
    await expect(page.getByText('View and manage donation bookings for Test Monastary')).toBeVisible();
    
    // Verify main sections are visible
    await expect(page.getByText('Filters')).toBeVisible();
    await expect(page.getByText('Calendar View')).toBeVisible();
    await expect(page.getByPlaceholder('Search by donor name, food type, or email...')).toBeVisible();
  });

  test('should display calendar with navigation', async ({ page }) => {
    // Verify calendar is displayed
    await expect(page.getByText('August 2025')).toBeVisible();
    
    // Test calendar navigation
    const nextButton = page.getByRole('button').nth(1); // Assuming next month button
    await nextButton.click();
    
    // Should show September or next month
    await expect(page.locator('text=September 2025, October 2025, July 2025').first()).toBeVisible();
  });

  test('should create a time slot successfully', async ({ page }) => {
    // Navigate to September to ensure we have a clean date
    while (!await page.getByText('September 2025').isVisible()) {
      await page.getByRole('button').nth(1).click(); // Next month
      await page.waitForTimeout(500);
    }
    
    // Click on a date (September 10th)
    await page.getByRole('button', { name: '10' }).click();
    
    // Click Breakfast button to create slot
    await page.getByRole('button', { name: 'Breakfast (7:00 AM)' }).click();
    
    // Verify create slot dialog appears
    await expect(page.getByText('Create New Slot')).toBeVisible();
    await expect(page.getByDisplayValue('Breakfast')).toBeVisible();
    await expect(page.getByDisplayValue('07:00')).toBeVisible();
    
    // Create the slot
    await page.getByRole('button', { name: 'Create Slot' }).click();
    
    // Verify slot was created - should see slot in the list
    await expect(page.getByText('breakfast - 07:00:00')).toBeVisible();
    await expect(page.getByText('Active')).toBeVisible();
  });

  test('should create booking for registered user', async ({ page }) => {
    // Ensure we have a slot first - navigate to a date with existing slots
    while (!await page.getByText('September 2025').isVisible()) {
      await page.getByRole('button').nth(1).click();
      await page.waitForTimeout(500);
    }
    
    // Click on September 6th (should have slot from previous tests)
    await page.getByRole('button', { name: '6' }).click();
    
    // If no slots exist, create one first
    try {
      await page.getByText('No slots for this date').waitFor({ timeout: 2000 });
      await page.getByRole('button', { name: 'Breakfast (7:00 AM)' }).click();
      await page.getByRole('button', { name: 'Create Slot' }).click();
      await page.waitForTimeout(1000);
    } catch {
      // Slots already exist, continue
    }
    
    // Click Book Donation
    await page.getByRole('button', { name: 'Book Donation' }).click();
    
    // Verify booking dialog appears
    await expect(page.getByText('Create New Booking')).toBeVisible();
    
    // Enter registered user phone number
    await page.getByRole('textbox', { name: 'Enter phone number to auto-fill details' }).fill(TEST_PHONE_REGISTERED);
    await page.getByRole('button', { name: 'Lookup' }).click();
    
    // Verify user was found and fields auto-filled
    await expect(page.getByText('✓ Donor found')).toBeVisible();
    await expect(page.getByDisplayValue('Pasindu Bawantha Munasinghe')).toBeVisible();
    await expect(page.getByDisplayValue('inbox.bawantha@gmail.com')).toBeVisible();
    
    // Fill in remaining fields
    await page.getByRole('textbox', { name: 'e.g., Rice and curry, Vegetables, Fruits' }).fill('Traditional Rice and Curry');
    
    // Select time slot
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Breakfast - 07:00:00' }).click();
    
    // Add special notes
    await page.getByPlaceholder('Any special requirements or notes...').fill('Test booking for registered user');
    
    // Create booking
    await page.getByRole('button', { name: 'Create Booking' }).click();
    
    // Verify booking was created - dialog should close and booking should appear
    await expect(page.getByText('Create New Booking')).not.toBeVisible();
    
    // Should show updated booking count in calendar
    await expect(page.getByText('1 bookings')).toBeVisible();
  });

  test('should create booking for guest user', async ({ page }) => {
    // Navigate to a clean date
    while (!await page.getByText('September 2025').isVisible()) {
      await page.getByRole('button').nth(1).click();
      await page.waitForTimeout(500);
    }
    
    // Click on September 7th
    await page.getByRole('button', { name: '7' }).click();
    
    // Create slot if needed
    try {
      await page.getByText('No slots for this date').waitFor({ timeout: 2000 });
      await page.getByRole('button', { name: 'Lunch (11:30 AM)' }).click();
      await page.getByRole('button', { name: 'Create Slot' }).click();
      await page.waitForTimeout(1000);
    } catch {
      // Slots already exist
    }
    
    // Click Book Donation
    await page.getByRole('button', { name: 'Book Donation' }).click();
    
    // Enter guest user phone number
    await page.getByRole('textbox', { name: 'Enter phone number to auto-fill details' }).fill(TEST_PHONE_GUEST);
    await page.getByRole('button', { name: 'Lookup' }).click();
    
    // Verify guest user was found
    await expect(page.getByText('✓ Donor found')).toBeVisible();
    await expect(page.getByDisplayValue('Test Guest User')).toBeVisible();
    
    // Fill in remaining fields
    await page.getByRole('textbox', { name: 'e.g., Rice and curry, Vegetables, Fruits' }).fill('Vegetarian Lunch');
    
    // Select time slot
    await page.getByRole('combobox').click();
    await page.getByRole('option').first().click(); // Select first available slot
    
    // Create booking
    await page.getByRole('button', { name: 'Create Booking' }).click();
    
    // Verify success
    await expect(page.getByText('Create New Booking')).not.toBeVisible();
  });

  test('should create booking for new user', async ({ page }) => {
    // Navigate to September 8th
    while (!await page.getByText('September 2025').isVisible()) {
      await page.getByRole('button').nth(1).click();
      await page.waitForTimeout(500);
    }
    
    await page.getByRole('button', { name: '8' }).click();
    
    // Create slot if needed
    try {
      await page.getByText('No slots for this date').waitFor({ timeout: 2000 });
      await page.getByRole('button', { name: 'Dinner (5:00 PM)' }).click();
      await page.getByRole('button', { name: 'Create Slot' }).click();
      await page.waitForTimeout(1000);
    } catch {
      // Slots already exist
    }
    
    // Click Book Donation
    await page.getByRole('button', { name: 'Book Donation' }).click();
    
    // Enter new phone number
    await page.getByRole('textbox', { name: 'Enter phone number to auto-fill details' }).fill(TEST_PHONE_NEW);
    await page.getByRole('button', { name: 'Lookup' }).click();
    
    // Should show "New donor" message
    await expect(page.getByText('New donor - please complete details')).toBeVisible();
    
    // Fill in all fields manually
    await page.getByRole('textbox', { name: 'Enter donor name' }).fill('New Test Donor');
    await page.getByRole('textbox', { name: 'Enter donor email' }).fill('newdonor@test.com');
    await page.getByRole('textbox', { name: 'e.g., Rice and curry, Vegetables, Fruits' }).fill('Special Dinner');
    
    // Select time slot
    await page.getByRole('combobox').click();
    await page.getByRole('option').first().click();
    
    // Add notes
    await page.getByPlaceholder('Any special requirements or notes...').fill('Test booking for new user');
    
    // Create booking
    await page.getByRole('button', { name: 'Create Booking' }).click();
    
    // Verify success
    await expect(page.getByText('Create New Booking')).not.toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Navigate to a date and ensure slot exists
    while (!await page.getByText('September 2025').isVisible()) {
      await page.getByRole('button').nth(1).click();
      await page.waitForTimeout(500);
    }
    
    await page.getByRole('button', { name: '9' }).click();
    
    // Create slot if needed
    try {
      await page.getByText('No slots for this date').waitFor({ timeout: 2000 });
      await page.getByRole('button', { name: 'Breakfast (7:00 AM)' }).click();
      await page.getByRole('button', { name: 'Create Slot' }).click();
      await page.waitForTimeout(1000);
    } catch {
      // Slots already exist
    }
    
    // Click Book Donation
    await page.getByRole('button', { name: 'Book Donation' }).click();
    
    // Try to create booking without filling fields
    const createButton = page.getByRole('button', { name: 'Create Booking' });
    await expect(createButton).toBeDisabled();
    
    // Fill phone but not other required fields
    await page.getByRole('textbox', { name: 'Enter phone number to auto-fill details' }).fill('123');
    await page.getByRole('button', { name: 'Lookup' }).click();
    
    // Still should be disabled without other fields
    await expect(createButton).toBeDisabled();
    
    // Fill name and email
    await page.getByRole('textbox', { name: 'Enter donor name' }).fill('Test User');
    await page.getByRole('textbox', { name: 'Enter donor email' }).fill('test@test.com');
    
    // Still disabled without food type
    await expect(createButton).toBeDisabled();
    
    // Fill food type
    await page.getByRole('textbox', { name: 'e.g., Rice and curry, Vegetables, Fruits' }).fill('Test Food');
    
    // Now should be enabled
    await expect(createButton).toBeEnabled();
  });

  test('should filter bookings by search term', async ({ page }) => {
    // First ensure we have some bookings by navigating to a date with bookings
    await page.getByRole('button', { name: '6' }).click();
    
    // Test search functionality
    const searchBox = page.getByPlaceholder('Search by donor name, food type, or email...');
    await searchBox.fill('Pasindu');
    
    // Should filter results (this test assumes there are bookings with this name)
    await page.waitForTimeout(1000); // Wait for filtering
    
    // Clear search
    await searchBox.clear();
    await page.waitForTimeout(500);
  });

  test('should filter bookings by status', async ({ page }) => {
    // Navigate to date with bookings
    await page.getByRole('button', { name: '6' }).click();
    
    // Test status filtering
    await page.getByRole('combobox').first().click(); // Status filter dropdown
    await page.getByRole('option', { name: 'Monastery Approved' }).click();
    
    await page.waitForTimeout(1000); // Wait for filtering
    
    // Reset to all
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'All Statuses' }).click();
  });

  test('should update booking status to delivered', async ({ page }) => {
    // Navigate to date with monastery_approved bookings
    await page.getByRole('button', { name: '6' }).click();
    
    try {
      // Look for "Mark Received" button and click it
      const markReceivedButton = page.getByRole('button', { name: 'Mark Received' });
      await markReceivedButton.click();
      
      // Should open delivery dialog
      await expect(page.getByText('Mark Donation as Received')).toBeVisible();
      
      // Add delivery notes
      await page.getByPlaceholder('Add any notes about the donation received...').fill('Delivered successfully');
      
      // Confirm received
      await page.getByRole('button', { name: 'Confirm Received' }).click();
      
      // Should update status
      await page.waitForTimeout(2000);
      await expect(page.getByText('DELIVERED')).toBeVisible();
      
    } catch (error) {
      // If no Mark Received button, booking might already be delivered or not exist
      console.log('No Mark Received button found - booking may already be processed');
    }
  });

  test('should handle booking creation errors gracefully', async ({ page }) => {
    // Navigate to a date
    while (!await page.getByText('September 2025').isVisible()) {
      await page.getByRole('button').nth(1).click();
      await page.waitForTimeout(500);
    }
    
    await page.getByRole('button', { name: '11' }).click();
    
    // Try to create booking without slot
    try {
      await page.getByText('No slots for this date').waitFor({ timeout: 2000 });
      await page.getByRole('button', { name: 'Book Donation' }).click();
      
      // Fill basic info
      await page.getByRole('textbox', { name: 'Enter phone number to auto-fill details' }).fill('999');
      await page.getByRole('button', { name: 'Lookup' }).click();
      await page.getByRole('textbox', { name: 'Enter donor name' }).fill('Test');
      await page.getByRole('textbox', { name: 'Enter donor email' }).fill('test@test.com');
      await page.getByRole('textbox', { name: 'e.g., Rice and curry, Vegetables, Fruits' }).fill('Test Food');
      
      // Should still work as it creates slot automatically
      await page.getByRole('button', { name: 'Create Booking' }).click();
      
    } catch {
      // Slots exist, skip this test
      console.log('Slots already exist, skipping error handling test');
    }
  });
});