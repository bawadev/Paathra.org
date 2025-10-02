'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/src/i18n/navigation'
import { Globe } from 'lucide-react'
import { routing } from '@/src/i18n/routing'
import { UnifiedDropdown, DropdownPresets, createDropdownTrigger, getCulturalDropdownProps } from '@/components/ui/unified-dropdown'

const localeNames = {
  en: 'English',
  si: 'සිංහල'
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  // Create dropdown configuration using language preset
  const dropdownConfig = DropdownPresets.language(
    locale,
    handleLocaleChange,
    routing.locales
  )

  // Create trigger with globe icon and current locale
  const trigger = createDropdownTrigger(
    <>
      <Globe className="w-4 h-4" />
      {localeNames[locale as keyof typeof localeNames]}
    </>,
    {
      variant: 'default',
      size: 'md',
      showChevron: true,
    }
  )

  // Get cultural theming props
  const culturalProps = getCulturalDropdownProps(locale)

  return (
    <UnifiedDropdown
      items={dropdownConfig.items}
      trigger={trigger}
      width={dropdownConfig.width}
      align="end"
      sideOffset={8}
      aria-label="Language selector"
      {...culturalProps}
    />
  )
}