'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/organisms/Navigation'
import { usePageTransition, useFormSubmission } from '@/components/ui/global-loading-overlay'
import { useOperationLoading } from '@/lib/loading-system'
import { LoadingLink } from '@/components/ui/loading-link'

export default function LoadingDemoPage() {
  const [items, setItems] = useState<string[]>([])
  const { } = usePageTransition()
  const { startSubmission, completeSubmission } = useFormSubmission()
  const { executeWithLoading } = useOperationLoading('data-loading')

  const simulateFormSubmission = async () => {
    startSubmission('Processing your request...')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    completeSubmission()
    alert('Form submitted successfully!')
  }

  const simulateDataLoading = async () => {
    await executeWithLoading(async () => {
      // Simulate fetching data
      await new Promise(resolve => setTimeout(resolve, 3000))
      setItems(['Item 1', 'Item 2', 'Item 3'])
    }, 'Loading data...')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-light)]">
      <Navigation />
      
      <section className="pt-32 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold">
              <span className="gradient-text">Loading System Demo</span>
            </h1>
            <p className="text-xl text-[var(--text-light)] max-w-3xl mx-auto">
              Test the circular loading overlay that appears during page transitions, form submissions, and data loading.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Page Transitions */}
            <Card className="dana-card">
              <CardHeader>
                <CardTitle>Page Transitions</CardTitle>
                <CardDescription>
                  Navigate to different pages to see the loading overlay during transitions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <LoadingLink 
                  href="/my-donations" 
                  loadingLabel="Loading your donations..."
                  className="block"
                >
                  <Button className="w-full dana-button dana-button-primary">
                    Go to My Donations
                  </Button>
                </LoadingLink>
                
                <LoadingLink 
                  href="/monasteries" 
                  loadingLabel="Loading monasteries..."
                  className="block"
                >
                  <Button className="w-full dana-button dana-button-secondary">
                    Go to Monasteries
                  </Button>
                </LoadingLink>
                
                <LoadingLink 
                  href="/donate" 
                  loadingLabel="Loading donation page..."
                  className="block"
                >
                  <Button className="w-full" variant="outline">
                    Go to Donate
                  </Button>
                </LoadingLink>
              </CardContent>
            </Card>

            {/* Form Submissions */}
            <Card className="dana-card">
              <CardHeader>
                <CardTitle>Form Submissions</CardTitle>
                <CardDescription>
                  Click to simulate form submissions with loading states
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={simulateFormSubmission}
                  className="w-full dana-button dana-button-primary"
                >
                  Submit Form (2s delay)
                </Button>
                
                <Button 
                  onClick={simulateDataLoading}
                  className="w-full dana-button dana-button-secondary"
                >
                  Load Data (3s delay)
                </Button>
                
                {items.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Loaded Items:</h4>
                    <ul className="list-disc list-inside text-green-700">
                      {items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features List */}
          <Card className="dana-card mt-8">
            <CardHeader>
              <CardTitle>Loading System Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-[var(--text-dark)] mb-3">Visual Design</h4>
                  <ul className="space-y-2 text-[var(--text-light)]">
                    <li>• Transparent circular panel with glass morphism effect</li>
                    <li>• Smooth fade-in/out animations</li>
                    <li>• Pulse animation for active loading states</li>
                    <li>• Animated spinner with rotating ring</li>
                    <li>• Contextual loading messages</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-[var(--text-dark)] mb-3">Functionality</h4>
                  <ul className="space-y-2 text-[var(--text-light)]">
                    <li>• Global overlay that appears during any loading operation</li>
                    <li>• Automatic detection of page transitions</li>
                    <li>• Form submission loading states</li>
                    <li>• Data fetching indicators</li>
                    <li>• Prevents flickering with smart timing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
