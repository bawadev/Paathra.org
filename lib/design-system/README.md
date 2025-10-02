# Enhanced Dana Design System

A comprehensive, culturally-sensitive design system for Buddhist monastery donation platforms, built upon the existing "Elegant Dana Design System" with enhanced multilingual support and spiritual-inspired interactions.

## 🌟 Key Features

### 🎨 **Enhanced Color System**
- **Primary Dana Gold**: Warm, trustworthy gold inspired by Buddhist traditions
- **Trust Blue**: Confidence-building blue for donation flows
- **Spiritual Purple**: Deep contemplative purple for meditation contexts
- **Compassion Green**: Growth and positive outcome associations
- **Cultural Color Variants**: Locale-specific color adaptations

### ✍️ **Multilingual Typography**
- **Sinhala Script Support**: Optimized typography with proper spacing and font features
- **Cultural Typography**: Responsive scaling and appropriate line heights
- **Font Feature Settings**: OpenType features for proper script rendering
- **Reading Optimization**: Optimal character counts and spacing for each language

### 🧘 **Meditation-Inspired Animations**
- **Breathing Patterns**: Duration scales based on natural breathing rhythms
- **Peaceful Easings**: Gentle, serene transition curves
- **Lotus Bloom**: Success animations inspired by Buddhist symbolism
- **Mindful Interactions**: Non-jarring, contemplative user experiences

### 🌍 **Cultural Sensitivity**
- **Buddhist-Appropriate**: Respectful use of concepts without religious appropriation
- **Community-Focused**: Designed for Sri Lankan Buddhist communities
- **Universal Access**: Inclusive design for users of all backgrounds
- **Culturally-Aware Components**: Context-specific variants for different cultural needs

## 📁 Structure

```
lib/design-system/
├── tokens/                 # Design tokens (colors, typography, spacing, animations)
├── theme/                  # Theme provider and configuration
├── components/             # Enhanced component variants with CVA
├── cultural/               # Cultural adaptations and language-specific layouts
├── __tests__/             # Tests and usage examples
└── index.ts               # Main export
```

## 🚀 Quick Start

### 1. Install Dependencies
The design system uses your existing dependencies:
- `class-variance-authority` (already installed)
- `@radix-ui/*` components (already installed)
- `tailwindcss` (already configured)

### 2. Wrap Your App with Theme Provider

```tsx
import { ThemeProvider } from '@/lib/design-system/theme'

function App() {
  return (
    <ThemeProvider
      defaultMode="light"
      defaultCultural="universal"
      defaultContext="general"
      locale="en" // or "si" for Sinhala
    >
      {/* Your app content */}
    </ThemeProvider>
  )
}
```

### 3. Use Enhanced Components

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

function DonationCard() {
  return (
    <Card variant="donation" context="donation" size="lg">
      <CardHeader>
        <h2>Make a Donation</h2>
      </CardHeader>
      <CardContent>
        <p>Support your local monastery</p>
        <Button variant="donate" size="lg" animation="enhanced">
          Donate Now
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 4. Cultural Variants

```tsx
// Sinhala language support
<Button
  variant="sinhala"
  cultural="sinhala"
  size="lg"
>
  ආධාර කරන්න
</Button>

// Spiritual context
<Card
  variant="spiritual"
  context="spiritual"
  animation="meditative"
>
  {/* Spiritual content */}
</Card>
```

## 🎭 Component Variants

### Button Variants
- `default`, `spiritual`, `trust`, `compassion`
- `donate`, `monastery`, `peaceful`
- `sinhala`, `cultural`, `lotus`, `enlightened`

### Card Variants
- `default`, `spiritual`, `monastery`, `trust`
- `donation`, `peaceful`, `lotus`, `glass`
- Cultural and context-aware variants

### Input Variants
- `default`, `spiritual`, `trust`, `peaceful`
- `donation`, `monastery`, `sinhala`
- Validation states with cultural sensitivity

## 🌐 Cultural Support

### Sinhala Language
```tsx
import { createCulturalContext } from '@/lib/design-system/cultural'

const sinhalaContext = createCulturalContext('si', {
  density: 'comfortable',
  deviceType: 'desktop'
})

// Use context.classes for cultural styling
<div className={sinhalaContext.classes}>
  {/* Sinhala-optimized content */}
</div>
```

### Responsive Cultural Typography
- **Line Height**: 1.75 for Sinhala, 1.6 for English
- **Letter Spacing**: 0.01em for Sinhala, 0em for English
- **Font Scaling**: Responsive adjustments per device type
- **Reading Width**: Optimized character counts per language

## 🎨 Theme Contexts

### Donation Context
```tsx
import { useDonationTheme } from '@/lib/design-system/theme'

function DonationPage() {
  useDonationTheme() // Automatically applies donation context

  return (
    <div>
      {/* Trust-building, donation-optimized styling */}
    </div>
  )
}
```

### Spiritual Context
```tsx
import { useSpiritualTheme } from '@/lib/design-system/theme'

function MeditationPage() {
  useSpiritualTheme() // Peaceful, contemplative styling

  return (
    <div>
      {/* Spiritual, meditative styling */}
    </div>
  )
}
```

## 🧪 Testing

```bash
# The design system includes comprehensive tests
npm run test

# Lint check (should pass with new system)
npm run lint

# Build check
npm run build
```

## ♿ Accessibility

### Built-in Support
- **WCAG 2.1 AA Compliance**: Color contrast and interaction patterns
- **Reduced Motion**: Respects `prefers-reduced-motion`
- **High Contrast**: Enhanced visibility for `prefers-contrast: high`
- **Screen Readers**: Proper ARIA attributes and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility

### Cultural Accessibility
- **Script-Appropriate Spacing**: Optimized for Sinhala readability
- **Language Direction**: RTL support framework (extensible)
- **Font Feature Settings**: Proper OpenType features for script rendering

## 🎯 Design Principles

1. **Cultural Sensitivity**: Respectful use of Buddhist-inspired concepts
2. **Universal Access**: Inclusive design for all users regardless of faith
3. **Spiritual Mindfulness**: Peaceful, non-jarring interactions
4. **Trust Building**: Confidence in donation and monastery management
5. **Multilingual Excellence**: Optimized for Sinhala and English

## 📚 Documentation

- **Color Tokens**: `/tokens/colors.ts` - Complete OKLCH color system
- **Typography**: `/tokens/typography.ts` - Multilingual typography scales
- **Animations**: `/tokens/animations.ts` - Meditation-inspired motion
- **Cultural System**: `/cultural/` - Language-specific adaptations
- **Component Variants**: `/components/variants/` - Enhanced CVA variants

## 🔄 Migration from Existing System

The enhanced system is **fully backward compatible** with your existing components:

1. **Existing Components**: Continue to work without changes
2. **Enhanced Components**: Opt-in to new variants and cultural features
3. **Progressive Enhancement**: Gradually adopt new features as needed
4. **CSS Variables**: All existing custom properties are preserved

## 🌟 What's New

### Enhancements Over Existing System
1. **Cultural Variants**: Sinhala-optimized components and layouts
2. **Context Theming**: Donation, monastery, and spiritual contexts
3. **Enhanced Animations**: Meditation-inspired motion design
4. **Trust Colors**: New color tokens for building confidence
5. **Multilingual Typography**: Proper script support and optimization
6. **Theme Provider**: React context for dynamic theming
7. **Component Presets**: Ready-to-use configurations for common patterns

### Preserved from Original
1. **OKLCH Color System**: Your excellent perceptual color model
2. **Dana Gold Primary**: The beautiful Buddhist-inspired gold
3. **Elegant Shadows**: Sophisticated depth and elevation
4. **Responsive Design**: Mobile-first, accessible layouts
5. **CSS Architecture**: Clean, maintainable custom properties

## 🤝 Contributing

When contributing to the design system:

1. **Cultural Sensitivity**: Ensure all additions respect Buddhist traditions
2. **Accessibility**: Test with screen readers and keyboard navigation
3. **Multilingual**: Consider Sinhala typography impacts
4. **Performance**: Maintain optimal loading and rendering
5. **Documentation**: Update examples and usage guides

## 📄 License

This design system extends the existing Dhaana project and follows the same licensing terms.

---

**Built with ❤️ for Buddhist monastery communities**
*Honoring tradition while embracing modern design excellence*