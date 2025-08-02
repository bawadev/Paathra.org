import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export default async function RootPage() {
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language') || ''
  
  // Detect browser language preference
  const browserLanguages = acceptLanguage
    .split(',')
    .map((lang: string) => lang.trim().split(';')[0].toLowerCase())
  
  // Check for Sinhala preferences
  const prefersSinhala = browserLanguages.some((lang: string) => 
    lang.startsWith('si') || lang.startsWith('si-lk')
  )
  
  // Default to English, prioritize Sinhala based on browser preference
  let targetLocale = 'en'
  
  if (prefersSinhala) {
    targetLocale = 'si'
  }
  
  redirect(`/${targetLocale}`)
}