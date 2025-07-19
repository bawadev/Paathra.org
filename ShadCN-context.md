# ShadCN Components Context

## Currently Installed Components

The following ShadCN components are already installed and available for use:

### Core UI Components
- **alert.tsx** - Alert notifications and messages
- **avatar.tsx** - User avatar display
- **badge.tsx** - Small status badges and labels
- **button.tsx** - Button components with variants
- **calendar.tsx** - Date picker and calendar
- **card.tsx** - Container cards with header/content/footer
- **checkbox.tsx** - Checkbox input controls
- **dialog.tsx** - Modal dialogs and overlays
- **form.tsx** - Form wrapper and field components
- **input.tsx** - Text input fields
- **label.tsx** - Form labels
- **navigation-menu.tsx** - Navigation menu components
- **popover.tsx** - Floating popover content
- **select.tsx** - Dropdown select inputs
- **sonner.tsx** - Toast notifications
- **switch.tsx** - Toggle switch controls
- **table.tsx** - Data table components
- **textarea.tsx** - Multi-line text input

## Design System Variables

Based on UI templates, the project uses:
- Primary: #D4AF37 (Gold)
- Secondary: #8B4513 (Brown) 
- Accent: #FF6B6B (Coral)
- Text Dark: #2C3E50
- Text Light: #7F8C8D
- Background Light: #F8F9FA
- Background White: #FFFFFF

## Template Standards

The project now follows standardized templates documented in `/docs/TEMPLATE_STANDARDS.md`.

### Available Templates
- **Standard Page Template** (`/templates/page-template.tsx`) - For public pages
- **Protected Page Template** (`/templates/protected-page-template.tsx`) - For authenticated pages

### Standardized Components
- ✅ **Navigation** (components/navigation.tsx) - Consistent across all pages
- ✅ **Auth Form** (components/auth-form.tsx) - Unified authentication
- ✅ **Design System** - CSS custom properties and utility classes

## Codebase Cleanup Completed

### Removed Legacy Files
- ❌ Removed `page_old.tsx` and `page_new.tsx` files
- ❌ Removed `auth-form-old.tsx` and `auth-form-new.tsx` files  
- ❌ Removed unused `/src` directory structure

### Current Standardized Structure
```
/components/
  /ui/           # ShadCN components
  /forms/        # Form components
  navigation.tsx # Global navigation
  auth-form.tsx  # Unified auth form

/templates/      # Template files for new pages
  page-template.tsx
  protected-page-template.tsx

/docs/
  TEMPLATE_STANDARDS.md  # Complete template documentation
```

## Recent Updates

### Pages Updated with New Design System
- ✅ **Home Page** (app/page.tsx) - Hero section with floating animations, gradient text, modern cards
- ✅ **Auth Form** (components/auth-form.tsx) - Split layout with gradient left panel and form right panel
- ✅ **Navigation** (components/navigation.tsx) - Glassmorphism effect with lotus icon
- ✅ **Admin Dashboard** (app/admin/dashboard/page.tsx) - Modern stats cards with gradients and hover effects
- ✅ **Monasteries Page** (app/monasteries/page.tsx) - Beautiful monastery cards with gradient headers

### Template Standardization
- ✅ **Template Documentation** (docs/TEMPLATE_STANDARDS.md) - Comprehensive template and pattern guide
- ✅ **Page Templates** (templates/) - Reusable templates for consistent development
- ✅ **Codebase Cleanup** - Removed duplicate and legacy files
- ✅ **Consistent Structure** - Unified component organization

### Authentication Improvements
- ✅ **Enhanced Auth Context** (lib/auth-context.tsx) - Added proper error handling for refresh token failures
- ✅ **Auth Error Boundary** (components/auth-error-boundary.tsx) - Graceful error handling for auth issues
- ✅ **Auth Utils** (lib/auth-utils.ts) - Utility functions for session management and error recovery
- ✅ **Layout Updates** (app/layout.tsx) - Wrapped with error boundary for better error handling

### Error Handling Features
- **Token Refresh Errors**: Automatic detection and handling of expired/invalid refresh tokens
- **Session Recovery**: Automatic cleanup and redirect when authentication fails
- **User-Friendly Messages**: Clear error messages explaining what happened and how to fix it
- **Graceful Degradation**: App continues to function even when auth errors occur

### Security Improvements
- **Automatic Logout**: Users are automatically signed out when tokens become invalid
- **Session Cleanup**: Complete cleanup of local storage and cookies on auth failure
- **Error Logging**: Proper logging of auth errors for debugging while keeping user data safe

### Custom CSS Classes Added
- `.lotus-icon` - Animated lotus icon for branding
- `.floating-bowl` - Floating animation for hero elements
- `.particle-*` - Floating particle animations
- `.btn-dana-primary` - Custom primary button with gradients
- `.btn-dana-secondary` - Custom secondary button style
- `.card-dana` - Enhanced card with hover effects
- `.gradient-primary` - Primary gradient background
- `.gradient-text` - Gradient text effect
- `.glass-effect` - Glassmorphism background
- `.navbar-fixed` - Fixed navbar with glassmorphism
- `.container-dana` - Responsive container with max-width
- `.fade-in-*` - Animation classes for content reveal

### Animations Added
- `fadeInUp` - Slide up fade animation
- `float` - Floating motion animation  
- `particle-float` - Particle floating animation

## Usage Notes

- All components follow the shadcn/ui patterns
- Components are styled with Tailwind CSS + custom CSS variables
- Custom CSS variables are defined in globals.css
- Forms use react-hook-form with zod validation
- New design system maintains Dana branding with gold/coral color scheme
- Beautiful animations and glassmorphism effects throughout
- Mobile-responsive design with proper breakpoints
