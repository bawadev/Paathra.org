'use client'

import { Link } from '@/src/i18n/navigation'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { useUIStore } from '@/lib/stores/useUIStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Calendar,
  Users,
  Building,
  LogOut,
  User,
  Shield,
  BarChart3,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import { hasRole, isSuperAdmin } from '@/types/auth'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function Navigation() {
  const { user, profile, signOut } = useAuthStore()
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore()
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const t = useTranslations('Navigation')

  if (!user) return null

  const handleSignOut = async () => {
    await signOut()
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  const navigationItems = [
    {
      id: 'donations',
      label: t('donations'),
      items: [
        {
          href: '/donate',
          icon: Calendar,
          title: t('makeDonation'),
          description: t('makeDonationDesc'),
        },
        {
          href: '/my-donations',
          icon: User,
          title: t('myDonations'),
          description: t('myDonationsDesc'),
        },
      ],
    },
    {
      id: 'monasteries',
      label: t('monasteries'),
      items: [
        {
          href: '/monasteries',
          icon: Building,
          title: t('browseMonasteries'),
          description: t('browseMonasteriesDesc'),
        },
      ],
    },
  ]

  // Add monastery admin items if user has role
  if (hasRole(profile, 'monastery_admin')) {
    navigationItems.push({
      id: 'manage',
      label: t('manage'),
      items: [
        {
          href: '/monastery-admin/upcoming-bookings',
          icon: Calendar,
          title: t('upcomingConfirmations'),
          description: t('upcomingConfirmationsDesc'),
        },
        {
          href: '/manage/bookings',
          icon: Users,
          title: t('bookings'),
          description: t('bookingsDesc'),
        },
        {
          href: '/manage/monastery',
          icon: Building,
          title: t('monasteryInfo'),
          description: t('monasteryInfoDesc'),
        },
      ],
    })
  } else {
    // Show create monastery for non-admins
    navigationItems.push({
      id: 'create',
      label: t('createMonastery'),
      href: '/manage/monastery',
    })
  }

  // Add admin items for super admin
  if (isSuperAdmin(profile)) {
    navigationItems.push({
      id: 'admin',
      label: t('admin'),
      items: [
        {
          href: '/admin/dashboard',
          icon: BarChart3,
          title: t('dashboard'),
          description: t('dashboardDesc'),
        },
        {
          href: '/admin/users',
          icon: Users,
          title: t('userManagement'),
          description: t('userManagementDesc'),
        },
        {
          href: '/admin/monasteries',
          icon: Building,
          title: t('monasteriesAdmin'),
          description: t('monasteriesAdminDesc'),
        },
        {
          href: '/admin/settings',
          icon: Shield,
          title: t('settings'),
          description: t('settingsDesc'),
        },
      ],
    })
  }

  return (
    <>
      <nav className="dana-nav">
        <div className="dana-container">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-primary hover:scale-105 transition-transform duration-200"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <Image
                  src="/images/paathra-logo-icon.png"
                  alt="Paathra"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="whitespace-nowrap">{t('brand')}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigationItems.map((item) => (
                    <NavigationMenuItem key={item.id}>
                      {item.items ? (
                        <>
                          <NavigationMenuTrigger className="text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-md text-base font-semibold transition-colors duration-200">
                            {item.label}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <div className="bg-popover text-popover-foreground rounded-lg border border-border shadow-lg p-4 w-80">
                              <div className="grid gap-2">
                                {item.items.map((subItem) => (
                                  <NavigationMenuLink asChild key={subItem.href}>
                                    <Link
                                      href={subItem.href}
                                      className="flex items-start gap-3 p-3 rounded-md hover:bg-accent/50 transition-colors group"
                                    >
                                      <subItem.icon className="w-4 h-4 text-primary group-hover:text-primary/80 mt-0.5" />
                                      <div>
                                        <div className="font-medium text-sm">
                                          {subItem.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {subItem.description}
                                        </div>
                                      </div>
                                    </Link>
                                  </NavigationMenuLink>
                                ))}
                              </div>
                            </div>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href!}
                            className="text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-md transition-colors duration-200 px-3 py-2 text-sm font-medium"
                          >
                            {item.label}
                          </Link>
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />

              {/* User Menu - Desktop */}
              <div className="hidden md:block">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-md transition-colors duration-200">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={profile?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {profile?.full_name?.split(' ')[0] || 'User'}
                          </span>
                        </div>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="bg-popover text-popover-foreground rounded-lg border border-border shadow-lg p-2 w-48">
                          <NavigationMenuLink asChild>
                            <Link
                              href="/profile"
                              className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors"
                            >
                              <User className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="flex-1">{t('myProfile')}</span>
                            </Link>
                          </NavigationMenuLink>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors text-left"
                          >
                            <LogOut className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="flex-1">{t('signOut')}</span>
                          </button>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-md z-40 border-t border-border/50">
          <div className="p-4 space-y-3">
            {navigationItems.map((item) => (
              <div key={item.id}>
                {item.items ? (
                  <div>
                    <button
                      onClick={() => setDropdownOpen(
                        dropdownOpen === item.id ? null : item.id
                      )}
                      className="flex items-center justify-between w-full px-3 py-2 text-left font-medium rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          dropdownOpen === item.id && 'rotate-180'
                        )}
                      />
                    </button>
                    {dropdownOpen === item.id && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors"
                          >
                            <subItem.icon className="w-4 h-4 text-primary" />
                            <span>{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 font-medium rounded-md hover:bg-accent/50 transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {/* User Section - Mobile */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-3 px-3 py-2 mb-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">
                    {profile?.full_name || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {profile?.email}
                  </div>
                </div>
              </div>

              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors"
              >
                <User className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="flex-1">{t('myProfile')}</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-colors text-left mt-1"
              >
                <LogOut className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="flex-1">{t('signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}