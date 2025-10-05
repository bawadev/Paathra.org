'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { AuthForm } from '@/components/auth-form'
import { Footer } from '@/components/organisms/Footer/Footer'
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
  const { user, profile, loading: authLoading } = useAuthStore()
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
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-muted-foreground">{tCommon('loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{t('title')}</h1>
          <p className="text-base md:text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>

        {/* Location and Controls */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-4 mb-4 md:mb-6">
          <div className="lg:col-span-3">
            <Card className="rounded-xl md:rounded-2xl shadow-elegant-lg">
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span className="text-foreground text-base md:text-lg">{t('locationAndFilters')}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLocationSettings(!showLocationSettings)}
                    className="min-h-[44px] w-full sm:w-auto"
                  >
                    <NavigationIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">{t('setLocation')}</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Search */}
                  <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                    <label className="text-sm font-medium text-foreground">{t('search')}</label>
                    <Input
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="min-h-[44px]"
                    />
                  </div>

                  {/* Sort By */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">{t('sortBy')}</label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="distance" className="min-h-[44px]">{t('distance')}</SelectItem>
                        <SelectItem value="name" className="min-h-[44px]">{t('name')}</SelectItem>
                        <SelectItem value="capacity" className="min-h-[44px]">{t('capacity')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Max Distance */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">{t('maxDistance')}</label>
                    <Select value={maxDistance.toString()} onValueChange={(value) => setMaxDistance(parseInt(value))}>
                      <SelectTrigger className="min-h-[44px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10" className="min-h-[44px]">10 km</SelectItem>
                        <SelectItem value="25" className="min-h-[44px]">25 km</SelectItem>
                        <SelectItem value="50" className="min-h-[44px]">50 km</SelectItem>
                        <SelectItem value="100" className="min-h-[44px]">100 km</SelectItem>
                        <SelectItem value="500" className="min-h-[44px]">500 km</SelectItem>
                        <SelectItem value="2000" className="min-h-[44px]">2000 km</SelectItem>
                        <SelectItem value="999999" className="min-h-[44px]">Show All</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Current Location Display */}
                {userLocation && (
                  <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">{t('yourLocation')}</span>
                      <span className="text-sm text-muted-foreground">
                        {userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:block">
            <Card className="rounded-xl md:rounded-2xl shadow-elegant-lg">
              <CardHeader>
                <CardTitle className="text-base md:text-lg text-foreground">{t('quickStats')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex lg:flex-col gap-4 lg:gap-3 lg:space-y-0">
                  <div className="flex-1 lg:flex-none">
                    <div className="text-2xl font-bold text-primary">{filteredMonasteries.length}</div>
                    <div className="text-xs md:text-sm text-muted-foreground">Monasteries Found</div>
                  </div>
                  {userLocation && (
                    <div className="flex-1 lg:flex-none">
                      <div className="text-2xl font-bold text-compassion-600">
                        {filteredMonasteries.filter(m => m.distance && m.distance <= 25).length}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">Within 25km</div>
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
        <Card className="mb-4 md:mb-6 rounded-xl md:rounded-2xl shadow-elegant-lg overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-foreground text-base md:text-lg">
              <Map className="w-5 h-5 text-primary" />
              <span>Monasteries Map</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[300px] md:h-[400px] lg:h-[500px]">
              <MonasteryMap
                monasteries={filteredMonasteries}
                userLocation={userLocation}
                onMonasterySelect={handleMonasterySelect}
                height="100%"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading monasteries...</p>
          </div>
        ) : (
          /* Monasteries Grid */
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMonasteries.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <MapPin className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">No monasteries found</h3>
                <p className="text-muted-foreground text-sm md:text-lg px-4">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Try setting your location or increasing the distance range'}
                </p>
              </div>
            ) : (
              filteredMonasteries.map((monastery) => (
                <Card key={monastery.id} className="rounded-xl md:rounded-2xl shadow-elegant hover:shadow-elegant-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base md:text-lg text-foreground break-words">{monastery.name}</CardTitle>
                        <CardDescription className="flex items-start mt-1.5 text-sm">
                          <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0 text-primary" />
                          <span className="break-words">{monastery.address}</span>
                        </CardDescription>
                      </div>
                      {monastery.distance && (
                        <Badge variant="outline" className="flex-shrink-0 text-xs">
                          {formatDistance(monastery.distance)}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    {monastery.description && (
                      <p className="text-sm text-muted-foreground">{monastery.description}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {monastery.capacity && (
                        <div className="flex items-center text-foreground">
                          <Users className="w-4 h-4 mr-2 text-primary" />
                          <span>{monastery.capacity} monks</span>
                        </div>
                      )}

                      {monastery.phone && (
                        <div className="flex items-center text-foreground">
                          <Phone className="w-4 h-4 mr-2 text-primary" />
                          <span className="truncate">{monastery.phone}</span>
                        </div>
                      )}

                      {monastery.email && (
                        <div className="flex items-center text-foreground">
                          <Mail className="w-4 h-4 mr-2 text-primary" />
                          <span className="truncate">{monastery.email}</span>
                        </div>
                      )}

                      {monastery.website && (
                        <div className="flex items-center text-foreground">
                          <Globe className="w-4 h-4 mr-2 text-primary" />
                          <a href={monastery.website} target="_blank" rel="noopener noreferrer"
                             className="text-primary hover:underline truncate">
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:space-x-0">
                      <Link
                        href={{
                          pathname: '/donations',
                          query: { monastery: monastery.id }
                        }}
                        className="flex-1"
                      >
                        <Button className="w-full min-h-[44px] bg-gradient-primary text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm">
                          {t('makeDonation')}
                        </Button>
                      </Link>
                      <Link
                        href={`/monasteries/${monastery.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full min-h-[44px] rounded-xl text-sm">
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
      <Footer />
    </div>
  )
}
