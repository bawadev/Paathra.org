import { Page, expect } from '@playwright/test';

/**
 * Utility functions for Playwright tests
 */

/**
 * Wait for the page to be fully loaded including all network requests
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500); // Additional small delay for stability
}

/**
 * Check if a page has any console errors
 */
export async function checkForConsoleErrors(page: Page) {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Fill a form field by label or placeholder
 */
export async function fillFormField(page: Page, labelOrPlaceholder: string, value: string) {
  const field = page.locator(`input[aria-label="${labelOrPlaceholder}"], input[placeholder="${labelOrPlaceholder}"], input[name="${labelOrPlaceholder}"]`);
  await field.fill(value);
}

/**
 * Check if the page is accessible (has proper headings, main content, etc.)
 */
export async function checkBasicAccessibility(page: Page) {
  // Check for main content area
  const main = page.locator('main, [role="main"]');
  await expect(main).toBeVisible();
  
  // Check for at least one heading
  const headings = page.locator('h1, h2, h3, h4, h5, h6');
  expect(await headings.count()).toBeGreaterThan(0);
}

/**
 * Navigate and wait for a specific page
 */
export async function navigateToPage(page: Page, path: string) {
  await page.goto(path);
  await waitForPageLoad(page);
}

/**
 * Check if authentication is required for a page
 */
export async function checkAuthRequired(page: Page, path: string) {
  await page.goto(path);
  await waitForPageLoad(page);
  
  const currentUrl = page.url();
  return !currentUrl.includes(path);
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ 
    path: `test-results/${name}.png`,
    fullPage: true 
  });
}

/**
 * Wait for and click an element safely
 */
export async function clickElement(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible' });
  await page.click(selector);
  await page.waitForTimeout(500); // Wait for any animations
}

/**
 * Check if a page has a specific error state
 */
export async function checkForErrorState(page: Page) {
  const bodyText = await page.textContent('body');
  const hasError = bodyText?.includes('404') || 
                  bodyText?.includes('500') || 
                  bodyText?.includes('Error') ||
                  bodyText?.includes('This page could not be found');
  
  return hasError;
}
