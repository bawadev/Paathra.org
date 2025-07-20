'use client'

import { useEffect, useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AdminTest() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--bg-light)]">
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      <main className="pt-32 pb-20 px-5">
        <div className="container-dana">
          <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Test Page</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Test Card 1</CardTitle>
            <CardDescription>Testing basic card component</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card should render correctly</p>
            <Badge className="mt-2">Working</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Card 2</CardTitle>
            <CardDescription>Testing components</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Test Button</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Testing admin functionality</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Admin components are working!</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Component Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Card Component</span>
              <Badge variant="default">✓ Working</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Button Component</span>
              <Badge variant="default">✓ Working</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Badge Component</span>
              <Badge variant="default">✓ Working</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
