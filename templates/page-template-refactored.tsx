/**
 * Refactored Standard Page Template
 * 
 * Modernized version using the new layout components.
 * This template provides a clean foundation for new pages.
 */

'use client'

import { PageLayout, MainContent, HeroSection } from '@/components/layout/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PageTemplateProps {
  title?: string
  subtitle?: string
  showHero?: boolean
}

export default function PageTemplate({ 
  title = 'Page Title',
  subtitle = 'Page description goes here. Keep it concise and engaging.',
  showHero = true
}: PageTemplateProps = {}) {
  return (
    <PageLayout>
      {showHero && (
        <HeroSection 
          title={title}
          subtitle={subtitle}
        />
      )}
      
      <MainContent className={showHero ? '' : 'pt-20'}>
        <ContentGrid />
      </MainContent>
    </PageLayout>
  )
}

/**
 * Example content grid component
 */
function ContentGrid() {
  return (
    <div className="grid lg:grid-cols-2 gap-8">
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
  )
}

/**
 * Usage examples:
 * 
 * // Basic page
 * export default function MyPage() {
 *   return <PageTemplate title="My Page" subtitle="Welcome to my page" />
 * }
 * 
 * // Page without hero section
 * export default function SettingsPage() {
 *   return <PageTemplate title="Settings" showHero={false} />
 * }
 */