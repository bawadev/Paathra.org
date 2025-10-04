'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'

export function Footer() {
  const tNav = useTranslations('Navigation')
  const t = useTranslations('Footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-t border-amber-100 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="/images/paathra-logo-icon.png"
                  alt="Paathra"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-primary">{tNav('brand')}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-primary" />
              <span>{t('madeWithCompassion')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/monasteries" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('findMonasteries')}
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('makeDonation')}
                </Link>
              </li>
              <li>
                <Link href="/my-donations" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('myDonations')}
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('profile')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Monasteries */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('forMonasteries')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/manage" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('monasteryDashboard')}
                </Link>
              </li>
              <li>
                <Link href="/manage/monastery" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('registerMonastery')}
                </Link>
              </li>
              <li>
                <Link href="/manage/bookings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('manageBookings')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('contact')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <a href={`mailto:${t('email')}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('email')}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {t('phone')}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {t('location')}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-amber-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              {t('copyright', { year: currentYear })}
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
