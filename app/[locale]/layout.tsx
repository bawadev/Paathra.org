import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';
import { setRequestLocale } from 'next-intl/server';
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import AuthErrorBoundary from "@/components/auth-error-boundary";
import { ErrorProvider } from "@/lib/error-management";
import { LoadingProvider } from "@/lib/loading-system";

// Generate static params for all locales
export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

// Generate metadata based on locale
export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>
}): Promise<Metadata> {
  const {locale} = await params;
  
  return {
    title: locale === 'si' ? "ධාන - ආහාර දාන වේදිකාව" : "Dhaana - Food Donation Platform",
    description: locale === 'si' 
      ? "අර්ථවත් ආහාර දානය සඳහා දායකයින් පන්සල් සමඟ සම්බන්ධ කරන්න"
      : "Connect donors with monasteries for meaningful food donations",
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={locale === 'si' ? 'ltr' : 'ltr'}>
      <body>
        <NextIntlClientProvider>
          <ErrorProvider enableLogging={process.env.NODE_ENV === 'development'}>
            <LoadingProvider>
              <AuthErrorBoundary>
                <AuthProvider>
                  {children}
                  <Toaster />
                </AuthProvider>
              </AuthErrorBoundary>
            </LoadingProvider>
          </ErrorProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}