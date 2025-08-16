// Enhanced location services with caching and multiple providers
// Optimized for cost-effectiveness with Google Maps + Radar + OpenStreetMap

import { mapsConfig } from './env'

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface GeocodeResult {
  location: Location;
  source: 'radar' | 'google' | 'nominatim' | 'cache';
  confidence?: number;
}

export interface AutocompleteResult {
  address: string;
  location?: Location;
  placeId?: string;
  source: 'radar' | 'google' | 'nominatim';
}

// Cache configuration
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
const CACHE_PREFIX = 'dhaana_location_';

// Cache utilities
class LocationCache {
  private static getKey(type: string, query: string): string {
    return `${CACHE_PREFIX}${type}_${btoa(query).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  static get<T>(type: string, query: string): T | null {
    try {
      const key = this.getKey(type, query);
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  static set<T>(type: string, query: string, data: T): void {
    try {
      const key = this.getKey(type, query);
      const cached = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cached));
    } catch {
      // Ignore cache errors
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX));
      keys.forEach(key => localStorage.removeItem(key));
    } catch {
      // Ignore errors
    }
  }
}

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => resolve(func(...args)), wait);
    });
  };
}

// Radar API integration
class RadarService {
  private static async request(endpoint: string, params: Record<string, string>) {
    if (!mapsConfig.radarApiKey) {
      throw new Error('Radar API key not configured');
    }

    const url = new URL(`https://api.radar.io/v1/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `prj_live_${mapsConfig.radarApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Radar API error: ${response.status}`);
    }

    return response.json();
  }

  static async geocode(address: string): Promise<GeocodeResult | null> {
    try {
      const data = await this.request('geocode/forward', { query: address });
      
      if (data.addresses && data.addresses.length > 0) {
        const result = data.addresses[0];
        return {
          location: {
            latitude: result.latitude,
            longitude: result.longitude,
            address: result.formattedAddress,
          },
          source: 'radar',
          confidence: result.confidence,
        };
      }
      return null;
    } catch (error) {
      console.warn('Radar geocoding failed:', error);
      return null;
    }
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const data = await this.request('geocode/reverse', {
        coordinates: `${lat},${lng}`,
      });

      if (data.addresses && data.addresses.length > 0) {
        return data.addresses[0].formattedAddress;
      }
      return null;
    } catch (error) {
      console.warn('Radar reverse geocoding failed:', error);
      return null;
    }
  }

  static async autocomplete(query: string): Promise<AutocompleteResult[]> {
    try {
      const data = await this.request('search/autocomplete', { query });
      
      return data.addresses?.map((result: any) => ({
        address: result.formattedAddress,
        location: {
          latitude: result.latitude,
          longitude: result.longitude,
          address: result.formattedAddress,
        },
        source: 'radar' as const,
      })) || [];
    } catch (error) {
      console.warn('Radar autocomplete failed:', error);
      return [];
    }
  }
}

// OpenStreetMap Nominatim fallback
class NominatimService {
  private static async request(endpoint: string, params: Record<string, string>) {
    const url = new URL(`https://nominatim.openstreetmap.org/${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Dhaana-App/1.0 (monastery-donation-platform)',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    return response.json();
  }

  static async geocode(address: string): Promise<GeocodeResult | null> {
    try {
      const data = await this.request('search', {
        format: 'json',
        q: address,
        limit: '1',
      });

      if (data.length > 0) {
        const result = data[0];
        return {
          location: {
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            address: result.display_name,
          },
          source: 'nominatim',
        };
      }
      return null;
    } catch (error) {
      console.warn('Nominatim geocoding failed:', error);
      return null;
    }
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const data = await this.request('reverse', {
        format: 'json',
        lat: lat.toString(),
        lon: lng.toString(),
        zoom: '16',
        addressdetails: '1',
      });

      return data.display_name || null;
    } catch (error) {
      console.warn('Nominatim reverse geocoding failed:', error);
      return null;
    }
  }
}

// Main location service with intelligent fallbacks
export class LocationService {
  // Debounced geocoding to reduce API calls
  private static debouncedGeocode = debounce(this.performGeocode.bind(this), 500);

  static async geocode(address: string): Promise<GeocodeResult | null> {
    // Check cache first
    const cached = LocationCache.get<GeocodeResult>('geocode', address);
    if (cached) {
      return { ...cached, source: 'cache' };
    }

    return this.debouncedGeocode(address);
  }

  private static async performGeocode(address: string): Promise<GeocodeResult | null> {
    // Try Radar first (most cost-effective)
    if (mapsConfig.enableRadar) {
      const radarResult = await RadarService.geocode(address);
      if (radarResult) {
        LocationCache.set('geocode', address, radarResult);
        return radarResult;
      }
    }

    // Fallback to Nominatim (free)
    const nominatimResult = await NominatimService.geocode(address);
    if (nominatimResult) {
      LocationCache.set('geocode', address, nominatimResult);
      return nominatimResult;
    }

    return null;
  }

  static async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    
    // Check cache first
    const cached = LocationCache.get<string>('reverse', key);
    if (cached) return cached;

    let result: string | null = null;

    // Try Radar first
    if (mapsConfig.enableRadar) {
      result = await RadarService.reverseGeocode(lat, lng);
    }

    // Fallback to Nominatim
    if (!result) {
      result = await NominatimService.reverseGeocode(lat, lng);
    }

    if (result) {
      LocationCache.set('reverse', key, result);
    }

    return result;
  }

  static async autocomplete(query: string): Promise<AutocompleteResult[]> {
    if (query.length < 3) return [];

    // Check cache first
    const cached = LocationCache.get<AutocompleteResult[]>('autocomplete', query);
    if (cached) return cached;

    let results: AutocompleteResult[] = [];

    // Try Radar first
    if (mapsConfig.enableRadar) {
      results = await RadarService.autocomplete(query);
    }

    // Cache results
    if (results.length > 0) {
      LocationCache.set('autocomplete', query, results);
    }

    return results;
  }

  // Debounced autocomplete to reduce API calls
  static debouncedAutocomplete = debounce(this.autocomplete.bind(this), 300);

  static clearCache(): void {
    LocationCache.clear();
  }
}

// Browser geolocation with enhanced options
export async function getUserLocation(): Promise<Location | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.warn('Error getting location:', error.message);
        resolve(null);
      },
      { 
        timeout: 10000, 
        enableHighAccuracy: false, // Use less accurate but faster location
        maximumAge: 300000 // 5 minutes cache
      }
    );
  });
}

// Utility functions
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}

export function isValidLatitude(lat: number): boolean {
  return lat >= -90 && lat <= 90;
}

export function isValidLongitude(lon: number): boolean {
  return lon >= -180 && lon <= 180;
}