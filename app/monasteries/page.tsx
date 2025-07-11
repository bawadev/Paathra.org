'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase, Monastery } from '@/lib/supabase'
import { MapPin, Phone, Mail, Globe, Users } from 'lucide-react'
import Link from 'next/link'

export default function MonasteriesPage() {
  const { user, loading: authLoading } = useAuth()
  const [monasteries, setMonasteries] = useState<Monastery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchMonasteries()
    }
  }, [user])

  const fetchMonasteries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('monasteries')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching monasteries:', error)
    } else {
      setMonasteries(data || [])
    }
    setLoading(false)
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Monasteries</h1>
          <p className="text-gray-600">
            Explore monasteries in your area and learn about their specific needs and donation preferences.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading monasteries...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {monasteries.map((monastery) => (
              <Card key={monastery.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  {monastery.image_url && (
                    <div className="aspect-video bg-gray-200 rounded-md mb-4">
                      <img
                        src={monastery.image_url}
                        alt={monastery.name}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  )}
                  <CardTitle>{monastery.name}</CardTitle>
                  {monastery.description && (
                    <CardDescription>{monastery.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{monastery.address}</span>
                    </div>

                    {monastery.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{monastery.phone}</span>
                      </div>
                    )}

                    {monastery.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{monastery.email}</span>
                      </div>
                    )}

                    {monastery.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2" />
                        <a 
                          href={monastery.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline text-blue-600"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>Capacity: {monastery.capacity} people</span>
                    </div>
                  </div>

                  {monastery.dietary_requirements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Dietary Requirements:</h4>
                      <div className="flex flex-wrap gap-1">
                        {monastery.dietary_requirements.map((req) => (
                          <Badge key={req} variant="secondary" className="text-xs">
                            {req.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {monastery.preferred_donation_times && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Preferred Donation Times:</h4>
                      <p className="text-sm text-gray-600">{monastery.preferred_donation_times}</p>
                    </div>
                  )}

                  <Button asChild className="w-full">
                    <Link href="/donate">Make Donation</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
