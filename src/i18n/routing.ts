import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'si'],

  // Used when no locale matches
  defaultLocale: 'en',

  // The prefix for the default locale
  localePrefix: 'always' // Always show locale prefix for better SEO

  // Removed localized pathnames - using English paths for all languages
  // This prevents 404 errors when switching languages and simplifies routing
  // URLs will be: /en/monasteries and /si/monasteries (same path, different content)
});

// Infer the type
export type Locale = (typeof routing.locales)[number];