'use client'

import { useAuthStore } from '@/lib/stores/useAuthStore'
import { AuthForm } from '@/components/auth-form'
import { Navigation } from '@/components/organisms/Navigation'
import { ContentSlider } from '@/components/content-slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/src/i18n/navigation'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const { user, profile, loading } = useAuthStore()
  const t = useTranslations('HomePage')
  const tCommon = useTranslations('Common')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-light)]">
        <div className="text-lg text-[var(--text-light)]">{tCommon('loading')}</div>
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
                <span className="block gradient-text fade-in-1">{t('heroTitle1')}</span>
                <span className="block gradient-text fade-in-2">{t('heroTitle2')}</span>
              </h1>
              <p className="text-xl text-[var(--text-light)] leading-relaxed fade-in-3">
                {t('heroDescription')}
              </p>
              <div className="flex flex-wrap gap-4 fade-in-4">
                <Link href="/monasteries">
                  <Button className="btn-dana-primary large inline-flex items-center gap-2 text-white">
                    {t('startDonating')}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" className="btn-dana-secondary large">
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
      <main className="container-dana px-5 pb-20">
        {/* Quick Actions */}
        

        {/* Content Slider */}
        <ContentSlider />

        {/* Welcome Message */}
        <Card className="card-dana gradient-primary text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3">
              <span>🙏</span>
              {t('welcomeTitle', { name: profile?.full_name || 'Friend' })}
            </CardTitle>
            <CardDescription className="text-white/90 text-lg">
              {t('welcomeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">1,247</div>
                <div className="text-white/80">{t('mealsDonated')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">89</div>
                <div className="text-white/80">{t('monasteriesSupported')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">5,692</div>
                <div className="text-white/80">{t('happyDonors')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
