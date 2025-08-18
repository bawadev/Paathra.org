'use client'

import { Link } from '@/src/i18n/navigation'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Calendar, Users, Building, LogOut, User, Shield, BarChart3, Phone } from 'lucide-react'
import { hasRole, isSuperAdmin } from '@/types/auth'
import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'

export function Navigation() {
  const { user, profile, signOut } = useAuth()
  const t = useTranslations('Navigation')

  if (!user) return null

  return (
    <nav className="navbar-fixed glass-effect shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center gap-4 text-2xl font-bold text-[var(--primary-color)] hover:scale-105 transition-transform">
              <div className="lotus-icon text-3xl"></div>
              <span className="font-bold">{t('brand')}</span>
            </Link>
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-lg font-bold">{t('donations')}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/donate"
                          className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                        >
                          <Calendar className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                          <div>
                            <div className="font-medium">{t('makeDonation')}</div>
                            <div className="text-sm text-gray-500">{t('makeDonationDesc')}</div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/my-donations"
                          className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                        >
                          <User className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                          <div>
                            <div className="font-medium">{t('myDonations')}</div>
                            <div className="text-sm text-gray-500">{t('myDonationsDesc')}</div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-lg font-bold">{t('monasteries')}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[250px]">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/monasteries"
                          className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                        >
                          <Building className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                          <div>
                            <div className="font-medium">{t('browseMonasteries')}</div>
                            <div className="text-sm text-gray-500">{t('browseMonasteriesDesc')}</div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {!hasRole(profile, 'monastery_admin') && (
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link href="/manage/monastery" className="px-3 py-2 text-lg font-bold rounded-md dropdown-item-hover transition-all duration-300">
                        {t('createMonastery')}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}

                {hasRole(profile, 'monastery_admin') && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-lg font-bold">{t('manage')}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[400px]">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/monastery-admin/upcoming-bookings"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                          >
                            <Calendar className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">{t('upcomingConfirmations')}</div>
                              <div className="text-sm text-gray-500">{t('upcomingConfirmationsDesc')}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/manage/bookings"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                          >
                            <Users className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">{t('bookings')}</div>
                              <div className="text-sm text-gray-500">{t('bookingsDesc')}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/manage/monastery"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                          >
                            <Building className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">{t('monasteryInfo')}</div>
                              <div className="text-sm text-gray-500">{t('monasteryInfoDesc')}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}

                {isSuperAdmin(profile) && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-lg font-bold">{t('admin')}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="grid gap-3 p-6 w-[400px]">
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/dashboard"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                          >
                            <BarChart3 className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">{t('dashboard')}</div>
                              <div className="text-sm text-gray-500">{t('dashboardDesc')}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/users"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                          >
                            <Users className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">{t('userManagement')}</div>
                              <div className="text-sm text-gray-500">{t('userManagementDesc')}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/monasteries"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                          >
                            <Building className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">{t('monasteriesAdmin')}</div>
                              <div className="text-sm text-gray-500">{t('monasteriesAdminDesc')}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/analytics"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                          >
                            <BarChart3 className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">{t('analytics')}</div>
                              <div className="text-sm text-gray-500">{t('analyticsDesc')}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/admin/settings"
                            className="flex flex-row items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                          >
                            <Shield className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                            <div>
                              <div className="font-medium">{t('settings')}</div>
                              <div className="text-sm text-gray-500">{t('settingsDesc')}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-lg font-bold">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback>
                          {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-base font-bold">{profile?.full_name}</span>
                    </div>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-4 w-48">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                        >
                          <User className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                          <span>{t('myProfile')}</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/"
                          onClick={async (e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            await signOut();
                            if (typeof window !== 'undefined') {
                              window.location.href = '/';
                            }
                          }}
                          className="flex items-center space-x-2 p-3 rounded-md dropdown-item-hover transition-all duration-300"
                        >
                          <LogOut className="w-4 h-4 flex-shrink-0 text-[var(--primary-color)]" />
                          <span>{t('signOut')}</span>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
