import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'si'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The prefix for the default locale
  localePrefix: 'always', // Always show locale prefix for better SEO

  // Pathnames can be localized for each locale
  pathnames: {
    '/': '/',
    '/monasteries': {
      en: '/monasteries',
      si: '/pansala' // Sinhala translation for monasteries
    },
    '/donate': {
      en: '/donate',
      si: '/daanaya' // Sinhala translation for donate
    },
    '/my-donations': {
      en: '/my-donations',
      si: '/mama-daana' // Sinhala translation for my donations
    },
    '/manage': {
      en: '/manage',
      si: '/palanaya' // Sinhala translation for manage
    },
    '/manage/monastery': {
      en: '/manage/monastery',
      si: '/palanaya/pansala'
    },
    '/manage/slots': {
      en: '/manage/slots',
      si: '/palanaya/kala-parichcheda'
    },
    '/manage/bookings': {
      en: '/manage/bookings',
      si: '/palanaya/venkaraganeem'
    },
    '/monastery-admin': {
      en: '/monastery-admin',
      si: '/pansala-paripaalaka'
    },
    '/monastery-admin/upcoming-bookings': {
      en: '/monastery-admin/upcoming-bookings',
      si: '/pansala-paripaalaka/idiri-venkaraganeem'
    },
    '/admin': {
      en: '/admin',
      si: '/admin' // Keep admin in English
    },
    '/admin/dashboard': {
      en: '/admin/dashboard',
      si: '/admin/dashboard'
    },
    '/admin/users': {
      en: '/admin/users',
      si: '/admin/parishilakayeen'
    },
    '/admin/monasteries': {
      en: '/admin/monasteries',
      si: '/admin/pansala'
    },
    '/admin/analytics': {
      en: '/admin/analytics',
      si: '/admin/vishleshanaya'
    },
    '/admin/settings': {
      en: '/admin/settings',
      si: '/admin/sakasum'
    }
  }
});

// Infer the type
export type Pathnames = keyof typeof routing.pathnames;
export type Locale = (typeof routing.locales)[number];