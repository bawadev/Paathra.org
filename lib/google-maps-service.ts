// Google Maps service for precision location picking
// Only loaded on-demand to minimize costs

import { Loader } from '@googlemaps/js-api-loader';
import { mapsConfig } from './env';
import { Location } from './location-services';

// Extend Window interface to include google
declare global {
  interface Window {
    google: typeof google;
  }
}

export interface GoogleMapsConfig {
  center: { lat: number; lng: number };
  zoom: number;
  mapTypeId?: google.maps.MapTypeId;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
  streetViewControl?: boolean;
  fullscreenControl?: boolean;
}

export interface GoogleMapsMarker {
  position: { lat: number; lng: number };
  title?: string;
  draggable?: boolean;
}

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loader: Loader | null = null;
  private isLoaded = false;
  private loadPromise: Promise<typeof google> | null = null;

  private constructor() {}

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  async load(): Promise<typeof google> {
    if (this.isLoaded && window.google) {
      return window.google;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    if (!mapsConfig.googleMapsApiKey) {
      throw new Error('Google Maps API key not configured');
    }

    this.loader = new Loader({
      apiKey: mapsConfig.googleMapsApiKey,
      version: 'weekly',
      libraries: ['places', 'geometry'],
      language: 'en',
      region: 'IN', // Optimize for India
    });

    this.loadPromise = this.loader.load().then((google) => {
      this.isLoaded = true;
      console.log('✅ Google Maps loaded successfully');
      return google;
    }).catch((error) => {
      console.error('❌ Failed to load Google Maps:', error);
      this.loadPromise = null;
      throw error;
    });

    return this.loadPromise;
  }

  isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google;
  }
}

export class GoogleMapsService {
  private static loader = GoogleMapsLoader.getInstance();
  private map: google.maps.Map | null = null;
  private marker: google.maps.Marker | null = null;
  private autocompleteService: google.maps.places.AutocompleteService | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private geocoder: google.maps.Geocoder | null = null;

  constructor(private container: HTMLElement) {}

  async initialize(config: GoogleMapsConfig): Promise<void> {
    try {
      const google = await GoogleMapsService.loader.load();
      
      // Initialize map with enhanced POI visibility
      this.map = new google.maps.Map(this.container, {
        center: config.center,
        zoom: config.zoom,
        mapTypeId: config.mapTypeId || google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: config.disableDefaultUI ?? false,
        zoomControl: config.zoomControl ?? true,
        streetViewControl: config.streetViewControl ?? false,
        fullscreenControl: config.fullscreenControl ?? true,
        clickableIcons: true, // Enable clickable POIs
        // Enhanced styling to show more details
        styles: [
          // Show all POI labels
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          // Enhance business visibility
          {
            featureType: 'poi.business',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          // Show transit stations
          {
            featureType: 'transit.station',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          // Show road labels clearly
          {
            featureType: 'road',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          // Enhance administrative area labels
          {
            featureType: 'administrative',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          // Show business and POI labels (establishment is deprecated)
          {
            featureType: 'poi.business',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });

      // Initialize services
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.placesService = new google.maps.places.PlacesService(this.map);
      this.geocoder = new google.maps.Geocoder();

      // Add zoom change listener to show more details at higher zoom levels
      this.map.addListener('zoom_changed', () => {
        this.adjustDetailLevel();
      });

      console.log('✅ Google Maps initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Maps:', error);
      throw error;
    }
  }

  addMarker(config: GoogleMapsMarker): google.maps.Marker | null {
    if (!this.map) return null;

    // Remove existing marker
    if (this.marker) {
      this.marker.setMap(null);
    }

    const google = window.google;
    this.marker = new google.maps.Marker({
      position: config.position,
      map: this.map,
      title: config.title || null,
      draggable: config.draggable ?? true,
      animation: google.maps.Animation.DROP,
    });

    return this.marker;
  }

  onMapClick(callback: (location: Location) => void): void {
    if (!this.map) return;

    this.map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Add marker at clicked location
        this.addMarker({
          position: { lat, lng },
          title: 'Selected Location',
          draggable: true,
        });

        // Set up marker drag listener
        if (this.marker) {
          this.marker.addListener('dragend', (dragEvent: google.maps.MapMouseEvent) => {
            if (dragEvent.latLng) {
              callback({
                latitude: dragEvent.latLng.lat(),
                longitude: dragEvent.latLng.lng(),
              });
            }
          });
        }

        callback({
          latitude: lat,
          longitude: lng,
        });
      }
    });
  }

  async geocode(address: string): Promise<Location | null> {
    if (!this.geocoder) return null;

    return new Promise((resolve) => {
      this.geocoder!.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            latitude: location.lat(),
            longitude: location.lng(),
            address: results[0].formatted_address,
          });
        } else {
          console.warn('Google Maps geocoding failed:', status);
          resolve(null);
        }
      });
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    if (!this.geocoder) return null;

    return new Promise((resolve) => {
      this.geocoder!.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            console.warn('Google Maps reverse geocoding failed:', status);
            resolve(null);
          }
        }
      );
    });
  }

  async autocomplete(query: string): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!this.autocompleteService || query.length < 3) return [];

    return new Promise((resolve) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input: query,
          componentRestrictions: { country: 'in' }, // Optimize for India
          types: ['geocode'], // Remove deprecated 'establishment' type
        },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            resolve(predictions);
          } else {
            console.warn('Google Maps autocomplete failed:', status);
            resolve([]);
          }
        }
      );
    });
  }

  panTo(location: { lat: number; lng: number }): void {
    if (this.map) {
      this.map.panTo(location);
    }
  }

  setZoom(zoom: number): void {
    if (this.map) {
      this.map.setZoom(zoom);
    }
  }

  fitBounds(bounds: { north: number; south: number; east: number; west: number }): void {
    if (this.map) {
      const google = window.google;
      const googleBounds = new google.maps.LatLngBounds(
        { lat: bounds.south, lng: bounds.west },
        { lat: bounds.north, lng: bounds.east }
      );
      this.map.fitBounds(googleBounds);
    }
  }

  destroy(): void {
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
    
    if (this.map) {
      // Clear all listeners
      google.maps.event.clearInstanceListeners(this.map);
      this.map = null;
    }

    this.autocompleteService = null;
    this.placesService = null;
    this.geocoder = null;
  }

  getMap(): google.maps.Map | null {
    return this.map;
  }

  // Adjust detail level based on zoom
  private adjustDetailLevel(): void {
    if (!this.map) return;

    const zoom = this.map.getZoom();
    if (!zoom) return;

    // Show more details at higher zoom levels
    if (zoom >= 16) {
      // Very detailed view - show all POIs and businesses
      this.map.setOptions({
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'poi.business',
            elementType: 'labels.text',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'road',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'transit',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });
    } else if (zoom >= 13) {
      // Medium detail - show important POIs
      this.map.setOptions({
        styles: [
          {
            featureType: 'poi.business',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'poi.government',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      });
    }
  }

  // Search for nearby places to show more context
  searchNearbyPlaces(location: { lat: number; lng: number }, radius: number = 1000): Promise<google.maps.places.PlaceResult[]> {
    return new Promise((resolve) => {
      if (!this.placesService || !this.map) {
        resolve([]);
        return;
      }

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: radius,
        // Remove deprecated 'establishment' type
      };

      this.placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          console.warn('Places search failed:', status);
          resolve([]);
        }
      });
    });
  }

  // Add place markers to show more details
  async addNearbyPlaceMarkers(location: { lat: number; lng: number }): Promise<void> {
    if (!this.map) return;

    try {
      const places = await this.searchNearbyPlaces(location);
      
      places.slice(0, 10).forEach((place) => {
        if (place.geometry?.location) {
          const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: this.map,
            title: place.name || null,
            icon: {
              url: place.icon || '',
              scaledSize: new google.maps.Size(20, 20)
            }
          });

          // Add info window with place details
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="max-width: 200px;">
                <h4 style="margin: 0 0 5px 0;">${place.name}</h4>
                <p style="margin: 0; font-size: 12px; color: #666;">
                  ${place.vicinity || ''}
                </p>
                ${place.rating ? `<p style="margin: 5px 0 0 0; font-size: 12px;">⭐ ${place.rating}</p>` : ''}
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(this.map, marker);
          });
        }
      });
    } catch (error) {
      console.warn('Failed to add nearby place markers:', error);
    }
  }

  static async isAvailable(): Promise<boolean> {
    try {
      if (!mapsConfig.googleMapsApiKey) return false;
      await GoogleMapsService.loader.load();
      return true;
    } catch {
      return false;
    }
  }

  static isLoaded(): boolean {
    return GoogleMapsService.loader.isGoogleMapsLoaded();
  }
}

// Usage tracking for cost monitoring
export class GoogleMapsUsageTracker {
  private static readonly STORAGE_KEY = 'dhaana_gmaps_usage';

  static trackMapLoad(): void {
    this.incrementCounter('mapLoads');
  }

  static trackGeocode(): void {
    this.incrementCounter('geocodes');
  }

  static trackAutocomplete(): void {
    this.incrementCounter('autocompletes');
  }

  private static incrementCounter(type: string): void {
    try {
      const usage = this.getUsage();
      const today = new Date().toISOString().split('T')[0];
      
      if (!usage[today]) {
        usage[today] = {};
      }
      
      usage[today][type] = (usage[today][type] || 0) + 1;
      
      // Keep only last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      Object.keys(usage).forEach(date => {
        if (new Date(date) < thirtyDaysAgo) {
          delete usage[date];
        }
      });
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usage));
    } catch {
      // Ignore storage errors
    }
  }

  static getUsage(): Record<string, Record<string, number>> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  static getMonthlyUsage(): { mapLoads: number; geocodes: number; autocompletes: number } {
    const usage = this.getUsage();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let mapLoads = 0;
    let geocodes = 0;
    let autocompletes = 0;
    
    Object.entries(usage).forEach(([date, counts]) => {
      if (new Date(date) >= thirtyDaysAgo) {
        mapLoads += counts.mapLoads || 0;
        geocodes += counts.geocodes || 0;
        autocompletes += counts.autocompletes || 0;
      }
    });
    
    return { mapLoads, geocodes, autocompletes };
  }

  static estimateMonthlyCost(): number {
    const usage = this.getMonthlyUsage();
    
    // Google Maps pricing (approximate)
    const mapLoadCost = (usage.mapLoads / 1000) * 7; // $7 per 1K loads
    const geocodeCost = (usage.geocodes / 1000) * 5; // $5 per 1K geocodes
    const autocompleteCost = (usage.autocompletes / 1000) * 17; // $17 per 1K autocompletes
    
    return mapLoadCost + geocodeCost + autocompleteCost;
  }
}