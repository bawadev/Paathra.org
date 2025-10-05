'use client'

import { useAuthStore } from '@/lib/stores/useAuthStore'
import { Navigation } from '@/components/organisms/Navigation'
import { Footer } from '@/components/organisms/Footer/Footer'
import { ContentSlider } from '@/components/content-slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/src/i18n/navigation'
import { ArrowRight, Heart, MapPin, Calendar, Users, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const { user, profile, loading } = useAuthStore()
  const t = useTranslations('HomePage')
  const tCommon = useTranslations('Common')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50/30 via-accent-50/20 to-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">{tCommon('loading')}</div>
        </div>
      </div>
    )
  }

  // Show public landing page for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-accent-50/20 to-neutral-50">
        <Navigation />

        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center px-5 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="space-y-8 z-10">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                  <span className="block fade-in-1">{t('publicHero.title1')}</span>
                  <span className="block bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] bg-clip-text text-transparent fade-in-2">
                    {t('publicHero.title2')}
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed fade-in-3">
                  {t('publicHero.description')}
                </p>
                <div className="flex flex-wrap gap-4 fade-in-4">
                  <Link href="/monasteries">
                    <Button className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] hover:from-[#C69564] hover:to-[#DA7B5F] text-white font-semibold px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg">
                      {t('publicHero.browseMonasteries')}
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/auth">
                    <Button variant="outline" className="border-[#D4A574]/40 text-[#C69564] hover:bg-[#D4A574]/10 px-8 py-6 rounded-xl text-lg">
                      {t('publicHero.signIn')}
                    </Button>
                  </Link>
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

        {/* Stats Section */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] bg-clip-text text-transparent mb-2">
                  1,247
                </div>
                <div className="text-gray-600 text-lg">{t('stats.mealsDonated')}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] bg-clip-text text-transparent mb-2">
                  89
                </div>
                <div className="text-gray-600 text-lg">{t('stats.activeMonasteries')}</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] bg-clip-text text-transparent mb-2">
                  5,692
                </div>
                <div className="text-gray-600 text-lg">{t('stats.donors')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('features.title')}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('features.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <Card className="border-none shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-2xl flex items-center justify-center mb-4">
                    <MapPin className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{t('features.findMonasteries.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {t('features.findMonasteries.description')}
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="border-none shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-2xl flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{t('features.easyBooking.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {t('features.easyBooking.description')}
                  </CardDescription>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="border-none shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-16 h-16 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{t('features.trackImpact.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {t('features.trackImpact.description')}
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 bg-white/50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('howItWorks.title')}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('howItWorks.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('howItWorks.step1.title')}</h3>
                <p className="text-gray-600">{t('howItWorks.step1.description')}</p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('howItWorks.step2.title')}</h3>
                <p className="text-gray-600">{t('howItWorks.step2.description')}</p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('howItWorks.step3.title')}</h3>
                <p className="text-gray-600">{t('howItWorks.step3.description')}</p>
              </div>

              {/* Step 4 */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('howItWorks.step4.title')}</h3>
                <p className="text-gray-600">{t('howItWorks.step4.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Browse Monasteries CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] border-none shadow-2xl">
              <CardContent className="p-12 text-center">
                <h2 className="text-4xl font-bold text-white mb-4">{t('browseCTA.title')}</h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  {t('browseCTA.description')}
                </p>
                <Link href="/monasteries">
                  <Button className="bg-white text-[#D4A574] hover:bg-gray-100 px-8 py-6 rounded-xl text-lg font-semibold shadow-lg">
                    {t('browseCTA.button')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-white/50 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('whyChoose.title')}</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('whyChoose.description')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Benefit 1 */}
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-[#D4A574] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('whyChoose.verified.title')}</h3>
                  <p className="text-gray-600">{t('whyChoose.verified.description')}</p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-[#D4A574] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('whyChoose.transparent.title')}</h3>
                  <p className="text-gray-600">{t('whyChoose.transparent.description')}</p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-[#D4A574] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('whyChoose.flexible.title')}</h3>
                  <p className="text-gray-600">{t('whyChoose.flexible.description')}</p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-[#D4A574] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('whyChoose.community.title')}</h3>
                  <p className="text-gray-600">{t('whyChoose.community.description')}</p>
                </div>
              </div>

              {/* Benefit 5 */}
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-[#D4A574] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('whyChoose.realtime.title')}</h3>
                  <p className="text-gray-600">{t('whyChoose.realtime.description')}</p>
                </div>
              </div>

              {/* Benefit 6 */}
              <div className="flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-[#D4A574] flex-shrink-0" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{t('whyChoose.support.title')}</h3>
                  <p className="text-gray-600">{t('whyChoose.support.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/30 via-accent-50/20 to-neutral-50">
      <Navigation />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-5">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
                <span className="block fade-in-1">{t('heroTitle1')}</span>
                <span className="block bg-gradient-to-r from-[#D4A574] to-[#EA8B6F] bg-clip-text text-transparent fade-in-2">{t('heroTitle2')}</span>
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
                <Button variant="outline" className="border-[#D4A574]/40 text-[#C69564] hover:bg-[#D4A574]/10 px-6 py-3 rounded-xl">
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
              <div className="w-12 h-12 bg-gradient-to-br from-[#D4A574] to-[#EA8B6F] rounded-full flex items-center justify-center">
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
              <div className="bg-gradient-to-br from-compassion-50 to-compassion-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2 text-compassion-800">1,247</div>
                <div className="text-compassion-700">{t('mealsDonated')}</div>
              </div>
              <div className="bg-gradient-to-br from-trust-50 to-trust-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2 text-trust-800">89</div>
                <div className="text-trust-700">{t('monasteriesSupported')}</div>
              </div>
              <div className="bg-gradient-to-br from-spiritual-50 to-spiritual-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold mb-2 text-spiritual-800">5,692</div>
                <div className="text-spiritual-700">{t('happyDonors')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
