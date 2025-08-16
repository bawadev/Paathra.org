/**
 * Testing Setup and Utilities
 * 
 * Provides testing infrastructure, utilities, and mocks
 * for the Dhaana application.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { ErrorProvider } from '@/lib/error-management'
import { LoadingProvider } from '@/lib/loading-system'

/**
 * Test Wrapper for Components
 */
interface TestWrapperProps {
  children: ReactNode
  enableErrorProvider?: boolean
  enableLoadingProvider?: boolean
}

export function TestWrapper({ 
  children, 
  enableErrorProvider = true,
  enableLoadingProvider = true 
}: TestWrapperProps) {
  let wrapped = <>{children}</>

  if (enableLoadingProvider) {
    wrapped = <LoadingProvider>{wrapped}</LoadingProvider>
  }

  if (enableErrorProvider) {
    wrapped = <ErrorProvider enableLogging={false}>{wrapped}</ErrorProvider>
  }

  return wrapped
}

/**
 * Custom Render Function
 */
interface CustomRenderOptions {
  wrapper?: React.ComponentType<{ children: ReactNode }>
  enableProviders?: boolean
}

export function customRender(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { wrapper, enableProviders = true } = options

  const Wrapper = wrapper || (enableProviders ? TestWrapper : undefined)

  return render(ui, { wrapper: Wrapper })
}

/**
 * Mock Data Generators
 */
export const mockData = {
  user: (overrides = {}) => ({
    id: 'test-user-1',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  profile: (overrides = {}) => ({
    id: 'test-profile-1',
    user_id: 'test-user-1',
    full_name: 'Test User',
    role: 'donor' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  monastery: (overrides = {}) => ({
    id: 'test-monastery-1',
    name: 'Test Monastery',
    description: 'A test monastery for development',
    location: 'Test City, Test Country',
    dietary_requirements: ['vegetarian'],
    contact_info: {
      email: 'contact@testmonastery.org',
      phone: '+1234567890'
    },
    admin_id: 'test-admin-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  donationSlot: (overrides = {}) => ({
    id: 'test-slot-1',
    monastery_id: 'test-monastery-1',
    date: '2024-12-25',
    start_time: '09:00:00',
    end_time: '11:00:00',
    capacity: 50,
    current_bookings: 10,
    is_available: true,
    requirements: 'Vegetarian meals only',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  booking: (overrides = {}) => ({
    id: 'test-booking-1',
    donor_id: 'test-user-1',
    slot_id: 'test-slot-1',
    food_type: 'rice',
    quantity: 10,
    unit: 'kg',
    notes: 'Fresh rice from local farm',
    status: 'confirmed' as const,
    contact_name: 'Test Donor',
    contact_phone: '+1234567890',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides
  })
}

/**
 * Mock Supabase Client
 */
export const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        order: jest.fn(() => ({
          limit: jest.fn()
        }))
      })),
      order: jest.fn(() => ({
        limit: jest.fn()
      })),
      limit: jest.fn()
    })),
    insert: jest.fn(() => ({
      select: jest.fn()
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn()
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn()
    }))
  }))
}

/**
 * Test Utilities
 */
export const testUtils = {
  // Wait for element to appear
  waitForElement: async (selector: string) => {
    return await waitFor(() => screen.getByTestId(selector))
  },

  // Wait for element to disappear
  waitForElementToDisappear: async (selector: string) => {
    return await waitFor(() => {
      expect(screen.queryByTestId(selector)).not.toBeInTheDocument()
    })
  },

  // Fill form field
  fillField: async (label: string, value: string) => {
    const field = screen.getByLabelText(label)
    fireEvent.change(field, { target: { value } })
    await waitFor(() => {
      expect(field).toHaveValue(value)
    })
  },

  // Click button and wait
  clickAndWait: async (buttonText: string, waitFor?: string) => {
    const button = screen.getByRole('button', { name: buttonText })
    fireEvent.click(button)
    
    if (waitFor) {
      await testUtils.waitForElement(waitFor)
    }
  },

  // Simulate user authentication
  simulateAuth: (user = mockData.user(), profile = mockData.profile()) => {
    // Mock auth context
    return {
      user,
      profile,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn()
    }
  },

  // Create test error
  createTestError: (message: string, type = 'UNKNOWN_ERROR') => ({
    id: 'test-error',
    type,
    message,
    timestamp: new Date(),
    context: { test: true }
  })
}

/**
 * Custom Matchers
 */
expect.extend({
  toBeInErrorState(received) {
    const pass = received && received.classList.contains('error')
    
    if (pass) {
      return {
        message: () => `expected element not to be in error state`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected element to be in error state`,
        pass: false,
      }
    }
  },

  toBeLoading(received) {
    const pass = received && (
      received.classList.contains('loading') ||
      received.querySelector('[data-testid="loading-spinner"]')
    )
    
    if (pass) {
      return {
        message: () => `expected element not to be loading`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected element to be loading`,
        pass: false,
      }
    }
  }
})

/**
 * Performance Testing Utilities
 */
export const performanceTests = {
  // Measure component render time
  measureRenderTime: async (renderFn: () => void) => {
    const start = performance.now()
    renderFn()
    const end = performance.now()
    return end - start
  },

  // Test for memory leaks
  testMemoryLeak: (componentFactory: () => ReactElement, iterations = 100) => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0
    
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(componentFactory())
      unmount()
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0
    return finalMemory - initialMemory
  },

  // Test bundle size impact
  estimateBundleImpact: (importFn: () => Promise<any>) => {
    const start = Date.now()
    return importFn().then(() => {
      const loadTime = Date.now() - start
      return { loadTime }
    })
  }
}

/**
 * Accessibility Testing Utilities
 */
export const a11yTests = {
  // Check for ARIA labels
  hasAriaLabel: (element: HTMLElement) => {
    return element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')
  },

  // Check for keyboard navigation
  isKeyboardAccessible: (element: HTMLElement) => {
    return element.tabIndex >= 0 || element.tagName === 'BUTTON' || element.tagName === 'A'
  },

  // Check color contrast (simplified)
  hasGoodContrast: (element: HTMLElement) => {
    const styles = window.getComputedStyle(element)
    // Simplified check - in real tests, use proper contrast calculation
    return styles.color !== styles.backgroundColor
  }
}

/**
 * E2E Test Utilities (for Playwright/Cypress)
 */
export const e2eUtils = {
  // Common selectors
  selectors: {
    authForm: '[data-testid="auth-form"]',
    navigation: '[data-testid="navigation"]',
    loadingSpinner: '[data-testid="loading-spinner"]',
    errorMessage: '[data-testid="error-message"]',
    donationForm: '[data-testid="donation-form"]',
    calendar: '[data-testid="donation-calendar"]'
  },

  // Common actions
  actions: {
    signIn: async (page: any, email: string, password: string) => {
      await page.fill('[name="email"]', email)
      await page.fill('[name="password"]', password)
      await page.click('[type="submit"]')
    },

    waitForAuth: async (page: any) => {
      await page.waitForSelector(e2eUtils.selectors.navigation)
    },

    selectDate: async (page: any, date: string) => {
      await page.click(`[data-date="${date}"]`)
    }
  }
}

// Re-export testing utilities
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
