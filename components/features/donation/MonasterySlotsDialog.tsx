'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { Search, MapPin, Clock, Users, ExternalLink } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { DonationSlot, Monastery } from '@/lib/types'

interface DonationSlotWithMonastery extends DonationSlot {
  monastery?: Monastery
}

interface MonasterySlotsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date | null
  slots: DonationSlotWithMonastery[]
  onSlotSelect: (slot: DonationSlotWithMonastery) => void
  onMonasteryNavigate: (monasteryId: string) => void
}

interface UserLocation {
  latitude: number
  longitude: number
}

export function MonasterySlotsDialog({
  open,
  onOpenChange,
  date,
  slots,
  onSlotSelect,
  onMonasteryNavigate
}: MonasterySlotsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  // Get user's location on component mount
  useEffect(() => {
    if (open && !userLocation && !locationLoading) {
      getUserLocation()
    }
    
    // Prevent body scroll when dialog is open
    if (open) {
      // Store current scroll position
      setScrollY(window.scrollY)
      
      // Add styles to prevent scrolling
      document.body.style.position = 'fixed'
      document.body.style.top = `-${window.scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      // Restore scrolling
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      
      // Restore scroll position
      window.scrollTo(0, scrollY)
    }
    
    return () => {
      // Ensure body scroll is restored when component unmounts
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      if (scrollY) {
        window.scrollTo(0, scrollY)
      }
    }
  }, [open, scrollY])

  const getUserLocation = () => {
    setLocationLoading(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          setLocationLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          setLocationLoading(false)
        }
      )
    } else {
      console.error('Geolocation is not supported')
      setLocationLoading(false)
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Filter and sort slots by search query and distance
  const filteredAndSortedSlots = useMemo(() => {
    let filtered = slots.filter(slot => 
      slot.monastery && 
      slot.monastery.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Sort by distance if user location is available
    if (userLocation) {
      filtered = filtered.sort((a, b) => {
        if (!a.monastery?.latitude || !a.monastery?.longitude || 
            !b.monastery?.latitude || !b.monastery?.longitude) {
          return 0
        }
        
        const distanceA = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          a.monastery.latitude,
          a.monastery.longitude
        )
        
        const distanceB = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          b.monastery.latitude,
          b.monastery.longitude
        )
        
        return distanceA - distanceB
      })
    }

    return filtered
  }, [slots, searchQuery, userLocation])

  const handleSlotSelect = (slot: DonationSlotWithMonastery) => {
    onSlotSelect(slot)
    onOpenChange(false)
  }

  const handleMonasteryNavigate = (monasteryId: string) => {
    onMonasteryNavigate(monasteryId)
    onOpenChange(false)
  }

  const getDistanceDisplay = (monastery: any) => {
    if (!userLocation || !monastery?.latitude || !monastery?.longitude) {
      return null
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      monastery.latitude,
      monastery.longitude
    )

    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)}m`
    }
    return `${distance.toFixed(1)}km`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-2xl">
            Available Slots for {date && format(date, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
          <DialogDescription>
            {filteredAndSortedSlots.length} monastery slot{filteredAndSortedSlots.length !== 1 ? 's' : ''} available
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full overflow-hidden">
          {/* Search Bar */}
          <div className="px-6 py-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search monasteries by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Location Status */}
          {locationLoading && (
            <div className="px-6 py-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-500"></div>
                Getting your location...
              </div>
            </div>
          )}

          {/* Slots List */}
          <div className="flex-1 overflow-y-auto px-6 py-4" style={{
            maxHeight: 'calc(80vh - 200px)',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d1d5db #f3f4f6'
          }}>
          <style jsx>{`
            div::-webkit-scrollbar {
              width: 8px;
            }
            div::-webkit-scrollbar-track {
              background: #f3f4f6;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb {
              background: #d1d5db;
              border-radius: 4px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: #9ca3af;
            }
          `}</style>
            {filteredAndSortedSlots.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchQuery ? 'No monasteries match your search.' : 'No slots available for this date.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedSlots.map((slot) => (
                  <Card 
                    key={slot.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer border"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Monastery Name and Distance */}
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {slot.monastery?.name || 'Unknown Monastery'}
                            </h3>
                            {getDistanceDisplay(slot.monastery) && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {getDistanceDisplay(slot.monastery)}
                              </Badge>
                            )}
                          </div>

                          {/* Address */}
                          {slot.monastery?.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                              <MapPin className="w-4 h-4" />
                              <span>{slot.monastery.address}</span>
                            </div>
                          )}

                          {/* Slot Details */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-amber-600" />
                              <span>{slot.time_slot}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-green-600" />
                              <span>{slot.max_donors} donors max</span>
                            </div>
                            <Badge 
                              variant={slot.is_available ? "default" : "secondary"}
                              className={cn(
                                slot.is_available && "bg-green-100 text-green-800",
                                !slot.is_available && "bg-gray-100 text-gray-800"
                              )}
                            >
                              {slot.is_available ? 'Available' : 'Full'}
                            </Badge>
                          </div>

                          {/* Special Requirements */}
                          {slot.special_requirements && (
                            <div className="mt-2 text-sm text-gray-600">
                              <strong>Requirements:</strong> {slot.special_requirements}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 ml-4">
                          {slot.is_available && (
                            <Button
                              size="sm"
                              onClick={() => handleSlotSelect(slot)}
                              className="bg-amber-500 hover:bg-amber-600 text-white"
                            >
                              Select Slot
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMonasteryNavigate(slot.monastery_id)}
                            className="flex items-center gap-1"
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}