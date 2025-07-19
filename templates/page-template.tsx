/**
 * Standard Page Template
 * 
 * Use this template as a starting point for new pages in the Dhaana application.
 * This template includes:
 * - Consistent layout structure
 * - Authentication integration
 * - Design system integration
 * - Responsive design
 */

'use client'

import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TemplatePage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="text-lg text-[var(--text-light)]">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-5">
        <div className="container-dana">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="gradient-text fade-in-1">Page Title</span>
            </h1>
            <p className="text-xl text-[var(--text-light)] max-w-2xl mx-auto fade-in-2">
              Page description goes here. Keep it concise and engaging.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-5">
        <div className="container-dana">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Example Content Cards */}
            <Card className="card-dana fade-in-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-white text-sm font-bold">1</span>
                  </div>
                  Feature Title
                </CardTitle>
                <CardDescription>
                  Brief description of this feature or section.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-light)] mb-4">
                  Detailed explanation of the feature or content. Use the design system
                  color variables for consistent styling.
                </p>
                <Button className="btn-dana-primary">
                  Action Button
                </Button>
              </CardContent>
            </Card>

            <Card className="card-dana fade-in-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-white text-sm font-bold">2</span>
                  </div>
                  Another Feature
                </CardTitle>
                <CardDescription>
                  Another brief description.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--text-light)] mb-4">
                  More detailed content. Remember to use semantic HTML and
                  accessibility best practices.
                </p>
                <Button variant="outline" className="btn-dana-outline">
                  Secondary Action
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
