'use client'

import { useState } from 'react'
import { LocationSettings } from '@/components/location-settings'
import { DualModeLocationPicker } from '@/components/interactive-location-picker'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Info } from 'lucide-react'

export default function LocationDemoPage() {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null)

  const [standaloneLocation, setStandaloneLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null)

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interactive Location Picker Demo
          </h1>
          <p className="text-gray-600">
            Test the new map-based location selection feature
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="max-w-3xl mx-auto">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This demo showcases the new interactive map location picker. You can:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Search for countries, cities, or landmarks to focus the map (doesn't select location)</li>
              <li>Click anywhere on the map to select a precise location</li>
              <li>Drag the marker to fine-tune your selection</li>
              <li>Use it alongside GPS detection and manual address entry</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Demo 1: LocationSettings with Interactive Picker */}
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Complete Location Settings Component
            </h2>
            <LocationSettings
              currentLocation={selectedLocation}
              onLocationUpdate={setSelectedLocation}
            />
          </div>

          {/* Selected Location Display */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Selected Location Details
            </h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Current Selection</span>
                </CardTitle>
                <CardDescription>
                  Location data from the settings component
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedLocation ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Address:</p>
                      <p className="text-sm">{selectedLocation.address || 'No address available'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Latitude:</p>
                        <p className="text-sm font-mono">{selectedLocation.latitude.toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Longitude:</p>
                        <p className="text-sm font-mono">{selectedLocation.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No location selected yet. Use any of the methods above to set your location.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Demo 2: Standalone Interactive Picker */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Standalone Interactive Location Picker
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>Pick a Location</CardTitle>
              <CardDescription>
                This demonstrates the interactive picker component used independently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DualModeLocationPicker
                initialLocation={standaloneLocation}
                onLocationSelect={setStandaloneLocation}
                height="500px"
                searchPlaceholder="Search for any location worldwide..."
              />
              
              {standaloneLocation && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    Selected: {standaloneLocation.address}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Coordinates: {standaloneLocation.latitude.toFixed(6)}, {standaloneLocation.longitude.toFixed(6)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mobile Responsiveness Test */}
        <div className="text-center text-sm text-gray-500 pb-8">
          <p>Try resizing your browser window to test mobile responsiveness</p>
          <p className="mt-1">The map height and UI elements will adapt to smaller screens</p>
        </div>
      </div>
    </div>
  )
}