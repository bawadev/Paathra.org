'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getMonasteriesWithDistance } from '@/lib/supabase'
import { MonasteryWithDistance } from '@/lib/types/database.types'
import { LocationSettings } from '@/components/location-settings'
import { MonasteryMap } from '@/components/monastery-map'
import { getUserLocation, formatDistance } from '@/lib/location-utils'
import { MapPin, Phone, Mail, Globe, Users, Map, Navigation as NavigationIcon } from 'lucide-react'
import { Link } from '@/src/i18n/navigation'
import { useTranslations } from 'next-intl'

export default function MonasteriesPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const t = useTranslations('Monasteries')
  const tCommon = useTranslations('Common')
  const [monasteries, setMonasteries] = useState<MonasteryWithDistance[]>([])
  const [filteredMonasteries, setFilteredMonasteries] = useState<MonasteryWithDistance[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number, address?: string} | null>(null)
  const [showMap, setShowMap] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'distance' | 'name' | 'capacity'>('distance')
  const [maxDistance, setMaxDistance] = useState<number>(100)
  const [showLocationSettings, setShowLocationSettings] = useState(false)
  const [savingLocation, setSavingLocation] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      initializeLocationAndMonasteries()
    }
  }, [authLoading, user, profile])

  useEffect(() => {
    filterAndSortMonasteries()
  }, [monasteries, searchQuery, sortBy, maxDistance, userLocation])

  const initializeLocationAndMonasteries = async () => {
    setLoading(true)
    
    // Try to get user location from profile first (if logged in)
    let currentLocation: { latitude: number; longitude: number; address?: string } | null = null
    
    if (user && profile) {
      // Always prioritize saved profile location for logged-in users
      if (profile.latitude && profile.longitude) {
        currentLocation = {
          latitude: profile.latitude,
          longitude: profile.longitude,
          ...(profile.address && { address: profile.address })
        }
        setUserLocation(currentLocation)
      } else {
        // For logged-in users without saved location, try to detect but DON'T auto-save
        const detectedLocation = await getUserLocation()
        if (detectedLocation) {
          // Only use detected location, don't save to database
          setUserLocation(detectedLocation)
          currentLocation = detectedLocation
        }
      }
    } else {
      // For non-logged-in users, use detected location (not saved)
      const detectedLocation = await getUserLocation()
      if (detectedLocation) {
        setUserLocation(detectedLocation)
        currentLocation = detectedLocation
      }
    }

    await fetchMonasteries(currentLocation)
  }

  const fetchMonasteries = async (location?: { latitude: number; longitude: number } | null) => {
    setLoading(true)
    const data = await getMonasteriesWithDistance(
      location?.latitude,
      location?.longitude,
      maxDistance
    )
    setMonasteries(data)
    setLoading(false)
  }

  const filterAndSortMonasteries = () => {
    let filtered = [...monasteries]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(monastery => 
        monastery.name.toLowerCase().includes(query) ||
        monastery.address.toLowerCase().includes(query) ||
        monastery.description?.toLowerCase().includes(query)
      )
    }

    // Apply distance filter
    if (userLocation && maxDistance) {
      filtered = filtered.filter(monastery => 
        !monastery.distance || monastery.distance <= maxDistance
      )
    }

    // Apply sorting
    switch (sortBy) {
      case 'distance':
        filtered.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'capacity':
        filtered.sort((a, b) => (b.capacity || 0) - (a.capacity || 0))
        break
    }

    setFilteredMonasteries(filtered)
  }

  const handleLocationUpdate = async (location: { latitude: number; longitude: number; address?: string }) => {
    setUserLocation(location)
    
    // Save to database if user is logged in
    if (user?.id) {
      const { updateUserLocation } = await import('@/lib/supabase')
      await updateUserLocation(user.id, location.latitude, location.longitude, location.address)
    }
    
    await fetchMonasteries(location)
    setShowLocationSettings(false)
  }

  const handleMonasterySelect = (monastery: MonasteryWithDistance) => {
    // You can add navigation or modal logic here
    console.log('Selected monastery:', monastery)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="text-lg text-[var(--text-light)]">{tCommon('loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">
            {t('description')}
          </p>
        </div>

        {/* Location and Controls */}
        <div className="grid gap-6 lg:grid-cols-4 mb-6">
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>{t('locationAndFilters')}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLocationSettings(!showLocationSettings)}
                  >
                    <NavigationIcon className="w-4 h-4 mr-1" />
                    {t('setLocation')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Search */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t('search')}</label>
                    <Input
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Sort By */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t('sortBy')}</label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance">{t('distance')}</SelectItem>
                        <SelectItem value="name">{t('name')}</SelectItem>
                        <SelectItem value="capacity">{t('capacity')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Distance */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{t('maxDistance')}</label>
                    <Select value={maxDistance.toString()} onValueChange={(value) => setMaxDistance(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 km</SelectItem>
                        <SelectItem value="25">25 km</SelectItem>
                        <SelectItem value="50">50 km</SelectItem>
                        <SelectItem value="100">100 km</SelectItem>
                        <SelectItem value="500">500 km</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Current Location Display */}
                {userLocation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">{t('yourLocation')}</span>
                      <span className="text-sm text-blue-700">
                        {userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('quickStats')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{filteredMonasteries.length}</div>
                    <div className="text-sm text-gray-600">Monasteries Found</div>
                  </div>
                  {userLocation && (
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {filteredMonasteries.filter(m => m.distance && m.distance <= 25).length}
                      </div>
                      <div className="text-sm text-gray-600">Within 25km</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Location Settings Modal */}
        {showLocationSettings && (
          <div className="mb-6">
            <LocationSettings
              userId={user?.id || undefined}
              currentLocation={userLocation}
              onLocationUpdate={handleLocationUpdate}
            />
          </div>
        )}

        {/* Map View - Always Visible */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Map className="w-5 h-5" />
              <span>Monasteries Map</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MonasteryMap
              monasteries={filteredMonasteries}
              userLocation={userLocation}
              onMonasterySelect={handleMonasterySelect}
              height="500px"
            />
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading monasteries...</p>
          </div>
        ) : (
          /* Monasteries Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMonasteries.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No monasteries found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Try setting your location or increasing the distance range'}
                </p>
              </div>
            ) : (
              filteredMonasteries.map((monastery) => (
                <Card key={monastery.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{monastery.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {monastery.address}
                        </CardDescription>
                      </div>
                      {monastery.distance && (
                        <Badge variant="outline" className="ml-2">
                          {formatDistance(monastery.distance)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {monastery.description && (
                      <p className="text-sm text-gray-600">{monastery.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {monastery.capacity && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span>{monastery.capacity} monks</span>
                        </div>
                      )}
                      
                      {monastery.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{monastery.phone}</span>
                        </div>
                      )}
                      
                      {monastery.email && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{monastery.email}</span>
                        </div>
                      )}
                      
                      {monastery.website && (
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          <a href={monastery.website} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline truncate">
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        href={{
                          pathname: '/donations',
                          query: { monastery: monastery.id }
                        }}
                        className="flex-1"
                      >
                        <Button className="w-full">
                          {t('makeDonation')}
                        </Button>
                      </Link>
                      <Link
                        href={`/monasteries/${monastery.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full">
                          {t('viewPortfolio')}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
