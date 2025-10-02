'use client'

import { Link } from '@/src/i18n/navigation'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UnifiedDropdown, DropdownPresets, createDropdownTrigger, createDropdownItems, getCulturalDropdownProps } from '@/components/ui/unified-dropdown'
import { Calendar, Users, Building, LogOut, User, Shield, BarChart3, Phone, Menu, X } from 'lucide-react'
import { hasRole, isSuperAdmin } from '@/types/auth'
import { useTranslations, useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function Navigation() {
  const { user, profile, signOut } = useAuth()
  const t = useTranslations('Navigation')
  const locale = useLocale()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) return null

  // Get cultural theming props
  const culturalProps = getCulturalDropdownProps(locale)

  // Donations dropdown configuration
  const donationsDropdownItems = createDropdownItems([
    {
      key: 'make-donation',
      icon: Calendar,
      label: t('makeDonation'),
      description: t('makeDonationDesc'),
      href: '/donate',
    },
    {
      key: 'my-donations',
      icon: User,
      label: t('myDonations'),
      description: t('myDonationsDesc'),
      href: '/my-donations',
    },
  ])

  // Monasteries dropdown configuration
  const monasteriesDropdownItems = createDropdownItems([
    {
      key: 'browse-monasteries',
      icon: Building,
      label: t('browseMonasteries'),
      description: t('browseMonasteriesDesc'),
      href: '/monasteries',
    },
  ])

  // Management dropdown configuration (for monastery admins)
  const manageDropdownItems = createDropdownItems([
    {
      key: 'upcoming-confirmations',
      icon: Calendar,
      label: t('upcomingConfirmations'),
      description: t('upcomingConfirmationsDesc'),
      href: '/monastery-admin/upcoming-bookings',
    },
    {
      key: 'bookings',
      icon: Users,
      label: t('bookings'),
      description: t('bookingsDesc'),
      href: '/manage/bookings',
    },
    {
      key: 'monastery-info',
      icon: Building,
      label: t('monasteryInfo'),
      description: t('monasteryInfoDesc'),
      href: '/manage/monastery',
    },
  ])

  // Admin dropdown configuration (for super admins)
  const adminDropdownItems = createDropdownItems([
    {
      key: 'dashboard',
      icon: BarChart3,
      label: t('dashboard'),
      description: t('dashboardDesc'),
      href: '/admin/dashboard',
    },
    {
      key: 'user-management',
      icon: Users,
      label: t('userManagement'),
      description: t('userManagementDesc'),
      href: '/admin/users',
    },
    {
      key: 'monasteries-admin',
      icon: Building,
      label: t('monasteriesAdmin'),
      description: t('monasteriesAdminDesc'),
      href: '/admin/monasteries',
    },
    {
      key: 'analytics',
      icon: BarChart3,
      label: t('analytics'),
      description: t('analyticsDesc'),
      href: '/admin/analytics',
    },
    {
      key: 'settings',
      icon: Shield,
      label: t('settings'),
      description: t('settingsDesc'),
      href: '/admin/settings',
    },
  ])

  // Profile dropdown configuration with translated labels
  const profileDropdownItems = createDropdownItems([
    {
      key: 'profile',
      icon: User,
      label: t('myProfile'),
      href: '/profile',
    },
    {
      type: 'separator',
      key: 'sep-1',
    },
    {
      key: 'signout',
      icon: LogOut,
      label: t('signOut'),
      variant: 'destructive',
      onClick: async (e: React.MouseEvent) => {
        e.preventDefault()
        await signOut()
        if (typeof window !== 'undefined') {
          window.location.href = '/'
        }
      },
    },
  ])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo - Always visible */}
          <Link href="/" className="flex items-center gap-2 md:gap-4 text-lg md:text-h3 text-gradient-primary hover:scale-105 transition-all duration-300">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold animate-dana-float">
              ☸
            </div>
            <span className="font-bold">{t('brand')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <UnifiedDropdown
              items={donationsDropdownItems}
              trigger={createDropdownTrigger(t('donations'))}
              width="lg"
              align="start"
              sideOffset={8}
              aria-label="Donations menu"
              {...culturalProps}
            />

            <UnifiedDropdown
              items={monasteriesDropdownItems}
              trigger={createDropdownTrigger(t('monasteries'))}
              width="md"
              align="start"
              sideOffset={8}
              aria-label="Monasteries menu"
              {...culturalProps}
            />

            {!hasRole(profile, 'monastery_admin') && (
              <Link href="/manage/monastery" className="dana-nav-trigger px-4 py-2 rounded-xl hover:bg-primary/10 transition-all duration-300">
                {t('createMonastery')}
              </Link>
            )}

            {hasRole(profile, 'monastery_admin') && (
              <UnifiedDropdown
                items={manageDropdownItems}
                trigger={createDropdownTrigger(t('manage'))}
                width="lg"
                align="start"
                sideOffset={8}
                aria-label="Manage menu"
                {...culturalProps}
              />
            )}

            {isSuperAdmin(profile) && (
              <UnifiedDropdown
                items={adminDropdownItems}
                trigger={createDropdownTrigger(t('admin'))}
                width="lg"
                align="start"
                sideOffset={8}
                aria-label="Admin menu"
                {...culturalProps}
              />
            )}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSwitcher />

            <UnifiedDropdown
              items={profileDropdownItems}
              trigger={createDropdownTrigger(
                <div className="flex items-center space-x-3">
                  <Avatar className="w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground">{profile?.full_name}</span>
                </div>
              )}
              width="sm"
              align="end"
              sideOffset={8}
              aria-label="Profile menu"
              {...culturalProps}
            />
          </div>

          {/* Mobile Menu Button & Profile */}
          <div className="flex lg:hidden items-center space-x-2">
            <LanguageSwitcher />

            <Avatar className="w-8 h-8 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-gradient-primary text-white font-semibold text-sm">
                {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>

            <Button
              variant="ghost"
              size="icon"
              className="min-w-11 min-h-11 w-11 h-11"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/50 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Profile Section */}
            <div className="px-4 py-3 bg-muted/50 rounded-xl mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
              <Link
                href="/profile"
                className="block w-full text-left px-4 py-2.5 text-sm rounded-lg hover:bg-background transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4" />
                  <span>{t('myProfile')}</span>
                </div>
              </Link>
            </div>

            {/* Donations Section */}
            <div className="px-2 space-y-1">
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('donations')}</p>
              <Link
                href="/donate"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{t('makeDonation')}</p>
                  <p className="text-xs text-muted-foreground">{t('makeDonationDesc')}</p>
                </div>
              </Link>
              <Link
                href="/my-donations"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{t('myDonations')}</p>
                  <p className="text-xs text-muted-foreground">{t('myDonationsDesc')}</p>
                </div>
              </Link>
            </div>

            {/* Monasteries Section */}
            <div className="px-2 space-y-1">
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('monasteries')}</p>
              <Link
                href="/monasteries"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Building className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{t('browseMonasteries')}</p>
                  <p className="text-xs text-muted-foreground">{t('browseMonasteriesDesc')}</p>
                </div>
              </Link>
              {!hasRole(profile, 'monastery_admin') && (
                <Link
                  href="/manage/monastery"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{t('createMonastery')}</p>
                  </div>
                </Link>
              )}
            </div>

            {/* Management Section (for monastery admins) */}
            {hasRole(profile, 'monastery_admin') && (
              <div className="px-2 space-y-1">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('manage')}</p>
                <Link
                  href="/monastery-admin/upcoming-bookings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{t('upcomingConfirmations')}</p>
                    <p className="text-xs text-muted-foreground">{t('upcomingConfirmationsDesc')}</p>
                  </div>
                </Link>
                <Link
                  href="/manage/bookings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{t('bookings')}</p>
                    <p className="text-xs text-muted-foreground">{t('bookingsDesc')}</p>
                  </div>
                </Link>
                <Link
                  href="/manage/monastery"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{t('monasteryInfo')}</p>
                    <p className="text-xs text-muted-foreground">{t('monasteryInfoDesc')}</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Admin Section (for super admins) */}
            {isSuperAdmin(profile) && (
              <div className="px-2 space-y-1">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin')}</p>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{t('dashboard')}</p>
                    <p className="text-xs text-muted-foreground">{t('dashboardDesc')}</p>
                  </div>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{t('userManagement')}</p>
                    <p className="text-xs text-muted-foreground">{t('userManagementDesc')}</p>
                  </div>
                </Link>
                <Link
                  href="/admin/monasteries"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{t('monasteriesAdmin')}</p>
                    <p className="text-xs text-muted-foreground">{t('monasteriesAdminDesc')}</p>
                  </div>
                </Link>
                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{t('analytics')}</p>
                    <p className="text-xs text-muted-foreground">{t('analyticsDesc')}</p>
                  </div>
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors min-h-[44px]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{t('settings')}</p>
                    <p className="text-xs text-muted-foreground">{t('settingsDesc')}</p>
                  </div>
                </Link>
              </div>
            )}

            {/* Sign Out */}
            <div className="px-2 pt-2 border-t border-border/50 mt-4">
              <button
                onClick={async (e) => {
                  e.preventDefault()
                  setMobileMenuOpen(false)
                  await signOut()
                  if (typeof window !== 'undefined') {
                    window.location.href = '/'
                  }
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-destructive/10 text-destructive transition-colors w-full min-h-[44px]"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium text-sm">{t('signOut')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
