# Sinhala Font Support Guide

This guide explains how Sinhala font support has been implemented in the Dhaana application.

## Overview

The application now supports proper Sinhala text rendering with high-quality web fonts. This replaces the previous limitation where Sinhala text would render poorly or not at all.

## Fonts Added

### Primary Sinhala Fonts
- **Noto Sans Sinhala** - Clean, modern sans-serif for UI and body text
- **Abhaya Libre** - Elegant serif font for headings and important text

### System Font Fallbacks
- Sinhala MN (macOS/iOS)
- Sinhala Sangam MN (macOS/iOS)
- Iskoola Pota (Windows)
- FMMalithi (Windows)
- Lankapura (Linux)
- Kaputa Unicode (Cross-platform)

## Implementation Details

### 1. Font Loading
Fonts are loaded via Next.js font optimization:
- Uses Google Fonts CDN for optimal performance
- Preloads fonts to prevent FOIT (Flash of Invisible Text)
- Provides fallbacks for system fonts

### 2. CSS Configuration
Located in `app/globals.css`:
- Automatic font switching based on HTML lang attribute
- Optimized line-height and spacing for Sinhala text
- Proper character rendering and kerning

### 3. Usage Examples

#### Automatic Font Switching
```tsx
// The font automatically switches based on locale
// No additional code needed when using next-intl

// English (en): Uses Geist fonts
// Sinhala (si): Uses Noto Sans Sinhala + Abhaya Libre
```

#### Manual Font Classes
```tsx
// For specific Sinhala text elements
<div className="sinhala-text">සිංහල තෙක්ස්ට්</div>
<h1 className="sinhala-serif">ශීර්ෂය</h1>
```

#### Utility Functions
```tsx
import { useIsSinhala, getFontClass } from '@/components/sinhala-font-provider'

const isSinhala = useIsSinhala()
const fontClass = getFontClass(locale, 'serif')
```

## Browser Support

- **Chrome**: Full support with web fonts
- **Firefox**: Full support with web fonts  
- **Safari**: Full support with web fonts + system fallbacks
- **Edge**: Full support with web fonts
- **Mobile browsers**: Full support with web fonts

## Performance

- Fonts are loaded asynchronously to prevent blocking
- Uses `font-display: swap` for optimal loading
- System fonts serve as immediate fallbacks
- Total font payload: ~200KB for complete Sinhala support

## Testing

To test Sinhala rendering:

1. Set your browser locale to Sinhala (si)
2. Navigate to any page in the application
3. Sinhala text should render properly with correct typography

### Test Text
```
ධාන - ආහාර දාන වේදිකාව
සිංහල භාෂාව නිවැරදිව පෙන්වීම
ආහාර දානය සඳහා දායකයින් පන්සල් සමඟ සම්බන්ධ කරන්න
```

## Troubleshooting

### Common Issues

1. **Square boxes instead of Sinhala characters**
   - Ensure fonts are loading correctly
   - Check browser console for font loading errors
   - Verify internet connectivity for Google Fonts

2. **Broken character rendering**
   - Clear browser cache
   - Try different browser
   - Check if system has Sinhala language support

3. **Text too small/large**
   - Adjust browser zoom settings
   - Sinhala text has increased line-height for readability

### Debug Mode

Enable debug logging to check font loading:
```bash
npm run dev
# Check browser console for font loading messages
```

## Migration from Sinha Sarasavi

The implementation uses **Noto Sans Sinhala** and **Abhaya Libre** as web-ready alternatives to the proprietary "sinha sarasavi" font. These fonts:

- Are open-source and freely available
- Render Sinhala text correctly
- Support all Sinhala Unicode characters
- Are optimized for web use
- Provide better performance than system fonts

## Configuration Files

- `app/[locale]/layout.tsx`: Font loading configuration
- `app/globals.css`: Font styling and fallbacks
- `components/sinhala-font-provider.tsx`: Utility components