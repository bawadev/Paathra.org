/**
 * Enhanced Dana Design System - Usage Example
 * Demonstrates how to use the design system components
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { ThemeProvider, useTheme } from '@/lib/design-system/theme'
import { createCulturalContext } from '@/lib/design-system/cultural'

// Example component demonstrating design system usage
function DesignSystemExample() {
  const { mode, cultural, context } = useTheme()

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Enhanced Dana Design System Demo</h1>

      {/* Theme Information */}
      <Card variant="outlined" size="default">
        <CardHeader>
          <h2 className="text-xl font-semibold">Current Theme</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Mode:</strong> {mode}</p>
            <p><strong>Cultural:</strong> {cultural}</p>
            <p><strong>Context:</strong> {context}</p>
          </div>
        </CardContent>
      </Card>

      {/* Button Variants Demo */}
      <Card variant="default" size="lg">
        <CardHeader>
          <h2 className="text-xl font-semibold">Button Variants</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button variant="default">Default</Button>
            <Button variant="spiritual">Spiritual</Button>
            <Button variant="trust">Trust</Button>
            <Button variant="donate" size="lg">Donate</Button>
            <Button variant="monastery">Monastery</Button>
            <Button variant="peaceful">Peaceful</Button>
          </div>
        </CardContent>
      </Card>

      {/* Cultural Variants Demo */}
      <Card variant="cultural" cultural="sinhala">
        <CardHeader>
          <h2 className="text-xl font-semibold">Cultural Variants</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button variant="sinhala" cultural="sinhala" size="lg">
              සිංහල බොත්තම
            </Button>
            <Button variant="cultural" cultural="english">
              English Button
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Context-specific Demo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donation Context */}
        <Card variant="donation" context="donation">
          <CardHeader>
            <h3 className="text-lg font-medium">Donation Context</h3>
          </CardHeader>
          <CardContent>
            <p>This card uses donation context with trust-building colors.</p>
          </CardContent>
          <CardFooter>
            <Button variant="donate" context="donation">
              Make Donation
            </Button>
          </CardFooter>
        </Card>

        {/* Spiritual Context */}
        <Card variant="spiritual" context="spiritual">
          <CardHeader>
            <h3 className="text-lg font-medium">Spiritual Context</h3>
          </CardHeader>
          <CardContent>
            <p>This card uses spiritual context with peaceful colors.</p>
          </CardContent>
          <CardFooter>
            <Button variant="spiritual" context="spiritual">
              Learn More
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Monastery Context */}
      <Card variant="monastery" context="monastery" size="lg">
        <CardHeader>
          <h2 className="text-xl font-semibold">Monastery Management</h2>
        </CardHeader>
        <CardContent>
          <p>This card demonstrates monastery context with warm, welcoming colors suitable for monastery administration.</p>
        </CardContent>
        <CardFooter justify="between">
          <Button variant="monastery" context="monastery">
            Manage Monastery
          </Button>
          <Button variant="peaceful" context="monastery">
            View Details
          </Button>
        </CardFooter>
      </Card>

      {/* Lotus-inspired Design */}
      <Card variant="lotus" size="xl" animation="enhanced">
        <CardHeader>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-spiritual-600 to-primary-600 bg-clip-text text-transparent">
            Lotus-Inspired Design
          </h2>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            This card showcases the lotus-inspired design elements with peaceful gradients
            and meditation-inspired animations that reflect Buddhist aesthetic principles.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="lotus" size="lg" animation="enhanced">
            Experience Serenity
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Example with cultural context
function SinhalaExample() {
  const culturalContext = createCulturalContext('si', { density: 'comfortable' })

  return (
    <div className={culturalContext.classes}>
      <Card variant="sinhala" cultural="sinhala" size="lg">
        <CardHeader spacing="relaxed">
          <h2 className="text-2xl font-bold font-sinhala">සිංහල සැලසුම</h2>
        </CardHeader>
        <CardContent spacing="relaxed">
          <p className="font-sinhala text-lg leading-loose">
            මෙම කාඩ්පත සිංහල භාෂාව සඳහා ප්‍රශස්ත කරන ලද සැලසුම් පෙන්වයි.
            වැඩි පේළි පරතරය සහ සුදුසු අකුරු ප්‍රමාණය සමඟ වඩා හොඳ කියවීමේ අත්දැකීමක් ලබා දේ.
          </p>
        </CardContent>
        <CardFooter spacing="relaxed">
          <Button variant="sinhala" cultural="sinhala" size="lg">
            වැඩිදුර කියවන්න
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

// Main demo component with theme provider
function DesignSystemDemo() {
  return (
    <ThemeProvider defaultCultural="universal" defaultContext="general">
      <div className="min-h-screen bg-background">
        <DesignSystemExample />
        <div className="mt-16">
          <SinhalaExample />
        </div>
      </div>
    </ThemeProvider>
  )
}

export default DesignSystemDemo
export { DesignSystemExample, SinhalaExample }