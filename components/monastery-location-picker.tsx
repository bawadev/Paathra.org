'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, CheckCircle2, AlertCircle } from 'lucide-react'
import { DualModeLocationPicker } from '@/components/interactive-location-picker'
import { updateMonasteryLocation } from '@/lib/supabase'
import { LocationService } from '@/lib/location-services'

interface MonasteryLocationPickerProps {
  monasteryId: string
  currentLocation?: { latitude: number; longitude: number; address?: string } | null
  onLocationUpdate?: (location: { latitude: number; longitude: number; address?: string }) => void
}

export function MonasteryLocationPicker({
  monasteryId,
  currentLocation,
  onLocationUpdate
}: MonasteryLocationPickerProps) {
  const [location, setLocation] = useState(currentLocation)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const handleLocationSelect = async (selectedLocation: { latitude: number; longitude: number; address?: string }) => {
    setLocation(selectedLocation)
    
    // Save to database
    setSaving(true)
    setStatus(null)
    
    try {
      const { error } = await updateMonasteryLocation(
        monasteryId,
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedLocation.address
      )
      
      if (error) {
        setStatus({ type: 'error', message: 'Failed to save location to monastery profile' })
      } else {
        setStatus({ type: 'success', message: 'Location updated successfully!' })
        onLocationUpdate?.(selectedLocation)
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error saving location. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleAddressUpdate = async (address: string) => {
    if (!location) return
    
    setSaving(true)
    try {
      const { error } = await updateMonasteryLocation(
        monasteryId,
        location.latitude,
        location.longitude,
        address
      )
      
      if (error) {
        setStatus({ type: 'error', message: 'Failed to update address' })
      } else {
        setStatus({ type: 'success', message: 'Address updated successfully!' })
        onLocationUpdate?.({ ...location, address })
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Error updating address' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Monastery Location</span>
        </CardTitle>
        <CardDescription>
          Set the exact location of your monastery for accurate distance calculations and map display
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
                <p className="text-sm text-green-700">{location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}</p>
                <p className="text-xs text-green-600 mt-1">
                  Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
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

        {/* Interactive Map Picker */}
        <div className="space-y-2">
          <DualModeLocationPicker
            initialLocation={location || null}
            onLocationSelect={handleLocationSelect}
            height="400px"
            searchPlaceholder="Search for your monastery location..."
            className="w-full"
          />
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Click on the map to set your monastery's exact location</p>
          <p>• You can drag the marker to fine-tune the position</p>
          <p>• The location will be used to calculate distances for donors</p>
        </div>
      </CardContent>
    </Card>
  )
}