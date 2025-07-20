# Playwright Testing Setup for Dhaana

This document describes the Playwright testing setup for the Dhaana donation management application.

## 🚀 Quick Start

### Prerequisites
- Node.js and npm installed
- Development server running (`npm run dev`)

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests with UI mode for debugging
npm run test:ui

# Run tests in debug mode
npm run test:debug

# View test reports
npm run test:report

# Run tests with custom script
./run-tests.sh
```

## 📁 Test Structure

```
tests/
├── fixtures/
│   └── auth-fixture.ts          # Authentication utilities
├── utils/
│   └── test-helpers.ts         # Common test utilities
├── admin.spec.ts               # Admin page tests (no auth)
├── admin-authenticated.spec.ts # Admin tests with authentication
├── auth.spec.ts                # Basic authentication tests
├── auth-with-login.spec.ts     # Login flow tests
├── donations.spec.ts           # Donation flow tests
├── e2e-workflow.spec.ts        # End-to-end workflow tests
├── home.spec.ts                # Home page tests
├── manage.spec.ts              # Management page tests
└── monasteries.spec.ts         # Monastery page tests
```

## 🔐 Authentication

Tests use the following credentials for authenticated scenarios:
- **Email**: inbox.bawantha@gmail.com
- **Password**: 12345678

### Authentication Test Types

1. **Basic Auth Tests** (`auth.spec.ts`)
   - Tests login form display
   - Tests protected route redirects
   - Tests navigation after auth redirects

2. **Login Flow Tests** (`auth-with-login.spec.ts`)
   - Tests successful login with valid credentials
   - Tests access to protected admin areas
   - Tests logout functionality

3. **Authenticated Feature Tests**
   - Admin dashboard access
   - Donation management features
   - User-specific content

## 🧪 Test Categories

### 1. Home Page Tests (`home.spec.ts`)
- Basic page loading
- Navigation functionality
- Mobile responsiveness

### 2. Donation Tests (`donations.spec.ts`)
- Donation page navigation
- Calendar display
- Booking form interaction
- Authenticated donation features
- User donation history

### 3. Admin Tests (`admin-authenticated.spec.ts`)
- Dashboard access
- User management
- Booking management
- Monastery management
- Settings access

### 4. End-to-End Tests (`e2e-workflow.spec.ts`)
- Complete donation workflow
- Admin workflow navigation
- Monastery browsing workflow

### 5. Management Tests (`manage.spec.ts`)
- Manage page access
- Booking management
- Monastery management
- Slot management

## 📸 Screenshots and Reports

- **Screenshots**: Saved to `test-results/` directory
- **HTML Reports**: Generated in `playwright-report/`
- **Videos**: Recorded on failure (saved to `test-results/`)
- **Traces**: Available for failed tests

## ⚙️ Configuration

### Playwright Config (`playwright.config.ts`)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: http://localhost:3000
- **Timeouts**: 30s navigation, 10s elements
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

### Test Environment
- **Dev Server**: Auto-started before tests
- **Parallel Execution**: Yes (with proper isolation)
- **Network Wait**: Tests wait for network idle
- **Error Handling**: Console errors captured

## 🔧 Utilities and Helpers

### Test Helpers (`tests/utils/test-helpers.ts`)
- `waitForPageLoad()` - Wait for complete page load
- `checkForConsoleErrors()` - Monitor console errors
- `fillFormField()` - Smart form filling
- `checkBasicAccessibility()` - Accessibility checks
- `takeScreenshot()` - Descriptive screenshots
- `clickElement()` - Safe element clicking
- `checkForErrorState()` - Error state detection

### Authentication Fixture (`tests/fixtures/auth-fixture.ts`)
- Pre-authenticated page fixture
- Test configuration constants
- Reusable authentication logic

## 🚨 Important Notes

### Test Safety
- Tests are designed to be non-destructive
- Booking forms are examined but not submitted
- Test data is clearly marked and isolated

### CI/CD Integration
- GitHub Actions workflow included (`.github/workflows/playwright.yml`)
- Automatic browser installation
- Artifact upload for reports
- Runs on pushes and pull requests

### Debugging
```bash
# Debug specific test
npx playwright test tests/donations.spec.ts --debug

# Run with browser visible
npx playwright test --headed

# Generate and view trace
npx playwright test --trace on
npx playwright show-trace trace.zip
```

## 📝 Writing New Tests

### Basic Test Structure
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await page.waitForLoadState('networkidle');
    
    // Your test logic here
    
    await page.screenshot({ path: 'test-results/feature-test.png' });
  });
});
```

### Authenticated Test
```typescript
import { test, expect } from '@playwright/test';

// Use the loginUser helper from other test files
async function loginUser(page: any) {
  // Login logic here
}

test('should access protected feature', async ({ page }) => {
  await loginUser(page);
  await page.goto('/protected-page');
  // Test logic
});
```

## 🔍 Monitoring and Maintenance

### Regular Checks
1. Update test credentials if needed
2. Review and update selectors as UI changes
3. Add new tests for new features
4. Maintain test data isolation
5. Update browser versions regularly

### Performance
- Tests run in parallel for speed
- Screenshots only on relevant tests
- Network waits optimized for stability
- Proper cleanup between tests

---

For more information about Playwright, visit: https://playwright.dev/
