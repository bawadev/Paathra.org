'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Info } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { reverseGeocode } from '@/lib/location-utils'
import { MapSearchBar } from './MapSearchBar'
import { InteractiveLocationPickerProps, Location } from './types'

export function InteractiveLocationPicker({
  initialLocation,
  onLocationSelect,
  height = '400px',
  searchPlaceholder,
  showSearchBar = true,
  className = ''
}: InteractiveLocationPickerProps) {
  // Responsive height for mobile devices
  const [mapHeight, setMapHeight] = useState(height)
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) { // sm breakpoint
        setMapHeight('300px')
      } else if (window.innerWidth < 768) { // md breakpoint
        setMapHeight('350px')
      } else {
        setMapHeight(height)
      }
    }
    
    handleResize() // Initial check
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [height])
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialLocation || null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!mapRef.current) return

    let isMounted = true

    const initializeMap = async () => {
      try {
        // Dynamically import Leaflet to avoid SSR issues
        const L = await import('leaflet')
        
        // Fix for default markers not showing
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        if (!isMounted) return

        // Default center (India center) or initial location
        let center: [number, number] = initialLocation 
          ? [initialLocation.latitude, initialLocation.longitude]
          : [20.5937, 78.9629]
        let zoom = initialLocation ? 12 : 5

        // Clean up existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
        }

        // Create map
        const map = L.map(mapRef.current!).setView(center, zoom)
        mapInstanceRef.current = map

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map)

        // Create custom icon for selected location
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
          markerRef.current = L.marker(
            [initialLocation.latitude, initialLocation.longitude],
            { 
              icon: selectedIcon,
              draggable: true 
            }
          ).addTo(map)

          // Handle marker drag
          markerRef.current.on('dragend', async (e: any) => {
            const latlng = e.target.getLatLng()
            await updateSelectedLocation(latlng.lat, latlng.lng)
          })
        }

        // Handle map click
        map.on('click', async (e: any) => {
          const { lat, lng } = e.latlng

          // Remove existing marker
          if (markerRef.current) {
            markerRef.current.remove()
          }

          // Add new marker
          markerRef.current = L.marker([lat, lng], { 
            icon: selectedIcon,
            draggable: true 
          }).addTo(map)

          // Handle marker drag
          markerRef.current.on('dragend', async (e: any) => {
            const latlng = e.target.getLatLng()
            await updateSelectedLocation(latlng.lat, latlng.lng)
          })

          await updateSelectedLocation(lat, lng)
        })

        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing map:', error)
        setLoadError('Failed to load map')
        setIsLoading(false)
      }
    }

    initializeMap()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [initialLocation])

  const updateSelectedLocation = async (lat: number, lng: number) => {
    // Get address for the coordinates
    const address = await reverseGeocode(lat, lng)
    
    const newLocation: Location = {
      latitude: lat,
      longitude: lng,
      address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
    
    setSelectedLocation(newLocation)
    onLocationSelect(newLocation)
  }

  const handleSearch = async (query: string) => {
    if (!mapInstanceRef.current) return

    setIsSearching(true)
    try {
      // Remove country restriction to allow global search
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'Dhaana-App/1.0 (monastery-donation-platform)'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.length > 0) {
        const result = data[0]
        const lat = parseFloat(result.lat)
        const lng = parseFloat(result.lon)
        
        // Just pan and zoom to searched location, don't set it as selected
        mapInstanceRef.current.setView([lat, lng], 12)
        
        // Don't place a marker or update the selected location
        // User needs to click on the map to actually select the location
      } else {
        setLoadError('Location not found. Try a different search term.')
        setTimeout(() => setLoadError(null), 3000)
      }
    } catch (error) {
      console.error('Search error:', error)
      setLoadError('Error searching for location. Please try again.')
      setTimeout(() => setLoadError(null), 3000)
    } finally {
      setIsSearching(false)
    }
  }

  if (loadError && !mapInstanceRef.current) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 ${className}`}
        style={{ height }}
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
        </AlertDescription>
      </Alert>

      {/* Search Bar */}
      {showSearchBar && (
        <MapSearchBar
          onSearch={handleSearch}
          placeholder={searchPlaceholder || "Search for a country, city, or address..."}
          disabled={isSearching}
        />
      )}

      {/* Error Message */}
      {loadError && mapInstanceRef.current && (
        <Alert variant="destructive">
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}

      {/* Map Container */}
      <div className="relative rounded-lg border overflow-hidden" style={{ height: mapHeight }}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Selected Location Display - Mobile optimized */}
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
    </div>
  )
}