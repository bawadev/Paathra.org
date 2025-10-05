import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { MapPin, Phone, Mail, Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTranslations } from 'next-intl/server'

interface MonasteryPortfolioPageProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

export async function generateMetadata({ params }: MonasteryPortfolioPageProps): Promise<Metadata> {
  const t = await getTranslations('monastery')
  const { id } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: monastery } = await supabase
    .from('monasteries')
    .select('name, portfolio_description, background_image_url')
    .eq('id', id)
    .single()

  if (!monastery) {
    return {
      title: t('notFound'),
    }
  }

  return {
    title: `${monastery.name} - ${t('portfolio')}`,
    description: monastery.portfolio_description || monastery.name,
    openGraph: {
      title: `${monastery.name} - ${t('portfolio')}`,
      description: monastery.portfolio_description || monastery.name,
      images: [monastery.background_image_url || ''],
    },
  }
}

export default async function MonasteryPortfolioPage({ params }: MonasteryPortfolioPageProps) {
  const t = await getTranslations('monastery')
  const { id } = await params
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: monastery } = await supabase
    .from('monasteries')
    .select(`
      *,
      user_profiles!admin_id(
        full_name,
        email,
        phone
      )
    `)
    .eq('id', id)
    .single()

  if (!monastery) {
    notFound()
  }

  const galleryImages: string[] = monastery.gallery_images || []
  const socialMedia: { [key: string]: string } = monastery.social_media || {}
  const facilities: string[] = monastery.facilities || []
  const dailySchedule: { [key: string]: string } = monastery.daily_schedule || {}


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-96">
        {monastery.background_image_url ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${monastery.background_image_url})`,
              }}
            />
            {/* Single gradient overlay with proper z-index */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 z-10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500" />
        )}
        {/* Content container with higher z-index */}
        <div className="relative z-20 flex h-full items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-4">{monastery.name}</h1>
            {monastery.tradition && (
              <p className="text-xl text-orange-200 mb-2">{monastery.tradition}</p>
            )}
            {monastery.established_year && (
              <p className="text-lg text-gray-300">
                {t('established')} {monastery.established_year}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle>{t('aboutMonastery')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-line">
                  {monastery.portfolio_description || monastery.description || t('noDescription')}
                </p>
              </CardContent>
            </Card>

            {/* Gallery Section */}
            {galleryImages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('gallery')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImages.map((imageUrl: string, index: number) => (
                      <div key={index} className="aspect-square relative rounded-lg overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`${monastery.name} - ${index + 1}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-200"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Daily Schedule */}
            {Object.keys(dailySchedule).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('dailySchedule')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dailySchedule.morning && (
                      <div>
                        <h4 className="font-semibold text-foreground">{t('morning')}</h4>
                        <p className="text-muted-foreground">{dailySchedule.morning}</p>
                      </div>
                    )}
                    {dailySchedule.afternoon && (
                      <div>
                        <h4 className="font-semibold text-foreground">{t('afternoon')}</h4>
                        <p className="text-muted-foreground">{dailySchedule.afternoon}</p>
                      </div>
                    )}
                    {dailySchedule.evening && (
                      <div>
                        <h4 className="font-semibold text-foreground">{t('evening')}</h4>
                        <p className="text-muted-foreground">{dailySchedule.evening}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rules & Guidelines */}
            {monastery.rules_guidelines && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('rulesGuidelines')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-foreground whitespace-pre-line">{monastery.rules_guidelines}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Monastery Logo/Avatar */}
            {monastery.avatar_url && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('monasteryLogo')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square relative rounded-lg overflow-hidden">
                    <Image
                      src={monastery.avatar_url}
                      alt={`${monastery.name} logo`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contact')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{t('address')}</p>
                    <p className="text-sm text-muted-foreground">{monastery.address}</p>
                    {monastery.latitude && monastery.longitude && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Coordinates: {monastery.latitude.toFixed(6)}, {monastery.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                {monastery.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <a href={`tel:${monastery.phone}`} className="text-sm text-trust-600 hover:text-trust-700 hover:underline">
                      {monastery.phone}
                    </a>
                  </div>
                )}

                {monastery.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <a href={`mailto:${monastery.email}`} className="text-sm text-trust-600 hover:text-trust-700 hover:underline">
                      {monastery.email}
                    </a>
                  </div>
                )}

                {monastery.website && (
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <a href={monastery.website} target="_blank" rel="noopener noreferrer" className="text-sm text-trust-600 hover:text-trust-700 hover:underline">
                      {monastery.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>{t('quickStats')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {monastery.monk_count && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('monks')}</span>
                    <span className="font-semibold">{monastery.monk_count}</span>
                  </div>
                )}
                {monastery.capacity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('capacity')}</span>
                    <span className="font-semibold">{monastery.capacity}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Facilities */}
            {facilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('facilities')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((facility: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Social Media */}
            {Object.keys(socialMedia).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('socialMedia')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    {socialMedia.facebook && (
                      <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-trust-700">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </a>
                    )}
                    {socialMedia.twitter && (
                      <a href={socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-trust-700">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </a>
                    )}
                    {socialMedia.instagram && (
                      <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent-600">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact Person */}
            {monastery.contact_person_name && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('contactPerson')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{monastery.contact_person_name}</p>
                  {monastery.contact_person_role && (
                    <p className="text-sm text-muted-foreground">{monastery.contact_person_role}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                {t('bookDonation')}
              </Button>
              <Button variant="outline" className="w-full">
                {t('viewSlots')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}