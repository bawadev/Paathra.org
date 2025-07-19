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
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-full pulse"></div>
          <div className="text-lg text-[var(--text-light)] fade-in">Loading...</div>
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
      
      <main className="container-dana section-dana">
        {/* Header */}
        <div className="text-center px-4 sm:px-6 md:px-8" style={{
          marginBottom: 'var(--section-spacing)',
          paddingTop: 'var(--header-height)'
        }}>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text fade-in-1"
              style={{marginBottom: 'var(--space-4)'}}>
            Buddhist Monasteries
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-light)] max-w-2xl mx-auto fade-in-2"
             style={{marginBottom: 'var(--space-6)'}}>
            Discover and support Buddhist monasteries in your area. Each monastery has unique needs and practices.
          </p>
        </div>

        {loading ? (
          <div className="grid-dana grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="card-dana skeleton">
                <CardHeader className="pb-4">
                  <div className="w-full h-32 bg-[var(--bg-light)] rounded-lg mb-4"></div>
                  <div className="h-6 w-3/4 bg-[var(--bg-light)] rounded mb-2"></div>
                  <div className="h-4 w-full bg-[var(--bg-light)] rounded"></div>
                </CardHeader>
                <CardContent>
                  <div style={{
                    gap: 'var(--space-3)',
                    marginBottom: 'var(--card-spacing)'
                  }} className="flex flex-col">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-4 w-full bg-[var(--bg-light)] rounded"></div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 w-full bg-[var(--bg-light)] rounded-full"></div>
                    <div className="h-10 w-full bg-[var(--bg-light)] rounded-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid-dana grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            {monasteries.map((monastery) => (
              <Card key={monastery.id} className="card-dana group overflow-hidden fade-in">
                <CardHeader style={{padding: 'var(--card-padding)'}}>
                  <div className="w-full h-24 sm:h-32 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-lg mb-4 flex items-center justify-center float">
                    <span className="text-4xl transform transition-transform group-hover:scale-110">🏛️</span>
                  </div>
                  
                  <CardTitle className="text-[var(--text-dark)] group-hover:text-[var(--primary-color)] transition-colors">
                    {monastery.name}
                  </CardTitle>
                  {monastery.description && (
                    <CardDescription className="text-[var(--text-light)]">
                      {monastery.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3 mb-6 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-start text-xs sm:text-sm text-[var(--text-light)]">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-[var(--primary-color)]" />
                      <span>{monastery.address}</span>
                    </div>

                    {monastery.phone && (
                      <div className="flex items-center text-sm text-[var(--text-light)]">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-[var(--primary-color)]" />
                        <span>{monastery.phone}</span>
                      </div>
                    )}

                    {monastery.email && (
                      <div className="flex items-center text-sm text-[var(--text-light)]">
                        <Mail className="w-4 h-4 mr-2 flex-shrink-0 text-[var(--primary-color)]" />
                        <span>{monastery.email}</span>
                      </div>
                    )}

                    {monastery.website && (
                      <div className="flex items-center text-sm text-[var(--text-light)]">
                        <Globe className="w-4 h-4 mr-2 flex-shrink-0 text-[var(--primary-color)]" />
                        <a
                          href={monastery.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--primary-color)] hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between" style={{
                      paddingTop: 'var(--space-2)',
                      borderTop: '1px solid var(--border)',
                      marginTop: 'var(--space-4)'
                    }}>
                      <Badge
                        variant={monastery.status === 'approved' ? 'default' : 'secondary'}
                        className={monastery.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {monastery.status}
                      </Badge>
                      
                      <div className="flex items-center text-sm text-[var(--text-light)]">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{monastery.capacity || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 transform transition-all duration-300 group-hover:translate-y-0 translate-y-2"
                       style={{marginTop: 'var(--card-spacing)'}}>
                    <Link href={`/donate?monastery=${monastery.id}`}>
                      <Button className="w-full btn-dana btn-dana-primary">
                        <span className="relative z-10">Donate Food</span>
                      </Button>
                    </Link>
                    
                    <Button variant="outline" className="w-full btn-dana btn-dana-secondary group">
                      <span className="relative z-10">View Details</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && monasteries.length === 0 && (
          <div className="text-center section-dana-sm fade-in px-4 sm:px-6">
            <div className="text-4xl sm:text-6xl mb-4 float">🏛️</div>
            <h3 className="text-lg sm:text-xl font-semibold text-[var(--text-dark)] mb-2 fade-in-1">
              No Monasteries Found
            </h3>
            <p className="text-[var(--text-light)] mb-6 fade-in-2">
              There are currently no monasteries available in your area.
            </p>
            <Button className="btn-dana btn-dana-secondary fade-in-3">
              <span className="relative z-10">Request New Monastery</span>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
