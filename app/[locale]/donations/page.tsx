'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, DonationSlot, Monastery } from '@/lib/supabase'
import { format, parseISO } from 'date-fns'
import { Calendar, Clock, MapPin, Users, Utensils, Heart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface DonationSlotWithMonastery extends DonationSlot {
  monastery: Monastery
}

export default function DonationsPage() {
  const { user, loading: authLoading } = useAuth()
  const [slots, setSlots] = useState<DonationSlotWithMonastery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAvailableSlots()
  }, [])

  const fetchAvailableSlots = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('donation_slots')
      .select(`
        *,
        monastery:monasteries(*)
      `)
      .eq('is_available', true)
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(50)

    if (error) {
      console.error('Error fetching donation slots:', error)
    } else {
      // Filter slots that still have capacity for monks
      const availableSlots = (data || []).filter((slot: DonationSlotWithMonastery) => 
        slot.monks_fed < slot.monks_capacity
      ).slice(0, 20)
      setSlots(availableSlots)
    }
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="text-lg text-[var(--text-light)] flex items-center gap-3">
          <div className="lotus-icon animate-spin"></div>
          Loading donation opportunities...
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold">
              <span className="gradient-text">Make a Donation</span>
            </h1>
            <p className="text-xl text-[var(--text-light)] max-w-2xl mx-auto">
              Find available donation slots at Buddhist monasteries and share the joy of giving
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="flex items-center gap-3 text-[var(--text-light)]">
                <div className="lotus-icon animate-spin"></div>
                <span className="text-lg">Finding donation opportunities...</span>
              </div>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-20">
              <div className="card-dana max-w-2xl mx-auto p-12">
                <Calendar className="w-16 h-16 text-[var(--primary-color)] mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-[var(--text-dark)] mb-4">
                  No available slots
                </h3>
                <p className="text-[var(--text-light)] mb-8 text-lg">
                  There are currently no available donation slots. Please check back later or explore monasteries to learn more.
                </p>
                <Link href="/monasteries">
                  <Button className="btn-dana-primary large">
                    <MapPin className="w-5 h-5 mr-2" />
                    Explore Monasteries
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-[var(--text-dark)]">
                  Available Donation Slots ({slots.length})
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slots.map((slot) => (
                  <div key={slot.id} className="card-dana overflow-hidden hover:shadow-xl transition-all duration-300">
                    {/* Monastery Image */}
                    <div className="h-48 bg-gradient-to-br from-[var(--primary-color)] to-[var(--accent-color)] relative overflow-hidden">
                      {slot.monastery.image_url ? (
                        <img 
                          src={slot.monastery.image_url} 
                          alt={slot.monastery.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className="w-16 h-16 text-white opacity-80" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-white/90 text-[var(--text-dark)] hover:bg-white">
                          Available
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-semibold text-xl text-[var(--text-dark)] mb-3">
                        {slot.monastery.name}
                      </h3>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-[var(--text-light)]">
                          <Calendar className="w-4 h-4 text-[var(--primary-color)]" />
                          <span>
                            {format(parseISO(slot.date), 'EEEE, MMMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[var(--text-light)]">
                          <Clock className="w-4 h-4 text-[var(--primary-color)]" />
                          <span>{slot.time_slot}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[var(--text-light)]">
                          <Users className="w-4 h-4 text-[var(--primary-color)]" />
                          <span>
                            {slot.monks_fed}/{slot.monks_capacity} monks fed
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[var(--text-light)]">
                          <MapPin className="w-4 h-4 text-[var(--primary-color)]" />
                          <span className="text-sm">{slot.monastery.address}</span>
                        </div>
                        
                        {/* Feeding Progress Bar */}
                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Feeding Progress</span>
                            <span>{slot.monks_capacity - slot.monks_fed} monks remaining</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-[var(--primary-color)] h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(slot.monks_fed / slot.monks_capacity) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {slot.special_requirements && (
                        <div className="mb-6 p-3 bg-[var(--bg-light)] rounded-lg">
                          <p className="text-sm text-[var(--text-dark)]">
                            <strong>Special Requirements:</strong> {slot.special_requirements}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-[var(--text-light)]">
                          Feed up to {slot.monks_capacity - slot.monks_fed} monks
                        </div>
                        <Button 
                          className="btn-dana-primary"
                          disabled={slot.monks_fed >= slot.monks_capacity}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Donate Food
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="text-center mt-12">
                <div className="card-dana max-w-3xl mx-auto p-8">
                  <h3 className="text-2xl font-semibold text-[var(--text-dark)] mb-4">
                    Can&apos;t find a suitable time?
                  </h3>
                  <p className="text-[var(--text-light)] mb-6 text-lg">
                    Explore all monasteries in your area and get notified when new donation slots become available.
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Link href="/monasteries">
                      <Button className="btn-dana-secondary">
                        <MapPin className="w-5 h-5 mr-2" />
                        Browse All Monasteries
                      </Button>
                    </Link>
                    <Link href="/my-donations">
                      <Button className="btn-dana-primary">
                        <ArrowRight className="w-5 h-5 mr-2" />
                        View My Donations
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
