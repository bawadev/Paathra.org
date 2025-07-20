'use client'

import { useAuth } from '@/lib/auth-context'
import { AuthForm } from '@/components/auth-form'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Calendar, Heart, Users, Building, ArrowRight } from 'lucide-react'
import { hasRole } from '@/types/auth'

export default function HomePage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="text-lg text-[var(--text-light)]">Loading...</div>
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
      <section className="pt-32 pb-20 px-5 min-h-screen flex items-center">
        <div className="container-dana">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block gradient-text fade-in-1">Nourish</span>
                <span className="block gradient-text fade-in-2">Compassion</span>
              </h1>
              <p className="text-xl text-[var(--text-light)] leading-relaxed fade-in-3">
                Support Buddhist monasteries through food donations and help sustain their spiritual practice
              </p>
              <div className="flex flex-wrap gap-4 fade-in-4">
                <Link href="/monasteries">
                  <Button className="btn-dana-primary large inline-flex items-center gap-2 text-white">
                    Start Donating
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" className="btn-dana-secondary large">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex justify-center items-center relative">
              <div className="floating-bowl"></div>
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container-dana px-5 pb-20">
        {/* Quick Actions */}
        <div className={`grid ${hasRole(profile, 'monastery_admin') ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-6 mb-12`}>
          <Card className="card-dana text-center group">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-[var(--text-dark)]">Make a Donation</CardTitle>
              <CardDescription className="text-[var(--text-light)]">
                Browse available time slots and book your food donation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/monasteries">
                <Button className="w-full btn-dana-primary">Book Donation</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-dana text-center group">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--secondary-color)] to-[var(--primary-color)] rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-[var(--text-dark)]">My Donations</CardTitle>
              <CardDescription className="text-[var(--text-light)]">
                View your donation history and upcoming bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/my-donations">
                <Button variant="outline" className="w-full btn-dana-secondary">View History</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-dana text-center group">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--accent-color)] to-[var(--primary-color)] rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Building className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-[var(--text-dark)]">Monasteries</CardTitle>
              <CardDescription className="text-[var(--text-light)]">
                Explore monasteries and learn about their communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/monasteries">
                <Button variant="outline" className="w-full btn-dana-secondary">Explore</Button>
              </Link>
            </CardContent>
          </Card>

          {hasRole(profile, 'monastery_admin') && (
            <Card className="card-dana text-center group">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-[var(--text-dark)]">Manage Monastery</CardTitle>
                <CardDescription className="text-[var(--text-light)]">
                  Manage your monastery's donation slots and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/manage">
                  <Button className="w-full btn-dana-primary">Manage</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {!hasRole(profile, 'monastery_admin') && (
            <Card className="card-dana text-center group">
              <CardHeader>
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-[var(--text-light)] to-[var(--text-dark)] rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-[var(--text-dark)]">Join Community</CardTitle>
                <CardDescription className="text-[var(--text-light)]">
                  Connect with other donors and share experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full btn-dana-secondary">Coming Soon</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Welcome Message */}
        <Card className="card-dana gradient-primary text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <span>🙏</span>
              Welcome to Dana, {profile?.full_name || 'Friend'}!
            </CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Your journey of compassion starts here. Every donation you make helps sustain spiritual communities and their practice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">1,247</div>
                <div className="text-white/80">Meals Donated</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">89</div>
                <div className="text-white/80">Monasteries Supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">5,692</div>
                <div className="text-white/80">Happy Donors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
