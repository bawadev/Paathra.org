/**
 * Enhanced Page Template - v2.0
 * 
 * This template demonstrates the new refactoring improvements:
 * - Enhanced error handling with ErrorProvider
 * - Loading states with LoadingProvider
 * - Better component composition
 * - Improved type safety
 */

'use client'

import { useState, useEffect } from 'react'
import { PageLayout, MainContent, HeroSection } from '@/components/layout/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/lib/component-composition'
import { Button } from '@/components/ui/button'
import { LoadingSpinner, useOperationLoading, ProgressBar } from '@/lib/loading-system'
import { useError, useAsyncError } from '@/lib/error-management'
import { useAsyncState, usePagination, useToggle } from '@/lib/component-composition'
import { AlertCircle, CheckCircle, Settings, Users, Heart } from 'lucide-react'

interface EnhancedPageProps {
  title?: string
  subtitle?: string
  showDemo?: boolean
}

export default function EnhancedPageTemplate({ 
  title = 'Enhanced Page Template',
  subtitle = 'Demonstrating the new refactoring improvements',
  showDemo = true
}: EnhancedPageProps) {
  // Enhanced hooks usage
  const { reportError } = useError()
  const executeAsync = useAsyncError()
  const { data, loading, error, execute, reset } = useAsyncState<any[]>()
  const pagination = usePagination(1, 6, 24) // 24 total items, 6 per page
  const [demoMode, toggleDemoMode] = useToggle(false, 'enhanced-page-demo-mode')
  
  // Operation loading states
  const dataOperation = useOperationLoading('fetch-data')
  const saveOperation = useOperationLoading('save-data')

  // Simulate data fetching
  const fetchData = async () => {
    await execute(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (Math.random() > 0.8) {
        throw new Error('Simulated network error')
      }
      
      return Array.from({ length: 24 }, (_, i) => ({
        id: i + 1,
        title: `Item ${i + 1}`,
        description: `Description for item ${i + 1}`,
        status: Math.random() > 0.5 ? 'active' : 'inactive'
      }))
    })
  }

  // Simulate save operation with progress
  const saveData = async () => {
    await saveOperation.executeWithLoading(async () => {
      for (let i = 0; i <= 100; i += 10) {
        saveOperation.updateProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      if (Math.random() > 0.7) {
        throw new Error('Failed to save data')
      }
      
      return { success: true }
    }, 'Saving data...')
  }

  // Simulate error scenario
  const triggerError = () => {
    reportError(new Error('This is a demonstration error'), {
      page: 'enhanced-template',
      action: 'demo-error',
      timestamp: new Date().toISOString()
    })
  }

  useEffect(() => {
    if (showDemo) {
      fetchData()
    }
  }, [showDemo])

  // Current page data
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize
  const currentPageData = data?.slice(startIndex, startIndex + pagination.pageSize) || []

  return (
    <PageLayout loading={false}>
      <HeroSection 
        title={title}
        subtitle={subtitle}
        icon={<Settings className="w-8 h-8 text-primary" />}
      />

      <MainContent>
        {/* Demo Controls */}
        {showDemo && (
          <Card variant="glass" className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Demo Controls
              </CardTitle>
              <CardDescription>
                Test the enhanced error handling, loading states, and component composition
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={fetchData} 
                  disabled={loading}
                  className="btn-dana-primary"
                >
                  {loading ? <LoadingSpinner size="sm" /> : 'Fetch Data'}
                </Button>
                <Button 
                  onClick={saveData}
                  disabled={saveOperation.isLoading}
                  variant="outline"
                >
                  {saveOperation.isLoading ? <LoadingSpinner size="sm" /> : 'Save Data'}
                </Button>
                <Button 
                  onClick={triggerError}
                  variant="destructive"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Trigger Error
                </Button>
                <Button 
                  onClick={toggleDemoMode}
                  variant={demoMode ? "default" : "outline"}
                >
                  Demo Mode: {demoMode ? 'ON' : 'OFF'}
                </Button>
              </div>

              {/* Save Progress Bar */}
              {saveOperation.isLoading && (
                <div className="mt-4">
                  <ProgressBar 
                    progress={pagination.currentPage * 10} // Mock progress
                    label="Saving progress"
                    variant="gradient"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card variant="bordered" className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Error Loading Data</p>
                <p className="text-sm text-red-600">{error.message}</p>
              </div>
              <Button onClick={reset} size="sm" variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner variant="lotus" size="lg" label="Loading your data..." />
          </div>
        )}

        {/* Data Grid */}
        {data && !loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {currentPageData.map((item: any) => (
                <Card 
                  key={item.id} 
                  variant={demoMode ? "elevated" : "default"}
                  interactive={demoMode}
                  className="transition-all duration-200"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {item.title}
                      {item.status === 'active' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Status: {item.status}</span>
                    </div>
                  </CardContent>
                  {demoMode && (
                    <CardFooter>
                      <Button size="sm" className="w-full">
                        <Heart className="w-4 h-4 mr-2" />
                        Action
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <Card>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(startIndex + pagination.pageSize, data.length)} of {data.length} items
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={pagination.previousPage}
                    disabled={!pagination.hasPrevious}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button 
                    onClick={pagination.nextPage}
                    disabled={!pagination.hasNext}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!data && !loading && !error && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-sm mx-auto">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground mb-4">
                  Click "Fetch Data" to load some sample data and see the enhanced features in action.
                </p>
                <Button onClick={fetchData} className="btn-dana-primary">
                  Get Started
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Showcase */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Error Handling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Centralized error management with user-friendly notifications and detailed logging.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Loading States
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Consistent loading patterns with progress indicators and skeleton loaders.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" />
                Composition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Enhanced component patterns with compound components and custom hooks.
              </p>
            </CardContent>
          </Card>
        </div>
      </MainContent>
    </PageLayout>
  )
}

/**
 * Usage Examples:
 * 
 * // Basic usage
 * <EnhancedPageTemplate />
 * 
 * // Custom configuration
 * <EnhancedPageTemplate
 *   title="My Custom Page"
 *   subtitle="With enhanced features"
 *   showDemo={false}
 * />
 * 
 * // As a reference for building new pages
 * // Copy and modify this template for your specific needs
 */
