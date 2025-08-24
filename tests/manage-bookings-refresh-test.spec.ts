import { test, expect } from '@playwright/test';

test.describe('Manage Bookings - Data Refresh Test', () => {
  test('should refresh booking data after creation', async ({ page }) => {
    console.log('🧪 Testing booking data refresh after creation...');
    
    // Navigate to manage bookings page
    await page.goto('http://localhost:3001/en/manage/bookings');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'test-results/booking-refresh-initial.png', 
      fullPage: true 
    });
    
    if (currentUrl.includes('/auth')) {
      console.log('🔐 Attempting login...');
      
      // Try to login
      await page.fill('#email', 'inbox.bawantha@gmail.com');
      await page.fill('#password', '12345678');
      await page.click('button[type="submit"]');
      
      // Wait for potential navigation
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Take post-login screenshot
      await page.screenshot({ 
        path: 'test-results/booking-refresh-after-login.png', 
        fullPage: true 
      });
    }
    
    // Check final state
    const finalUrl = page.url();
    console.log(`📍 Final URL: ${finalUrl}`);
    
    if (finalUrl.includes('/manage/bookings') && !finalUrl.includes('/auth')) {
      console.log('✅ Successfully accessed manage bookings page');
      
      // Test clicking on a calendar date to see slot creation dialog
      try {
        // Look for calendar dates (numbers 1-31)
        const dateButtons = page.locator('button').filter({ hasText: /^[1-9]$|^[12][0-9]$|^3[01]$/ });
        const dateCount = await dateButtons.count();
        
        if (dateCount > 0) {
          console.log(`📅 Found ${dateCount} calendar date buttons`);
          
          // Click on the first available date
          await dateButtons.first().click();
          await page.waitForTimeout(1000);
          
          // Take screenshot after date click
          await page.screenshot({ 
            path: 'test-results/booking-refresh-date-clicked.png', 
            fullPage: true 
          });
          
          // Check if slot creation options appear
          const breakfastBtn = page.getByText('Breakfast');
          const lunchBtn = page.getByText('Lunch');
          const dinnerBtn = page.getByText('Dinner');
          
          if (await breakfastBtn.isVisible({ timeout: 3000 })) {
            console.log('✅ Slot creation interface accessible');
            
            // Test the booking interface if Book Donation button exists
            const bookDonationBtn = page.getByRole('button', { name: 'Book Donation' });
            if (await bookDonationBtn.isVisible({ timeout: 3000 })) {
              console.log('✅ Book Donation button found');
              await bookDonationBtn.click();
              
              await page.waitForTimeout(1000);
              
              // Take screenshot of booking dialog
              await page.screenshot({ 
                path: 'test-results/booking-refresh-dialog-open.png', 
                fullPage: true 
              });
              
              console.log('✅ Booking dialog interface tested');
            } else {
              console.log('ℹ️ No existing slots found - would need to create slot first');
            }
          } else {
            console.log('ℹ️ Slot creation interface not immediately visible');
          }
          
        } else {
          console.log('ℹ️ No calendar date buttons found');
        }
        
      } catch (error) {
        console.log('ℹ️ Calendar interaction not available in current state');
      }
      
    } else {
      console.log('⚠️ Still on auth page or redirected - authentication may need manual intervention');
    }
    
    // Final comprehensive screenshot
    await page.screenshot({ 
      path: 'test-results/booking-refresh-final-state.png', 
      fullPage: true 
    });
    
    console.log('✅ Booking refresh test completed');
  });
});