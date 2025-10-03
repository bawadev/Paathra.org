'use client'

import { useAuthStore } from '@/lib/stores/useAuthStore'
import { AuthForm } from '@/components/auth-form'
import { Navigation } from '@/components/organisms/Navigation'
import { ContentSlider } from '@/components/content-slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/src/i18n/navigation'
import { ArrowRight, Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const { user, profile, loading } = useAuthStore()
  const t = useTranslations('HomePage')
  const tCommon = useTranslations('Common')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">{tCommon('loading')}</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                <span className="block fade-in-1">{t('heroTitle1')}</span>
                <span className="block bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent fade-in-2">{t('heroTitle2')}</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed fade-in-3">
                {t('heroDescription')}
              </p>
              <div className="flex flex-wrap gap-4 fade-in-4">
                <Link href="/monasteries">
                  <Button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] hover:from-[#C69564] hover:to-[#DA7B5F] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                    {t('startDonating')}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" className="border-amber-200 text-amber-700 hover:bg-amber-50 px-6 py-3 rounded-xl">
                  {t('learnMore')}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Content Slider */}
        <ContentSlider />

        {/* Welcome Message */}
        <Card className="bg-white rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3 text-gray-900">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              {t('welcomeTitle', { name: profile?.full_name || 'Friend' })}
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              {t('welcomeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2 text-green-700">1,247</div>
                <div className="text-green-600">{t('mealsDonated')}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2 text-blue-700">89</div>
                <div className="text-blue-600">{t('monasteriesSupported')}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2 text-purple-700">5,692</div>
                <div className="text-purple-600">{t('happyDonors')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
