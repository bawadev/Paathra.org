'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Info, Zap, Map, Loader2, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LocationService, getUserLocation } from '@/lib/location-services'
import { GoogleMapsService, GoogleMapsUsageTracker } from '@/lib/google-maps-service'
import { mapsConfig } from '@/lib/env'
import { MapSearchBar } from './MapSearchBar'
import { InteractiveLocationPickerProps, Location } from './types'

type MapMode = 'openstreetmap' | 'google';

export function DualModeLocationPicker({
  initialLocation,
  onLocationSelect,
  height = '400px',
  searchPlaceholder,
  showSearchBar = true,
  className = ''
}: InteractiveLocationPickerProps) {
  // State management
  const [mapMode, setMapMode] = useState<MapMode>('openstreetmap')
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null)
  const [isSearching, setIsSearching] = useState(false)
  
  // Responsive height
  const [mapHeight, setMapHeight] = useState(height)
  
  // Refs
  const osmMapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<HTMLDivElement>(null)
  const osmMapInstanceRef = useRef<any>(null)
  const osmMarkerRef = useRef<any>(null)
  const googleMapServiceRef = useRef<GoogleMapsService | null>(null)

  // Responsive height effect
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setMapHeight('300px')
      } else if (window.innerWidth < 768) {
        setMapHeight('350px')
      } else {
        setMapHeight(height)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [height])

  // Initialize OpenStreetMap
  useEffect(() => {
    if (!osmMapRef.current || mapMode !== 'openstreetmap') return

    let isMounted = true

    const initializeOSM = async () => {
      try {
        const L = await import('leaflet')
        
        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        if (!isMounted) return

        // Default center or initial location
        let center: [number, number] = initialLocation 
          ? [initialLocation.latitude, initialLocation.longitude]
          : [20.5937, 78.9629] // India center
        let zoom = initialLocation ? 12 : 5

        // Clean up existing map
        if (osmMapInstanceRef.current) {
          osmMapInstanceRef.current.remove()
        }

        // Create map
        const map = L.map(osmMapRef.current!).setView(center, zoom)
        osmMapInstanceRef.current = map

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        // Custom selected icon
        const selectedIcon = L.divIcon({
          html: `
            <div style="position: relative;">
              <div style="
                position: absolute;
                left: -12px;
                top: -41px;
                width: 25px;
                height: 41px;
                background-image: url('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png');
                background-size: contain;
                filter: hue-rotate(120deg);
              "></div>
              <div style="
                position: absolute;
                left: -12px;
                top: -3px;
                width: 25px;
                height: 16px;
                background-image: url('https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png');
                background-size: contain;
              "></div>
            </div>
          `,
          className: 'custom-selected-marker',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })

        // Add initial marker if location exists
        if (initialLocation) {
          osmMarkerRef.current = L.marker(
            [initialLocation.latitude, initialLocation.longitude],
            { 
              icon: selectedIcon,
              draggable: true 
            }
          ).addTo(map)

          osmMarkerRef.current.on('dragend', async (e: any) => {
            const latlng = e.target.getLatLng()
            await updateSelectedLocation(latlng.lat, latlng.lng)
          })
        }

        // Handle map click
        map.on('click', async (e: any) => {
          const { lat, lng } = e.latlng

          if (osmMarkerRef.current) {
            osmMarkerRef.current.remove()
          }

          osmMarkerRef.current = L.marker([lat, lng], { 
            icon: selectedIcon,
            draggable: true 
          }).addTo(map)

          osmMarkerRef.current.on('dragend', async (e: any) => {
            const latlng = e.target.getLatLng()
            await updateSelectedLocation(latlng.lat, latlng.lng)
          })

          await updateSelectedLocation(lat, lng)
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing OpenStreetMap:', error)
        setLoadError('Failed to load map')
        setIsLoading(false)
      }
    }

    initializeOSM()

    return () => {
      isMounted = false
      if (osmMapInstanceRef.current) {
        osmMapInstanceRef.current.remove()
        osmMapInstanceRef.current = null
      }
    }
  }, [mapMode, initialLocation])

  // Initialize Google Maps
  useEffect(() => {
    if (!googleMapRef.current || mapMode !== 'google') return

    let isMounted = true

    const initializeGoogleMaps = async () => {
      try {
        setIsTransitioning(true)
        
        if (!mapsConfig.enableGoogleMaps) {
          throw new Error('Google Maps API key not configured')
        }

        // Track usage
        GoogleMapsUsageTracker.trackMapLoad()

        const googleService = new GoogleMapsService(googleMapRef.current!)
        
        const center = selectedLocation 
          ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
          : { lat: 20.5937, lng: 78.9629 }

        await googleService.initialize({
          center,
          zoom: selectedLocation ? 12 : 5,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        })

        if (!isMounted) return

        googleMapServiceRef.current = googleService

        // Add initial marker if location exists
        if (selectedLocation) {
          googleService.addMarker({
            position: { lat: selectedLocation.latitude, lng: selectedLocation.longitude },
            title: 'Selected Location',
            draggable: true,
          })
          
          // Add nearby places for initial location
          await googleService.addNearbyPlaceMarkers({
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude
          })
        }

        // Handle map clicks
        googleService.onMapClick(async (location) => {
          await updateSelectedLocation(location.latitude, location.longitude)
          
          // Add nearby places for clicked location
          await googleService.addNearbyPlaceMarkers({
            lat: location.latitude,
            lng: location.longitude
          })
        })

        setIsTransitioning(false)
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing Google Maps:', error)
        setLoadError('Failed to load Google Maps. Switching back to OpenStreetMap.')
        setMapMode('openstreetmap')
        setIsTransitioning(false)
      }
    }

    initializeGoogleMaps()

    return () => {
      isMounted = false
      if (googleMapServiceRef.current) {
        googleMapServiceRef.current.destroy()
        googleMapServiceRef.current = null
      }
    }
  }, [mapMode, selectedLocation])

  const updateSelectedLocation = async (lat: number, lng: number) => {
    try {
      // Use appropriate reverse geocoding service
      let address: string | null = null
      
      if (mapMode === 'google' && googleMapServiceRef.current) {
        GoogleMapsUsageTracker.trackGeocode()
        address = await googleMapServiceRef.current.reverseGeocode(lat, lng)
      } else {
        address = await LocationService.reverseGeocode(lat, lng)
      }
      
      const newLocation: Location = {
        latitude: lat,
        longitude: lng,
        address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }
      
      setSelectedLocation(newLocation)
      onLocationSelect(newLocation)
    } catch (error) {
      console.error('Error updating location:', error)
    }
  }

  const handleSearch = async (query: string) => {
    setIsSearching(true)
    try {
      if (mapMode === 'google' && googleMapServiceRef.current) {
        // Use Google Maps geocoding
        GoogleMapsUsageTracker.trackGeocode()
        const result = await googleMapServiceRef.current.geocode(query)
        
        if (result) {
          googleMapServiceRef.current.panTo({ lat: result.latitude, lng: result.longitude })
          googleMapServiceRef.current.setZoom(12)
          
          // Add nearby places for searched location
          await googleMapServiceRef.current.addNearbyPlaceMarkers({
            lat: result.latitude,
            lng: result.longitude
          })
        } else {
          setLoadError('Location not found. Try a different search term.')
          setTimeout(() => setLoadError(null), 3000)
        }
      } else {
        // Use Radar/Nominatim for OpenStreetMap
        const result = await LocationService.geocode(query)
        
        if (result && osmMapInstanceRef.current) {
          osmMapInstanceRef.current.setView([result.location.latitude, result.location.longitude], 12)
        } else {
          setLoadError('Location not found. Try a different search term.')
          setTimeout(() => setLoadError(null), 3000)
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      setLoadError('Error searching for location. Please try again.')
      setTimeout(() => setLoadError(null), 3000)
    } finally {
      setIsSearching(false)
    }
  }

  const switchToGoogleMaps = async () => {
    if (!mapsConfig.enableGoogleMaps) {
      setLoadError('Google Maps API key not configured. Please add your API key to use precision mode.')
      return
    }

    setIsLoading(true)
    setMapMode('google')
  }

  const switchToOpenStreetMap = () => {
    setIsLoading(true)
    setMapMode('openstreetmap')
  }

  if (loadError && !osmMapInstanceRef.current && !googleMapServiceRef.current) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ height: mapHeight }}
      >
        <div className="text-center">
          <div className="text-gray-500 mb-2">🗺️</div>
          <p className="text-sm text-gray-600">{loadError}</p>
          <p className="text-xs text-gray-500 mt-1">Please check your internet connection</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Instructions */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Search to focus the map on a location, then click on the map to select your precise position.
          You can drag the marker to fine-tune the location.
          {mapMode === 'openstreetmap' && (
            <span className="block mt-1 text-xs">
              💡 Switch to Google Maps for more accurate location picking and up-to-date imagery.
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Map Mode Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant={mapMode === 'openstreetmap' ? 'default' : 'secondary'}>
            {mapMode === 'openstreetmap' ? 'OpenStreetMap' : 'Google Maps'}
          </Badge>
          {mapMode === 'openstreetmap' && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Free
            </Badge>
          )}
          {mapMode === 'google' && (
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              Precision Mode
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-2">
          {mapMode === 'openstreetmap' && mapsConfig.enableGoogleMaps && (
            <Button
              onClick={switchToGoogleMaps}
              variant="outline"
              size="sm"
              disabled={isLoading || isTransitioning}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Switch to Google Maps
            </Button>
          )}
          
          {mapMode === 'google' && (
            <Button
              onClick={switchToOpenStreetMap}
              variant="outline"
              size="sm"
              disabled={isLoading || isTransitioning}
            >
              <Map className="w-4 h-4 mr-2" />
              Switch to OpenStreetMap
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {showSearchBar && (
        <MapSearchBar
          onSearch={handleSearch}
          placeholder={searchPlaceholder || "Search for a country, city, or address..."}
          disabled={isSearching || isLoading}
        />
      )}

      {/* Error Message */}
      {loadError && (osmMapInstanceRef.current || googleMapServiceRef.current) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {/* Map Container */}
      <div className="relative rounded-lg border overflow-hidden" style={{ height: mapHeight }}>
        {/* Loading Overlay */}
        {(isLoading || isTransitioning) && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">
                {isTransitioning ? `Switching to ${mapMode === 'google' ? 'Google Maps' : 'OpenStreetMap'}...` : 'Loading map...'}
              </p>
            </div>
          </div>
        )}

        {/* OpenStreetMap Container */}
        <div 
          ref={osmMapRef} 
          className={`w-full h-full ${mapMode === 'openstreetmap' ? 'block' : 'hidden'}`}
        />

        {/* Google Maps Container */}
        <div 
          ref={googleMapRef} 
          className={`w-full h-full ${mapMode === 'google' ? 'block' : 'hidden'}`}
        />
        
        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="absolute bottom-2 left-2 right-2 bg-white bg-opacity-95 p-2 sm:p-3 rounded shadow-lg text-xs sm:text-sm z-[1000] max-w-full">
            <div className="flex items-start space-x-2">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">Selected Location:</p>
                <p className="text-gray-600 text-[10px] sm:text-xs break-words">{selectedLocation.address}</p>
                <p className="text-gray-500 text-[10px] sm:text-xs mt-1">
                  {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Usage Info for Google Maps */}
      {mapMode === 'google' && (
        <div className="text-xs text-gray-500 px-1">
          <p>🔍 Using Google Maps for enhanced accuracy and up-to-date imagery</p>
        </div>
      )}
    </div>
  )
}