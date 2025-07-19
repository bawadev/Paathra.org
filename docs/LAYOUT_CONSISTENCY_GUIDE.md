# Layout Consistency Guide

## Overview
This document outlines the consistent layout system implemented across the Dhaana application to ensure navigation, content, and footer widths are aligned.

## Container System

### Standard Container Width
All pages now use a consistent container width of `max-w-7xl` (1280px) with responsive padding:

```tsx
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Components Updated
1. **Navigation** (`components/navigation.tsx`)
2. **Footer** (`components/footer.tsx`)
3. **Page Layout** (`components/layout/page-layout.tsx`)
4. **Individual Pages** - All main content areas

## Usage Patterns

### For New Pages
Use the consistent container pattern:

```tsx
// Option 1: Using the LayoutWrapper (recommended)
import { LayoutWrapper } from '@/components/layout/layout-wrapper'

export default function NewPage() {
  return (
    <LayoutWrapper>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your content */}
      </main>
    </LayoutWrapper>
  )
}

// Option 2: Manual implementation
export default function NewPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Your content */}
      </main>
      <Footer />
    </div>
  )
}
```

### For Components
Use the Container component from the layout system:

```tsx
import { Container } from '@/components/layout/layout-wrapper'

function MyComponent() {
  return (
    <Container>
      {/* Content */}
    </Container>
  )
}
```

## Visual Consistency
- **Navigation width**: Matches footer width exactly
- **Footer styling**: Rounded corners with consistent margins
- **Responsive padding**: Adapts to screen size (4px → 6px → 8px)
- **Maximum width**: 1280px (max-w-7xl) for optimal readability

## Migration Checklist
- [x] Navigation component updated
- [x] Footer component updated
- [x] PageLayout component updated
- [x] All main pages updated
- [x] Consistent container system created
- [x] Documentation provided

## Future Considerations
- Container width can be adjusted globally by changing `max-w-7xl` in one place
- Padding can be modified in the container classes
- New pages should follow this pattern for consistency