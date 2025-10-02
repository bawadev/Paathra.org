'use client'

import * as React from 'react'
import { UnifiedDropdown, DropdownPresets, createDropdownItems, createDropdownTrigger } from './unified-dropdown'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Button } from './button'
import { Globe, User, LogOut, Calendar, Building, Users, BarChart3, Shield } from 'lucide-react'
// import { useAuth } from '@/lib/auth-context' // Commented out for examples
// import { useRouter, usePathname } from '@/src/i18n/navigation' // Commented out for examples
import { useLocale } from 'next-intl'

/**
 * Example implementations showing how to use the UnifiedDropdown component
 * to replace various dropdown patterns in the application
 */

// Example 1: Profile Dropdown (replaces current profile dropdown in navigation)
export function ProfileDropdownExample() {
  // Mock profile data for demonstration
  const mockProfile = {
    full_name: 'John Doe',
    avatar_url: undefined,
  }

  const mockSignOut = async () => {
    console.log('Sign out clicked')
  }

  const profileConfig = DropdownPresets.profile(mockProfile, mockSignOut)

  return (
    <UnifiedDropdown
      {...profileConfig}
      trigger={createDropdownTrigger(
        <div className="flex items-center space-x-3">
          <Avatar className="w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
            <AvatarImage src={mockProfile?.avatar_url} />
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              {mockProfile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="text-foreground">{mockProfile?.full_name}</span>
        </div>
      )}
      aria-label="User profile menu"
    />
  )
}

// Example 2: Language Switcher (replaces current language switcher)
export function LanguageSwitcherExample() {
  const locale = useLocale()
  // Mock router for demonstration
  const handleLocaleChange = (newLocale: string) => {
    console.log('Locale change:', newLocale)
  }

  const localeNames = {
    en: 'English',
    si: 'සිංහල'
  }

  const languageConfig = DropdownPresets.language(
    locale,
    handleLocaleChange,
    ['en', 'si']
  )

  return (
    <UnifiedDropdown
      {...languageConfig}
      trigger={createDropdownTrigger(
        <>
          <Globe className="w-4 h-4" />
          {localeNames[locale as keyof typeof localeNames]}
        </>
      )}
      aria-label="Language selection"
    />
  )
}

// Example 3: Navigation Menu Dropdown (replaces admin menu dropdown)
export function AdminMenuExample() {
  const adminMenuItems = [
    {
      key: 'dashboard',
      icon: BarChart3,
      label: 'Dashboard',
      description: 'View system analytics and metrics',
      href: '/admin/dashboard',
    },
    {
      key: 'users',
      icon: Users,
      label: 'User Management',
      description: 'Manage user accounts and permissions',
      href: '/admin/users',
    },
    {
      key: 'monasteries',
      icon: Building,
      label: 'Monasteries',
      description: 'Manage monastery registrations',
      href: '/admin/monasteries',
    },
    {
      key: 'settings',
      icon: Shield,
      label: 'Settings',
      description: 'System configuration and preferences',
      href: '/admin/settings',
    },
  ]

  const navigationConfig = DropdownPresets.navigation(adminMenuItems)

  return (
    <UnifiedDropdown
      {...navigationConfig}
      trigger={createDropdownTrigger('Admin')}
      aria-label="Administrator menu"
    />
  )
}

// Example 4: Custom Dropdown with Mixed Content
export function CustomDropdownExample() {
  const customItems = createDropdownItems([
    {
      type: 'label',
      label: 'Quick Actions',
    },
    {
      icon: Calendar,
      label: 'Schedule Donation',
      description: 'Book a new donation slot',
      href: '/donate',
    },
    {
      icon: User,
      label: 'View Profile',
      href: '/profile',
    },
    {
      type: 'separator',
    },
    {
      type: 'label',
      label: 'Account',
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      variant: 'destructive',
      onClick: () => {
        console.log('Signing out...')
      },
    },
  ])

  return (
    <UnifiedDropdown
      items={customItems}
      trigger={createDropdownTrigger(
        <Button variant="outline">
          Actions
        </Button>,
        { showChevron: true }
      )}
      width="md"
      aria-label="Action menu"
    />
  )
}

// Example 5: Cultural Theme Demonstration
export function CulturalDropdownExample() {
  const [culturalTheme, setCulturalTheme] = React.useState<'sinhala' | 'english'>('english')

  const items = createDropdownItems([
    {
      label: 'මාතෘකාව එක',
      description: 'සිංහල අකුරු සමඟ විස්තරය',
      onClick: () => console.log('Sinhala item clicked'),
    },
    {
      label: 'English Title',
      description: 'Description with English text',
      onClick: () => console.log('English item clicked'),
    },
    {
      type: 'separator',
    },
    {
      label: 'Switch Theme',
      onClick: () => setCulturalTheme(prev => prev === 'sinhala' ? 'english' : 'sinhala'),
    },
  ])

  return (
    <UnifiedDropdown
      items={items}
      trigger={createDropdownTrigger(
        `Cultural Demo (${culturalTheme})`
      )}
      culturalTheme={culturalTheme}
      enableCulturalAdaptation={true}
      width="lg"
      aria-label="Cultural theming demonstration"
    />
  )
}

// Example 6: Compact Mobile-Friendly Dropdown
export function CompactDropdownExample() {
  const compactItems = createDropdownItems([
    {
      icon: Calendar,
      label: 'Donate',
      href: '/donate',
    },
    {
      icon: Building,
      label: 'Monasteries',
      href: '/monasteries',
    },
    {
      icon: User,
      label: 'Profile',
      href: '/profile',
    },
  ])

  return (
    <UnifiedDropdown
      items={compactItems}
      trigger={createDropdownTrigger(
        '☰',
        { variant: 'ghost', size: 'sm' }
      )}
      width="sm"
      aria-label="Mobile navigation menu"
    />
  )
}

// Usage demonstration component
export function UnifiedDropdownShowcase() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Unified Dropdown Examples</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Profile Dropdown</h2>
          <ProfileDropdownExample />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Language Switcher</h2>
          <LanguageSwitcherExample />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Admin Menu</h2>
          <AdminMenuExample />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Custom Dropdown</h2>
          <CustomDropdownExample />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Cultural Theme</h2>
          <CulturalDropdownExample />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Compact Mobile</h2>
          <CompactDropdownExample />
        </div>
      </div>
    </div>
  )
}