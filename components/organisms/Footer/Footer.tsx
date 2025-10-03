'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Heart, Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'

export function Footer() {
  const t = useTranslations('Navigation')
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
              <span className="text-xl font-bold text-primary">{t('brand')}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connect donors with monasteries for meaningful food donations and support Buddhist spiritual practice.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-primary" />
              <span>Made with compassion</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/monasteries" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Find Monasteries
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Make a Donation
                </Link>
              </li>
              <li>
                <Link href="/my-donations" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  My Donations
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* For Monasteries */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">For Monasteries</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/manage" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Monastery Dashboard
                </Link>
              </li>
              <li>
                <Link href="/manage/monastery" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Register Monastery
                </Link>
              </li>
              <li>
                <Link href="/manage/bookings" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Manage Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:support@paathra.org" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  support@paathra.org
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  +94 123 456 789
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Colombo, Sri Lanka
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-amber-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {currentYear} Paathra. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
