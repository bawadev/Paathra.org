'use client'

import { useAuth } from '@/lib/auth-context'
import { AuthForm } from '@/components/auth-form'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Heart, Users, Building } from 'lucide-react'
import { hasRole } from '@/types/auth'

export default function HomePage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-orange-600">Dhaana</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with monasteries and make meaningful food donations. 
            Schedule your contributions and support spiritual communities.
          </p>
        </div>

        {/* Quick Actions */}
        <div className={`grid ${hasRole(profile, 'monastery_admin') ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-6 mb-12`}>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Make a Donation</CardTitle>
              <CardDescription>
                Browse available time slots and book your food donation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/donate">Start Donating</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>View Monasteries</CardTitle>
              <CardDescription>
                Explore monasteries in your area and learn about their needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/monasteries">Browse Monasteries</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>My Donations</CardTitle>
              <CardDescription>
                Track your donation history and upcoming bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/my-donations">View My Donations</Link>
              </Button>
            </CardContent>
          </Card>

          {!hasRole(profile, 'monastery_admin') && (
            <Card className="text-center hover:shadow-lg transition-shadow border-blue-200">
              <CardHeader>
                <Building className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-blue-800">Create Monastery</CardTitle>
                <CardDescription>
                  Register your monastery and start receiving donations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" asChild className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Link href="/manage/monastery">Register Monastery</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-8">How Dhaana Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Choose a Monastery</h3>
              <p className="text-gray-600">Browse local monasteries and their specific needs</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Book a Time Slot</h3>
              <p className="text-gray-600">Select an available donation time that works for you</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Make Your Donation</h3>
              <p className="text-gray-600">Prepare and deliver your food donation at the scheduled time</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
