'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Navigation, Search, CheckCircle2, AlertCircle, Loader2, Map } from 'lucide-react'
import { getUserLocation, formatDistance } from '@/lib/location-utils'
import { LocationService } from '@/lib/location-services'
import { updateUserLocation } from '@/lib/supabase'
import { DualModeLocationPicker } from '@/components/interactive-location-picker'

interface LocationSettingsProps {
  userId?: string;
  currentLocation?: { latitude: number; longitude: number; address?: string } | null;
  onLocationUpdate?: (location: { latitude: number; longitude: number; address?: string }) => void;
  showDistance?: boolean;
  targetLocation?: { latitude: number; longitude: number };
}

export function LocationSettings({
  userId,
  currentLocation,
  onLocationUpdate,
  showDistance = false,
  targetLocation
}: LocationSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [searchAddress, setSearchAddress] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [location, setLocation] = useState(currentLocation)
  const [showMapPicker, setShowMapPicker] = useState(true)

  const getCurrentLocation = async () => {
    setLoading(true)
    setStatus({ type: 'info', message: 'Getting your current location...' })
    
    try {
      const userLocation = await getUserLocation()
      
      if (userLocation) {
        // Get address for the coordinates
        const address = await LocationService.reverseGeocode(userLocation.latitude, userLocation.longitude)
        
        const newLocation = {
          ...userLocation,
          address: address || `${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`
        }
        
        setLocation(newLocation)
        
        // Save to database if userId provided
        if (userId) {
          const { error } = await updateUserLocation(
            userId, 
            newLocation.latitude, 
            newLocation.longitude, 
            newLocation.address
          )
          
          if (error) {
            setStatus({ type: 'error', message: 'Failed to save location to profile' })
          } else {
            setStatus({ type: 'success', message: 'Location updated successfully!' })
            onLocationUpdate?.(newLocation)
          }
        } else {
          setStatus({ type: 'success', message: 'Location detected successfully!' })
          onLocationUpdate?.(newLocation)
        }
      } else {
        setStatus({ 
          type: 'error', 
          message: 'Could not get your location. Please check permissions or try entering an address.' 
        })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error getting location. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const searchByAddress = async () => {
    if (!searchAddress.trim()) {
      setStatus({ type: 'error', message: 'Please enter an address to search' })
      return
    }

    setLoading(true)
    setStatus({ type: 'info', message: 'Searching for address...' })
    
    try {
      const geocodedResult = await LocationService.geocode(searchAddress)
      const geocodedLocation = geocodedResult?.location
      
      if (geocodedLocation) {
        setLocation(geocodedLocation)
        
        // Save to database if userId provided
        if (userId) {
          const { error } = await updateUserLocation(
            userId, 
            geocodedLocation.latitude, 
            geocodedLocation.longitude, 
            geocodedLocation.address
          )
          
          if (error) {
            setStatus({ type: 'error', message: 'Failed to save location to profile' })
          } else {
            setStatus({ type: 'success', message: 'Address found and saved!' })
            onLocationUpdate?.(geocodedLocation)
          }
        } else {
          setStatus({ type: 'success', message: 'Address found!' })
          onLocationUpdate?.(geocodedLocation)
        }
        
        setSearchAddress('')
      } else {
        setStatus({ 
          type: 'error', 
          message: 'Address not found. Please try a different address or be more specific.' 
        })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error searching for address. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchByAddress()
    }
  }

  const handleMapLocationSelect = async (selectedLocation: { latitude: number; longitude: number; address?: string }) => {
    setLocation(selectedLocation)
    
    // Save to database if userId provided
    if (userId) {
      const { error } = await updateUserLocation(
        userId,
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedLocation.address
      )
      
      if (error) {
        setStatus({ type: 'error', message: 'Failed to save location to profile' })
      } else {
        setStatus({ type: 'success', message: 'Location selected and saved!' })
        onLocationUpdate?.(selectedLocation)
      }
    } else {
      setStatus({ type: 'success', message: 'Location selected!' })
      onLocationUpdate?.(selectedLocation)
    }
    
    // Close the map picker after selection
    setShowMapPicker(false)
  }

  const calculateDistanceToTarget = () => {
    if (!location || !targetLocation) return null
    
    const { calculateDistance } = require('@/lib/location-utils')
    return calculateDistance(
      location.latitude,
      location.longitude,
      targetLocation.latitude,
      targetLocation.longitude
    )
  }

  const distance = showDistance ? calculateDistanceToTarget() : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Location Settings</span>
        </CardTitle>
        <CardDescription>
          Set your location to find nearby monasteries and calculate distances
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Location Display */}
        {location && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Current Location</p>
                <p className="text-sm text-green-700">{location.address}</p>
                {distance && (
                  <p className="text-sm text-green-600 mt-1">
                    📍 {formatDistance(distance)} away
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {status && (
          <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
            {status.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        {/* Auto-detect Location */}
        <div className="space-y-2">
          <Button 
            onClick={getCurrentLocation} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            Use Current Location
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Your browser will ask for location permission
          </p>
        </div>

        {/* Manual Address Entry */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm sm:text-base">Or enter your address manually</Label>
          <div className="flex space-x-2">
            <Input
              id="address"
              placeholder="Enter city, area, or full address..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <Button
              onClick={searchByAddress}
              disabled={loading || !searchAddress.trim()}
              variant="outline"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 px-1">
            Try: "Bangalore", "Connaught Place Delhi", or a specific address
          </p>
        </div>

        {/* Interactive Map Picker - Always Visible */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Pick Location from Map</Label>
            <Button
              onClick={() => setShowMapPicker(!showMapPicker)}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <Map className="w-4 h-4 mr-1" />
              {showMapPicker ? 'Hide Map' : 'Show Map'}
            </Button>
          </div>
          {showMapPicker && (
            <div className="mt-3">
              <DualModeLocationPicker
                initialLocation={location || null}
                onLocationSelect={handleMapLocationSelect}
                height="400px"
                searchPlaceholder="Search for a country, city, or landmark..."
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 space-y-1 px-1">
          <p className="break-words">• Location is used to find nearby monasteries and calculate distances</p>
          <p className="break-words">• Your location data is stored securely and used only for this purpose</p>
          <p className="break-words">• You can update your location anytime</p>
        </div>
      </CardContent>
    </Card>
  )
}
