# Dana Navigation System - Integration Guide

This guide provides instructions for integrating the unified Dana navigation component system into your application.

## Overview

The Dana Navigation System provides a comprehensive, reusable set of navigation components that follow the Enhanced Dana Design System principles with:

- **Consistent styling** across all navigation elements
- **Cultural theming** support for English/Sinhala languages
- **Accessibility features** including ARIA labels and keyboard navigation
- **TypeScript support** with comprehensive type definitions
- **Mobile-responsive design** with proper breakpoints

## Components

### Core Components

1. **NavigationItem** - Base component for navigation links and buttons
2. **NavigationDropdown** - Dropdown menu component with consistent styling
3. **NavigationTrigger** - Trigger button for dropdowns and collapsible menus
4. **UnifiedNavigation** - Complete navigation example implementation

### Supporting Files

- **types.ts** - Comprehensive TypeScript type definitions
- **accessibility.ts** - Accessibility utilities and keyboard navigation
- **index.ts** - Centralized exports

## Integration Steps

### Step 1: Import Components

```typescript
import {
  NavigationItem,
  NavigationDropdown,
  NavigationTrigger,
  // or use the complete example:
  UnifiedNavigation
} from '@/components/navigation'
```

### Step 2: Replace Existing Navigation

#### Option A: Use the Complete UnifiedNavigation Component

```tsx
// Replace your existing navigation with:
import { UnifiedNavigation } from '@/components/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <UnifiedNavigation />
      <main className="pt-20"> {/* Account for fixed nav height */}
        {children}
      </main>
    </div>
  )
}
```

#### Option B: Build Custom Navigation with Components

```tsx
import { NavigationItem, NavigationDropdown } from '@/components/navigation'

export function CustomNavigation() {
  return (
    <nav className="dana-nav">
      <div className="dana-container">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <NavigationItem href="/" variant="ghost">
            Your Logo
          </NavigationItem>

          {/* Navigation Items */}
          <div className="flex items-center space-x-2">
            <NavigationDropdown
              label="Products"
              items={[
                {
                  id: 'item1',
                  title: 'Item 1',
                  description: 'Description',
                  href: '/item1'
                }
              ]}
            />

            <NavigationItem href="/about">
              About
            </NavigationItem>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

### Step 3: Update CSS Classes

The new system uses `dana-nav-*` classes that automatically handle:

- Font weight consistency
- Cultural theming
- Hover states
- Accessibility features

#### Remove Old Classes

Replace these old classes:
- `text-lg font-semibold` → Handled automatically by `dana-nav-trigger`
- `text-lg font-bold` → Handled automatically by `dana-nav-trigger`
- Custom hover states → Built into components

#### New CSS Classes Available

- `.dana-nav` - Main navigation container
- `.dana-nav-trigger` - Navigation trigger buttons
- `.dana-nav-dropdown-content` - Dropdown content containers
- `.dana-nav-dropdown-item` - Dropdown menu items

### Step 4: Language Switcher Integration

The LanguageSwitcher has been updated to use the new system:

```tsx
import { LanguageSwitcher } from '@/components/language-switcher'

// It automatically uses dana-nav-trigger classes for consistency
<LanguageSwitcher />
```

### Step 5: Theme Provider Integration

Ensure your app is wrapped with the ThemeProvider for cultural theming:

```tsx
import { ThemeProvider } from '@/lib/design-system/theme/theme-provider'

export default function RootLayout({ children, params }: {
  children: React.ReactNode
  params: { locale: string }
}) {
  return (
    <html lang={params.locale}>
      <body>
        <ThemeProvider locale={params.locale}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## Cultural Theming

The navigation automatically adapts based on the current locale:

### Sinhala Theme (`si`)
- Font family: `var(--font-sinhala)`
- Font weight: `600` (slightly bolder for readability)
- Line height: `1.75`
- Letter spacing: `0.01em`
- Word spacing: `0.05em`

### English Theme (`en`)
- Font family: `var(--font-geist-sans)`
- Font weight: `500` (standard weight)
- Line height: `1.6`
- Letter spacing: `0`

### Universal Theme (default)
- Same as English theme
- Used as fallback

## Accessibility Features

### Built-in ARIA Support

All components include appropriate ARIA attributes:

```tsx
<NavigationDropdown
  label="Menu"
  items={items}
  aria-label="Main navigation menu"
/>
```

### Keyboard Navigation

- **Tab** - Navigate between items
- **Enter/Space** - Activate items
- **Arrow keys** - Navigate within dropdowns
- **Escape** - Close dropdowns
- **Home/End** - Jump to first/last items

### Screen Reader Support

- Descriptive labels for all interactive elements
- Status announcements for state changes
- Proper heading hierarchy

## Customization Options

### Variants

```tsx
<NavigationItem variant="primary">Primary Button</NavigationItem>
<NavigationItem variant="secondary">Secondary Button</NavigationItem>
<NavigationItem variant="ghost">Ghost Button</NavigationItem>
<NavigationItem variant="outline">Outline Button</NavigationItem>
```

### Sizes

```tsx
<NavigationItem size="sm">Small</NavigationItem>
<NavigationItem size="md">Medium (default)</NavigationItem>
<NavigationItem size="lg">Large</NavigationItem>
```

### With Icons

```tsx
import { Home } from 'lucide-react'

<NavigationItem icon={Home} href="/">
  Home
</NavigationItem>
```

## Migration Checklist

- [ ] Import new navigation components
- [ ] Replace existing navigation implementation
- [ ] Update LanguageSwitcher styling
- [ ] Test with both English and Sinhala locales
- [ ] Verify accessibility with screen readers
- [ ] Test keyboard navigation
- [ ] Check mobile responsiveness
- [ ] Update any custom CSS that conflicts

## Best Practices

1. **Consistent Font Weights**: Use the standard component variants instead of custom font-weight classes
2. **Cultural Sensitivity**: Test with both language locales to ensure proper rendering
3. **Accessibility First**: Always include appropriate ARIA labels
4. **Performance**: Use the pre-built components rather than recreating styles
5. **Responsiveness**: Test on mobile devices and various screen sizes

## Common Issues & Solutions

### Font Weight Inconsistencies
**Problem**: Different font weights between navigation items
**Solution**: Use `dana-nav-trigger` class consistently, avoid manual font-weight overrides

### Cultural Theme Not Applied
**Problem**: Sinhala text not rendering with proper fonts
**Solution**: Ensure ThemeProvider is properly configured with locale prop

### Accessibility Warnings
**Problem**: Missing ARIA labels or keyboard navigation
**Solution**: Use the built-in accessibility utilities and proper component props

## Support

For issues or questions about the Dana Navigation System:
1. Check the TypeScript types for available props
2. Review the UnifiedNavigation component for usage examples
3. Use the accessibility utilities for custom implementations
4. Test with the Playwright test suite for validation