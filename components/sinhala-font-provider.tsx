'use client'

import { useLocale } from 'next-intl'
import { ReactNode } from 'react'

interface SinhalaFontProviderProps {
  children: ReactNode
}

/**
 * SinhalaFontProvider - Provides proper Sinhala font rendering
 * 
 * This component automatically applies the appropriate Sinhala fonts
 * when the locale is set to Sinhala ('si'). It ensures proper rendering
 * of Sinhala characters across the application.
 * 
 * Features:
 * - Noto Sans Sinhala for body text and UI elements
 * - Abhaya Libre for headings and serif text
 * - Proper line-height and spacing for Sinhala text
 * - Automatic font switching based on locale
 */
export function SinhalaFontProvider({ children }: SinhalaFontProviderProps) {
  const locale = useLocale()
  
  // The CSS already handles font switching via html[lang="si"] selectors
  // This component is more for documentation and potential future enhancements
  
  return <>{children}</>
}

// Utility function to determine if current locale is Sinhala
export function useIsSinhala() {
  const locale = useLocale()
  return locale === 'si'
}

// Utility function to get appropriate font class
export function getFontClass(locale: string, type: 'sans' | 'serif' = 'sans') {
  if (locale === 'si') {
    return type === 'serif' ? 'sinhala-serif' : 'sinhala-text'
  }
  return type === 'serif' ? 'font-serif' : 'font-sans'
}