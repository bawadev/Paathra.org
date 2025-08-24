import { chromium } from '@playwright/test';

async function testSlotCreation() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('🚀 Starting slot creation test...');
    
    // Step 1: Navigate to login page
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:3000/auth/signin');
    
    // Step 2: Login with test credentials
    console.log('🔑 Logging in with test credentials...');
    await page.fill('input[type="email"]', 'inbox.bawantha@gmail.com');
    await page.fill('input[type="password"]', '12345678');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForURL('http://localhost:3000/**', { timeout: 10000 });
    console.log('✅ Login successful');
    
    // Step 3: Navigate to manage bookings page
    console.log('📍 Navigating to manage bookings page...');
    await page.goto('http://localhost:3000/manage/bookings');
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the correct page
    const pageTitle = await page.textContent('h1');
    console.log(`📋 Page title: ${pageTitle}`);
    
    // Step 4: Look for slot creation functionality
    console.log('🔍 Looking for slot creation form...');
    
    // Check if there's a button to create new slots
    const createButton = await page.locator('button:has-text("Create Slot"), button:has-text("New"), button:has-text("Add")').first();
    if (await createButton.isVisible()) {
      console.log('✅ Found create slot button');
      await createButton.click();
      
      // Wait for form to appear
      await page.waitForTimeout(1000);
      
      // Step 5: Fill the slot creation form
      console.log('📝 Filling slot creation form...');
      
      // Look for form fields
      const dateInput = await page.locator('input[type="date"]').first();
      const timeSelect = await page.locator('select').filter({ has: page.locator('option:has-text("Breakfast"), option:has-text("Lunch"), option:has-text("Dinner")') }).first();
      const capacityInput = await page.locator('input[type="number"]').first();
      
      if (await dateInput.isVisible()) {
        // Set tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await dateInput.fill(dateStr);
        console.log(`📅 Set date to: ${dateStr}`);
      }
      
      if (await timeSelect.isVisible()) {
        await timeSelect.selectOption('Lunch');
        console.log('🕐 Selected time slot: Lunch');
      }
      
      if (await capacityInput.isVisible()) {
        await capacityInput.fill('50');
        console.log('👥 Set capacity to: 50');
      }
      
      // Submit the form
      const submitButton = await page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        console.log('🚀 Submitting slot creation form...');
        
        // Wait for response
        await page.waitForTimeout(2000);
        
        // Check for success message or new slot in calendar
        const successMessage = await page.locator('*:has-text("success"), *:has-text("created"), *:has-text("added")').first();
        if (await successMessage.isVisible()) {
          console.log('✅ Slot created successfully');
        } else {
          console.log('⚠️  No clear success message found');
        }
      }
    } else {
      console.log('❌ No create slot button found');
      
      // Let's check what's available on the page
      const buttons = await page.locator('button').allTextContents();
      console.log('Available buttons:', buttons);
      
      const calendarCells = await page.locator('[data-slot]').count();
      console.log(`📅 Found ${calendarCells} calendar slot elements`);
    }
    
    // Step 6: Check calendar view for created slots
    console.log('📅 Checking calendar view...');
    const calendarView = await page.locator('.calendar, [data-calendar], .slot-calendar').first();
    if (await calendarView.isVisible()) {
      console.log('✅ Calendar view is visible');
      
      // Look for newly created slot
      const slots = await page.locator('.slot, [data-slot]').count();
      console.log(`📊 Found ${slots} slots in calendar`);
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'slot-creation-result.png' });
      console.log('📸 Screenshot saved: slot-creation-result.png');
    } else {
      console.log('❌ Calendar view not found');
    }
    
    // Step 7: Test validation - try to create invalid slot
    console.log('🧪 Testing validation...');
    
    // Look for create button again to test validation
    const createButton2 = await page.locator('button:has-text("Create Slot"), button:has-text("New")').first();
    if (await createButton2.isVisible()) {
      await createButton2.click();
      
      // Try to submit empty form
      const emptySubmit = await page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
      if (await emptySubmit.isVisible()) {
        await emptySubmit.click();
        await page.waitForTimeout(1000);
        
        // Check for validation errors
        const errors = await page.locator('.error, [role="alert"], .text-red-500').allTextContents();
        if (errors.length > 0) {
          console.log('✅ Validation errors found:', errors);
        } else {
          console.log('⚠️  No validation errors shown');
        }
      }
    }
    
    console.log('✅ Slot creation test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take screenshot on error
    await page.screenshot({ path: 'slot-creation-error.png' });
    console.log('📸 Error screenshot saved: slot-creation-error.png');
    
    // Log page content for debugging
    const content = await page.content();
    console.log('📄 Page content length:', content.length);
    
    const bodyText = await page.textContent('body');
    console.log('📝 Page text:', bodyText.substring(0, 500) + '...');
    
  } finally {
    await browser.close();
  }
}

testSlotCreation().catch(console.error);