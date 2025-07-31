'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/src/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Globe } from 'lucide-react'
import { routing } from '@/src/i18n/routing'

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
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-500" />
      <Select value={locale} onValueChange={handleLocaleChange}>
        <SelectTrigger className="w-auto min-w-[100px] border-none bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {routing.locales.map((loc) => (
            <SelectItem key={loc} value={loc}>
              {localeNames[loc as keyof typeof localeNames]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}