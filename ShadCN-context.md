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

## Recent Updates

### Pages Updated with New Design System
- ✅ **Home Page** (app/page.tsx) - Hero section with floating animations, gradient text, modern cards
- ✅ **Auth Form** (components/auth-form.tsx) - Split layout with gradient left panel and form right panel
- ✅ **Navigation** (components/navigation.tsx) - Glassmorphism effect with lotus icon
- ✅ **Admin Dashboard** (app/admin/dashboard/page.tsx) - Modern stats cards with gradients and hover effects
- ✅ **Monasteries Page** (app/monasteries/page.tsx) - Beautiful monastery cards with gradient headers

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
