# Maps Integration Guide

## Overview

This guide explains how to set up and optimize the dual-mode location picker that combines OpenStreetMap (free) with Google Maps (precision mode) and Radar (cost-effective geocoding/autocomplete).

## Architecture

### Cost-Optimized Strategy
- **Default**: OpenStreetMap with Leaflet (FREE)
- **Precision Mode**: Google Maps on-demand (when user clicks "Switch to Google Maps")
- **Geocoding**: Radar API (90% cheaper than Google)
- **Autocomplete**: Radar API (94% cheaper than Google)
- **Fallbacks**: OpenStreetMap Nominatim when quotas are reached

### Estimated Cost Savings
- **Traditional Google Maps only**: ~$780/month for 65k requests
- **Our hybrid approach**: ~$50-100/month for 65k requests
- **Savings**: 87% cost reduction

## API Keys Setup

### 1. Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (optional, for enhanced autocomplete)
4. Create credentials → API Key
5. Restrict the API key:
   - **Application restrictions**: HTTP referrers (add your domains)
   - **API restrictions**: Select only the APIs you enabled

**Security Best Practices:**
- Never expose API keys in client-side code
- Use environment variables
- Set up billing alerts
- Implement usage quotas

### 2. Radar API Key

1. Go to [Radar.io](https://radar.com/)
2. Sign up for a free account
3. Go to Settings → API Keys
4. Copy your publishable key (starts with `prj_live_`)

**Radar Benefits:**
- Much cheaper than Google Maps
- Generous free tier
- High-quality geocoding data
- Global coverage

## Environment Configuration

### 1. Create `.env.local` file:

```bash
# Copy from .env.example
cp .env.example .env.local
```

### 2. Add your API keys:

```bash
# Google Maps API Key (for precision mode)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Radar API Key (for cost-effective geocoding)
NEXT_PUBLIC_RADAR_API_KEY=your_radar_api_key_here

# Other required variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Verify Configuration

The system will automatically detect available services:
- If Google Maps key is missing: Only OpenStreetMap mode available
- If Radar key is missing: Falls back to OpenStreetMap Nominatim
- Both missing: Basic OpenStreetMap with Nominatim geocoding

## Usage

### Basic Implementation

```tsx
import { DualModeLocationPicker } from '@/components/interactive-location-picker'

function MyComponent() {
  const handleLocationSelect = (location) => {
    console.log('Selected:', location)
  }

  return (
    <DualModeLocationPicker
      onLocationSelect={handleLocationSelect}
      height="400px"
      searchPlaceholder="Search for a location..."
    />
  )
}
```

### Enhanced Search with Autocomplete

```tsx
import { EnhancedMapSearchBar } from '@/components/interactive-location-picker'

function MySearchComponent() {
  const handleSearch = (query) => {
    // Handle search
  }

  const handleLocationSelect = (location) => {
    // Handle direct location selection from autocomplete
  }

  return (
    <EnhancedMapSearchBar
      onSearch={handleSearch}
      onLocationSelect={handleLocationSelect}
      showRecentSearches={true}
    />
  )
}
```

### Location Settings Integration

```tsx
import { LocationSettings } from '@/components/location-settings'

function UserProfile() {
  return (
    <LocationSettings
      userId={user.id}
      currentLocation={userLocation}
      onLocationUpdate={setUserLocation}
    />
  )
}
```

## Cost Monitoring

### Usage Dashboard

```tsx
import { MapsUsageDashboard } from '@/components/maps-usage-dashboard'

function AdminPanel() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <MapsUsageDashboard />
    </div>
  )
}
```

### Programmatic Usage Tracking

```tsx
import { GoogleMapsUsageTracker } from '@/lib/google-maps-service'

// Get current month usage
const usage = GoogleMapsUsageTracker.getMonthlyUsage()
console.log('Map loads:', usage.mapLoads)
console.log('Geocodes:', usage.geocodes)
console.log('Autocompletes:', usage.autocompletes)

// Get estimated cost
const cost = GoogleMapsUsageTracker.estimateMonthlyCost()
console.log('Estimated monthly cost: $', cost.toFixed(2))
```

## Cost Optimization Features

### 1. Intelligent Caching
- **Geocoding results**: Cached for 30 days in localStorage
- **Autocomplete results**: Cached per session
- **Deduplication**: Prevents duplicate API calls

### 2. Request Optimization
- **Debouncing**: 500ms delay on search inputs
- **Batching**: Multiple requests combined when possible
- **Smart fallbacks**: Automatic switching to cheaper alternatives

### 3. Usage Limits
```tsx
// Set up usage monitoring
const MONTHLY_LIMITS = {
  mapLoads: 28000,    // ~$200 worth
  geocodes: 40000,    // ~$200 worth
  autocompletes: 12000 // ~$200 worth
}

// Check usage before making requests
const usage = GoogleMapsUsageTracker.getMonthlyUsage()
if (usage.mapLoads > MONTHLY_LIMITS.mapLoads) {
  // Switch to OpenStreetMap only
}
```

## Best Practices

### 1. Default to OpenStreetMap
- Use OpenStreetMap for general location display
- Only switch to Google Maps when users need precision
- Most users (80%+) won't need Google Maps precision

### 2. Optimize API Calls
- Cache geocoding results aggressively
- Use debouncing for search inputs
- Implement request deduplication
- Batch multiple requests when possible

### 3. Monitor Usage
- Set up billing alerts in Google Cloud Console
- Use the built-in usage dashboard
- Implement daily/monthly usage limits
- Track cost per user/session

### 4. Graceful Degradation
- Always provide fallbacks
- Handle API failures gracefully
- Show appropriate error messages
- Maintain functionality even without API keys

## Troubleshooting

### Common Issues

1. **"Google Maps failed to load"**
   - Check API key validity
   - Verify domain restrictions
   - Ensure APIs are enabled
   - Check billing account status

2. **"Radar geocoding failed"**
   - Verify API key format (should start with `prj_live_`)
   - Check rate limits
   - Ensure network connectivity

3. **High costs**
   - Review usage dashboard
   - Check for unnecessary API calls
   - Implement caching
   - Consider usage limits

### Debug Mode

Enable debug mode in development:

```bash
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

This will log:
- API calls and responses
- Cache hits/misses
- Usage statistics
- Error details

## Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables
- Implement domain restrictions
- Set up usage quotas
- Monitor for unusual activity

### Rate Limiting
- Implement client-side rate limiting
- Use exponential backoff for retries
- Cache results to reduce API calls
- Monitor usage patterns

## Performance Optimization

### Loading Strategy
- Lazy load Google Maps only when needed
- Preload OpenStreetMap tiles
- Use service workers for caching
- Implement progressive enhancement

### Bundle Size
- Google Maps loads on-demand (not in main bundle)
- Tree-shake unused Leaflet features
- Use dynamic imports for heavy components

## Migration Guide

### From Pure Google Maps

1. Replace `InteractiveLocationPicker` with `DualModeLocationPicker`
2. Add Radar API key to environment
3. Update location service calls to use `LocationService`
4. Test fallback scenarios

### From Pure OpenStreetMap

1. Add Google Maps API key (optional)
2. Replace basic picker with `DualModeLocationPicker`
3. Users can now switch to precision mode when needed

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review console logs in debug mode
3. Check API service status pages
4. Verify environment configuration

## Cost Estimation Calculator

Use this formula to estimate monthly costs:

```
Google Maps Cost = 
  (mapLoads / 1000) * $7 +
  (geocodes / 1000) * $5 +
  (autocompletes / 1000) * $17

Radar Cost = 
  (geocodes / 1000) * $0.50 +
  (autocompletes / 1000) * $1.00

Total Monthly Cost = Google Maps Cost + Radar Cost
```

With our optimization:
- 90% of users stay on OpenStreetMap (free)
- 10% switch to Google Maps for precision
- All geocoding/autocomplete uses Radar (90% cheaper)

**Result**: 87% cost reduction compared to pure Google Maps approach.