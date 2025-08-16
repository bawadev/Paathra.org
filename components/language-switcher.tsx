'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/src/i18n/navigation'
import { Globe } from 'lucide-react'
import { routing } from '@/src/i18n/routing'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

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

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-lg font-bold flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {localeNames[locale as keyof typeof localeNames]}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[180px]">
              {routing.locales.map((loc) => (
                <NavigationMenuLink
                  key={loc}
                  className="block cursor-pointer"
                  onSelect={() => handleLocaleChange(loc)}
                >
                  <div 
                    className={`flex items-center p-3 rounded-md hover:bg-gradient-to-r hover:from-[var(--primary-color)] hover:to-[var(--accent-color)] hover:text-white hover:shadow-lg hover:shadow-[var(--primary-color)]/30 transition-all duration-300 ${
                      locale === loc ? 'bg-gradient-to-r from-[var(--primary-color)] to-[var(--accent-color)] text-white' : ''
                    }`}
                  >
                    {localeNames[loc as keyof typeof localeNames]}
                  </div>
                </NavigationMenuLink>
              ))}
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}