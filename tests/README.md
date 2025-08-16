# Playwright Testing Setup

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

## Installation

Playwright is already installed as a dev dependency. To install browsers:

```bash
npx playwright install
```

## Running Tests

### All tests
```bash
npm run test
```

### Tests with UI mode (interactive)
```bash
npm run test:ui
```

### Tests in headed mode (see browser)
```bash
npm run test:headed
```

### Debug mode
```bash
npm run test:debug
```

### View test report
```bash
npm run test:report
```

## Test Structure

Tests are organized in the `/tests` directory:

- `home.spec.ts` - Tests for the homepage
- `donations.spec.ts` - Tests for donation functionality
- `monasteries.spec.ts` - Tests for monasteries pages
- `admin.spec.ts` - Tests for admin sections
- `auth.spec.ts` - Tests for authentication flow
- `manage.spec.ts` - Tests for management pages
- `utils/test-helpers.ts` - Utility functions for tests

## Configuration

The Playwright configuration is in `playwright.config.ts`. Key settings:

- **Base URL**: http://localhost:3000
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 retries on CI, 0 locally
- **Reporters**: HTML report
- **Screenshots**: Taken on failure
- **Videos**: Recorded on failure
- **Trace**: Collected on first retry

## Development Server

Tests automatically start the development server before running. The server runs on http://localhost:3000.

## Test Writing Guidelines

1. **Use descriptive test names** that explain what is being tested
2. **Wait for page loads** using `await page.waitForLoadState('networkidle')`
3. **Take screenshots** for visual verification, especially on failures
4. **Test responsive design** by setting different viewport sizes
5. **Check for accessibility** using heading structure and ARIA roles
6. **Handle authentication** by testing both authenticated and unauthenticated states

## Example Test

```typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  await expect(page).toHaveTitle(/Dhaana/i);
  await page.screenshot({ path: 'test-results/homepage.png' });
});
```

## CI/CD

Tests run automatically on:
- Push to main/master/develop branches
- Pull requests to main/master/develop branches

GitHub Actions workflow is in `.github/workflows/playwright.yml`.

## Debugging

1. **Use `page.pause()`** to pause execution and inspect
2. **Use `--debug` flag** to run in debug mode
3. **Check console logs** in the browser developer tools
4. **View screenshots** in the `test-results` directory
5. **Use Playwright Inspector** with `npx playwright test --debug`

## Troubleshooting

- **Tests failing locally**: Make sure dev server is running on port 3000
- **Browser not found**: Run `npx playwright install`
- **Timeout issues**: Increase timeout in test or use `page.waitForTimeout()`
- **Flaky tests**: Add proper waits for elements and network requests

## Visual Testing

Screenshots are automatically saved to `test-results/` directory for:
- Manual verification
- Debugging failures
- Visual regression testing (future enhancement)

## Future Enhancements

- Visual regression testing with screenshot comparison
- API testing for backend endpoints
- Performance testing with Lighthouse
- Accessibility testing with axe-core
- Database state management for isolated tests
