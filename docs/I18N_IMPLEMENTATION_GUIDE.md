# Next-intl Implementation Guide for Dhaana

## Overview

This document outlines the complete implementation of next-intl in the Dhaana project with a hybrid rendering approach that combines static generation, server-side rendering, and client-side rendering for optimal performance and SEO.

## Architecture

### Hybrid Rendering Strategy

Our implementation uses a three-tier rendering approach:

1. **Static Generation (SSG)** - For pages that don't change often
2. **Server-Side Rendering (SSR)** - For dynamic content that needs fresh data
3. **Client-Side Rendering (CSR)** - For highly interactive components

### File Structure

```
├── app/
│   ├── layout.tsx                 # Root layout (minimal)
│   ├── globals.css               # Global styles
│   └── [locale]/                 # Locale-specific routes
│       ├── layout.tsx            # Locale layout with i18n providers
│       ├── page.tsx              # Home page
│       ├── monasteries/          # All existing routes moved here
│       ├── admin/
│       └── ...
├── src/
│   ├── i18n/
│   │   ├── routing.ts            # Route configuration
│   │   ├── navigation.ts         # Navigation wrappers
│   │   └── request.ts            # Server-side i18n config
│   └── middleware.ts             # Locale detection & routing
├── messages/
│   ├── en.json                   # English translations
│   └── si.json                   # Sinhala translations
└── components/
    └── language-switcher.tsx     # Language switching component
```

## Key Features Implemented

### 1. URL-Based Routing
- **English**: `/en/monasteries`, `/en/donate`
- **Sinhala**: `/si/pansala`, `/si/daanaya`
- Automatic locale detection and redirection
- SEO-friendly localized URLs

### 2. Hybrid Rendering Configuration

#### Static Generation
- Home page (`/[locale]/`)
- Monastery listings (`/[locale]/monasteries`)
- Marketing pages

#### Server-Side Rendering
- User dashboards
- Admin panels
- Real-time data pages

#### Client-Side Rendering
- Interactive maps
- Forms with validation
- Real-time updates

### 3. Translation System

#### Message Structure
```json
{
  "Navigation": {
    "brand": "Dana",
    "donations": "Donations",
    "monasteries": "Monasteries"
  },
  "HomePage": {
    "heroTitle1": "Nourish",
    "heroTitle2": "Compassion"
  }
}
```

#### Usage in Components
```tsx
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('Navigation');
  return <span>{t('brand')}</span>;
}
```

### 4. Localized Routing

#### Route Configuration
```typescript
export const routing = defineRouting({
  locales: ['en', 'si'],
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    '/monasteries': {
      en: '/monasteries',
      si: '/pansala'
    }
  }
});
```

#### Navigation Usage
```tsx
import { Link } from '@/src/i18n/navigation';

<Link href="/monasteries">Monasteries</Link>
// Automatically becomes /en/monasteries or /si/pansala
```

## Performance Optimizations

### 1. Static Generation with `generateStaticParams`
```tsx
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}
```

### 2. Metadata Localization
```tsx
export async function generateMetadata({ params }) {
  const {locale} = await params;
  return {
    title: locale === 'si' ? "ධාන - ආහාර දාන වේදිකාව" : "Dhaana - Food Donation Platform"
  };
}
```

### 3. Font Optimization
- Preloaded fonts for both English and Sinhala
- Proper Unicode support for Sinhala characters

## Language Support

### English (en)
- Primary language
- Complete translation coverage
- SEO-optimized URLs

### Sinhala (si)
- Native Sri Lankan language
- Cultural adaptations
- Localized URLs (e.g., `/pansala` for monasteries)

## Component Internationalization

### Navigation Component
- Fully translated menu items
- Localized route handling
- Language switcher integration

### Language Switcher
- Dropdown/Select interface
- Maintains current page context
- Smooth language transitions

### Forms and Validation
- Translated error messages
- Localized input labels
- Cultural date/number formats

## SEO Benefits

### 1. Localized URLs
- `/en/monasteries` vs `/si/pansala`
- Better search engine indexing
- Improved user experience

### 2. Proper HTML Lang Attributes
```html
<html lang="en"> <!-- or lang="si" -->
```

### 3. Localized Metadata
- Translated titles and descriptions
- Language-specific Open Graph tags

## Development Workflow

### Adding New Translations
1. Add keys to `messages/en.json` and `messages/si.json`
2. Use `useTranslations()` hook in components
3. Test both language versions

### Adding New Routes
1. Add route to `src/i18n/routing.ts`
2. Create page in `app/[locale]/new-route/`
3. Update navigation if needed

### Testing Internationalization
```bash
# Test English version
curl http://localhost:3000/en/

# Test Sinhala version
curl http://localhost:3000/si/

# Test automatic redirection
curl -I http://localhost:3000/
```

## Deployment Considerations

### Server Requirements
- Node.js runtime (not static hosting)
- Middleware support for locale detection
- Server-side rendering capabilities

### Recommended Platforms
1. **Vercel** (Recommended)
   - Native Next.js support
   - Automatic edge deployment
   - Built-in middleware support

2. **Netlify with Functions**
   - Good alternative
   - Edge function support

3. **Railway/Render**
   - Cost-effective options
   - Full Node.js support

### Environment Variables
```env
# Add any locale-specific configurations
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,si
```

## Best Practices

### 1. Translation Keys
- Use nested objects for organization
- Keep keys descriptive but concise
- Maintain consistency across languages

### 2. Component Design
- Separate presentation from translation logic
- Use translation hooks at component level
- Avoid hardcoded text strings

### 3. Performance
- Leverage static generation where possible
- Use ISR for semi-dynamic content
- Optimize bundle sizes per locale

### 4. User Experience
- Provide clear language switching
- Maintain context during language changes
- Handle RTL languages if needed (future)

## Troubleshooting

### Common Issues

1. **404 Errors on Routes**
   - Ensure all routes are defined in `routing.ts`
   - Check middleware configuration

2. **Translation Not Loading**
   - Verify message files exist
   - Check import paths in `request.ts`

3. **Static Generation Issues**
   - Add `generateStaticParams` to pages
   - Use `setRequestLocale` for server components

### Debug Commands
```bash
# Check route generation
npm run build

# Test middleware
curl -I http://localhost:3000/

# Verify translations
curl -s http://localhost:3000/en/ | grep -o '<title>[^<]*</title>'
```

## Future Enhancements

### Planned Features
1. **Additional Languages**
   - Tamil support
   - Pali for traditional Buddhist terms

2. **Advanced Localization**
   - Number formatting
   - Date/time localization
   - Currency formatting

3. **Content Management**
   - Dynamic translation loading
   - Translation management interface
   - Crowdsourced translations

### Performance Improvements
1. **Bundle Optimization**
   - Locale-specific bundles
   - Tree shaking for unused translations

2. **Caching Strategy**
   - Translation caching
   - Route-level caching
   - CDN optimization

## Conclusion

The next-intl implementation in Dhaana provides a robust, scalable internationalization solution with:

- ✅ Hybrid rendering for optimal performance
- ✅ SEO-friendly localized URLs
- ✅ Comprehensive translation system
- ✅ Cultural adaptations for Sri Lankan market
- ✅ Developer-friendly workflow
- ✅ Production-ready deployment strategy

This implementation serves as a foundation for expanding to additional languages and markets while maintaining excellent performance and user experience.