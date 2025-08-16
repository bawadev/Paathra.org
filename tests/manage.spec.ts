import { test, expect } from '@playwright/test';

test.describe('Management Pages', () => {
  test('should load manage page', async ({ page }) => {
    await page.goto('/manage');
    await page.waitForLoadState('networkidle');
    
    // Check that the page loads
    const currentUrl = page.url();
    expect(currentUrl).toContain('/manage');
    
    await page.screenshot({ path: 'test-results/manage-page.png' });
  });

  test('should load manage bookings page', async ({ page }) => {
    await page.goto('/manage/bookings');
    await page.waitForLoadState('networkidle');
    
    // Check for basic page functionality
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('This page could not be found');
    
    await page.screenshot({ path: 'test-results/manage-bookings.png' });
  });

  test('should load manage monastery page', async ({ page }) => {
    await page.goto('/manage/monastery');
    await page.waitForLoadState('networkidle');
    
    // Check for basic page functionality
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('This page could not be found');
    
    await page.screenshot({ path: 'test-results/manage-monastery.png' });
  });

  test('should load manage slots page', async ({ page }) => {
    await page.goto('/manage/slots');
    await page.waitForLoadState('networkidle');
    
    // Check for basic page functionality
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('404');
    expect(bodyText).not.toContain('This page could not be found');
    
    await page.screenshot({ path: 'test-results/manage-slots.png' });
  });
});
