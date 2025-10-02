# Unified Dropdown Component

The `UnifiedDropdown` component provides a standardized dropdown interface for the Dana Design System, replacing all inconsistent dropdown implementations throughout the application.

## Overview

This component addresses the inconsistencies found in the current navigation dropdowns by providing:

- **Consistent styling** with Dana Design System patterns
- **Cultural theming support** for English/Sinhala locales
- **Flexible configuration** for different use cases
- **Accessibility compliance** with proper ARIA attributes
- **Responsive design** with mobile-friendly variants
- **Type safety** with comprehensive TypeScript interfaces

## Key Features

### Design System Integration
- Uses shadcn/ui dropdown-menu as the base component
- Follows Dana Design System color palette and spacing
- Implements consistent backdrop blur and shadow effects
- Supports cultural typography adjustments

### Width Variants
- `sm` (200px) - Compact dropdowns like language switcher
- `md` (300px) - Standard dropdowns for most use cases
- `lg` (400px) - Rich content dropdowns with descriptions
- `xl` (500px) - Complex dropdowns with multiple sections
- `auto` - Responsive width based on content

### Cultural Theming
- Automatic locale detection from next-intl
- Sinhala typography adjustments (increased padding, line height)
- English optimized spacing and typography
- Cultural color scheme integration

## Basic Usage

```tsx
import { UnifiedDropdown, createDropdownItems, createDropdownTrigger } from '@/components/ui/unified-dropdown'

// Basic dropdown
<UnifiedDropdown
  items={createDropdownItems([
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
    },
    {
      type: 'separator',
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      variant: 'destructive',
      onClick: handleSignOut,
    },
  ])}
  trigger={createDropdownTrigger('Menu')}
  width="sm"
/>
```

## Props Interface

### UnifiedDropdownProps

```tsx
interface UnifiedDropdownProps {
  items: DropdownItem[]
  trigger: DropdownTriggerProps
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'auto'
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  collisionPadding?: number
  culturalTheme?: 'sinhala' | 'english' | 'auto'
  enableCulturalAdaptation?: boolean
  className?: string
  contentClassName?: string
  onOpenChange?: (open: boolean) => void
  'aria-label'?: string
}
```

### DropdownItem

```tsx
interface DropdownItem {
  type: 'item' | 'separator' | 'label'
  key: string
  icon?: LucideIcon
  label?: string
  description?: string
  href?: string
  onClick?: (e: React.MouseEvent) => void | Promise<void>
  variant?: 'default' | 'destructive' | 'accent'
  disabled?: boolean
  selected?: boolean
  className?: string
}
```

### DropdownTriggerProps

```tsx
interface DropdownTriggerProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showChevron?: boolean
}
```

## Preset Configurations

The component includes preset configurations for common use cases:

### Profile Dropdown
```tsx
import { DropdownPresets } from '@/components/ui/unified-dropdown'

const profileConfig = DropdownPresets.profile(profile, signOut)

<UnifiedDropdown
  {...profileConfig}
  trigger={createDropdownTrigger(
    <div className="flex items-center space-x-3">
      <Avatar>...</Avatar>
      <span>{profile?.full_name}</span>
    </div>
  )}
/>
```

### Language Switcher
```tsx
const languageConfig = DropdownPresets.language(
  currentLocale,
  handleLocaleChange,
  ['en', 'si']
)

<UnifiedDropdown
  {...languageConfig}
  trigger={createDropdownTrigger(
    <>
      <Globe className="w-4 h-4" />
      {localeNames[locale]}
    </>
  )}
/>
```

### Navigation Menu
```tsx
const navigationConfig = DropdownPresets.navigation([
  {
    key: 'dashboard',
    icon: BarChart3,
    label: 'Dashboard',
    description: 'View system analytics',
    href: '/admin/dashboard',
  },
  // ... more items
])

<UnifiedDropdown
  {...navigationConfig}
  trigger={createDropdownTrigger('Admin')}
/>
```

## Advanced Examples

### Custom Item Types
```tsx
const items = createDropdownItems([
  {
    type: 'label',
    label: 'Quick Actions',
  },
  {
    icon: Calendar,
    label: 'Schedule Donation',
    description: 'Book a new donation slot',
    href: '/donate',
  },
  {
    type: 'separator',
  },
  {
    icon: LogOut,
    label: 'Sign Out',
    variant: 'destructive',
    onClick: handleSignOut,
  },
])
```

### Cultural Theme Override
```tsx
<UnifiedDropdown
  items={items}
  trigger={trigger}
  culturalTheme="sinhala"
  enableCulturalAdaptation={true}
  width="lg"
/>
```

### Custom Styling
```tsx
<UnifiedDropdown
  items={items}
  trigger={trigger}
  className="custom-dropdown"
  contentClassName="bg-gradient-to-b from-primary/5 to-primary/10"
/>
```

## Helper Functions

### createDropdownItems()
Creates an array of properly typed dropdown items with defaults applied.

```tsx
const items = createDropdownItems([
  {
    icon: User,
    label: 'Profile',
    href: '/profile',
  },
  {
    type: 'separator',
  },
])
```

### createDropdownTrigger()
Creates a properly configured trigger element with Dana Design System styling.

```tsx
const trigger = createDropdownTrigger(
  'Menu Text',
  {
    variant: 'outline',
    size: 'lg',
    showChevron: false,
  }
)
```

### getCulturalDropdownProps()
Returns cultural theme props based on current locale.

```tsx
const culturalProps = getCulturalDropdownProps(locale)

<UnifiedDropdown
  {...culturalProps}
  // ... other props
/>
```

## Migration Guide

### From NavigationMenu Dropdowns
Replace existing NavigationMenu dropdown patterns:

**Before:**
```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="bg-card rounded-2xl p-6 w-[400px]">
          {/* Custom content */}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

**After:**
```tsx
<UnifiedDropdown
  items={navigationItems}
  trigger={createDropdownTrigger('Menu')}
  width="lg"
/>
```

### From Custom Dropdowns
Replace custom dropdown implementations with standardized approach:

**Before:**
```tsx
// Custom dropdown with inconsistent styling
<div className="relative">
  <button onClick={toggle}>Trigger</button>
  {isOpen && (
    <div className="absolute top-full bg-white shadow-lg...">
      {/* Custom items */}
    </div>
  )}
</div>
```

**After:**
```tsx
<UnifiedDropdown
  items={dropdownItems}
  trigger={createDropdownTrigger('Trigger')}
  onOpenChange={setIsOpen}
/>
```

## Accessibility Features

- **Keyboard Navigation**: Full arrow key and Enter/Space support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Automatic focus trapping and restoration
- **High Contrast**: Adapts to system accessibility preferences
- **Reduced Motion**: Respects user motion preferences

## Styling Classes

The component uses the following CSS classes that can be customized:

- `.dana-nav-trigger` - Trigger button styling
- `.dana-nav-dropdown-content` - Content container styling
- `.dana-nav-dropdown-item` - Individual item styling

Cultural variants automatically apply:
- `.theme-sinhala` - Sinhala typography adjustments
- `.theme-english` - English typography optimizations

## Performance Considerations

- **Lazy Loading**: Icons and content are loaded on demand
- **Memoization**: Preset configurations are memoized for performance
- **Small Bundle**: Only includes necessary dependencies
- **Tree Shaking**: Unused presets and helpers are automatically removed

## Browser Support

- Modern browsers with ES2020+ support
- Mobile browsers on iOS 12+ and Android 8+
- Requires CSS Grid and Flexbox support
- Graceful degradation for older browsers

## Related Components

- `Avatar` - For profile dropdown triggers
- `Button` - For custom trigger elements
- `Badge` - For notification indicators
- `Separator` - For dropdown dividers