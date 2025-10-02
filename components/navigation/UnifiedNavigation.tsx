'use client'

/**
 * Enhanced Dana Design System - Unified Navigation Component
 * Example implementation using the new unified navigation system
 */

import React from 'react'
import { Link } from '@/src/i18n/navigation'
import { useAuth } from '@/lib/auth-context'
import { useTheme } from '@/lib/design-system/theme/theme-provider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NavigationDropdown, NavigationItem } from './index'
import { NavigationDropdownItem } from './types'
import { hasRole, isSuperAdmin } from '@/types/auth'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'
import {
  Calendar,
  Users,
  Building,
  LogOut,
  User,
  Shield,
  BarChart3,
} from 'lucide-react'

export function UnifiedNavigation() {
  const { user, profile, signOut } = useAuth()
  const { cultural } = useTheme()
  const t = useTranslations('Navigation')

  if (!user) return null

  // Donations dropdown items
  const donationItems: NavigationDropdownItem[] = [
    {
      id: 'make-donation',
      title: t('makeDonation'),
      description: t('makeDonationDesc'),
      href: '/donate',
      icon: Calendar,
    },
    {
      id: 'my-donations',
      title: t('myDonations'),
      description: t('myDonationsDesc'),
      href: '/my-donations',
      icon: User,
    },
  ]

  // Monasteries dropdown items
  const monasteryItems: NavigationDropdownItem[] = [
    {
      id: 'browse-monasteries',
      title: t('browseMonasteries'),
      description: t('browseMonasteriesDesc'),
      href: '/monasteries',
      icon: Building,
    },
  ]

  // Management dropdown items (for monastery admins)
  const managementItems: NavigationDropdownItem[] = [
    {
      id: 'upcoming-confirmations',
      title: t('upcomingConfirmations'),
      description: t('upcomingConfirmationsDesc'),
      href: '/monastery-admin/upcoming-bookings',
      icon: Calendar,
    },
    {
      id: 'manage-bookings',
      title: t('bookings'),
      description: t('bookingsDesc'),
      href: '/manage/bookings',
      icon: Users,
    },
    {
      id: 'monastery-info',
      title: t('monasteryInfo'),
      description: t('monasteryInfoDesc'),
      href: '/manage/monastery',
      icon: Building,
    },
  ]

  // Admin dropdown items (for super admins)
  const adminItems: NavigationDropdownItem[] = [
    {
      id: 'dashboard',
      title: t('dashboard'),
      description: t('dashboardDesc'),
      href: '/admin/dashboard',
      icon: BarChart3,
    },
    {
      id: 'user-management',
      title: t('userManagement'),
      description: t('userManagementDesc'),
      href: '/admin/users',
      icon: Users,
    },
    {
      id: 'monasteries-admin',
      title: t('monasteriesAdmin'),
      description: t('monasteriesAdminDesc'),
      href: '/admin/monasteries',
      icon: Building,
    },
    {
      id: 'settings',
      title: t('settings'),
      description: t('settingsDesc'),
      href: '/admin/settings',
      icon: Shield,
    },
  ]

  // User menu items
  const userMenuItems: NavigationDropdownItem[] = [
    {
      id: 'profile',
      title: t('myProfile'),
      href: '/profile',
      icon: User,
    },
  ]

  const handleSignOut = async () => {
    await signOut()
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  return (
    <nav className="dana-nav">
      <div className="dana-container">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-4 text-h3 text-gradient-primary hover:scale-105 transition-all duration-300"
            aria-label={t('brand')}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold animate-dana-float">
              ☸
            </div>
            <span className="font-bold">{t('brand')}</span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Donations Dropdown */}
            <NavigationDropdown
              label={t('donations')}
              items={donationItems}
              width="lg"
              aria-label={t('donations') + ' menu'}
            />

            {/* Monasteries Dropdown */}
            <NavigationDropdown
              label={t('monasteries')}
              items={monasteryItems}
              width="md"
              aria-label={t('monasteries') + ' menu'}
            />

            {/* Create Monastery (for non-admins) */}
            {!hasRole(profile, 'monastery_admin') && (
              <NavigationItem
                href="/manage/monastery"
                variant="ghost"
                aria-label={t('createMonastery')}
              >
                {t('createMonastery')}
              </NavigationItem>
            )}

            {/* Management Dropdown (for monastery admins) */}
            {hasRole(profile, 'monastery_admin') && (
              <NavigationDropdown
                label={t('manage')}
                items={managementItems}
                width="lg"
                aria-label={t('manage') + ' menu'}
              />
            )}

            {/* Admin Dropdown (for super admins) */}
            {isSuperAdmin(profile) && (
              <NavigationDropdown
                label={t('admin')}
                items={adminItems}
                width="lg"
                aria-label={t('admin') + ' menu'}
              />
            )}
          </div>

          {/* Right Side - Language & User */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Menu */}
            <div className="hidden md:block">
              <NavigationDropdown
                label={
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                        {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-base font-medium text-foreground">
                      {profile?.full_name}
                    </span>
                  </div>
                }
                items={[
                  ...userMenuItems,
                  {
                    id: 'sign-out',
                    title: t('signOut'),
                    href: '#',
                    icon: LogOut,
                    onClick: handleSignOut,
                  } as any, // Type assertion for custom onClick handler
                ]}
                width="sm"
                variant="ghost"
                aria-label="User menu"
              />
            </div>

            {/* Mobile Menu Button */}
            <NavigationItem
              variant="ghost"
              className="md:hidden"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </NavigationItem>
          </div>
        </div>
      </div>
    </nav>
  )
}