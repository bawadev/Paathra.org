import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import AuthErrorBoundary from "@/components/auth-error-boundary";
import { ErrorProvider } from "@/lib/error-management";
import { LoadingProvider } from "@/lib/loading-system";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dhaana - Food Donation Platform",
  description: "Connect donors with monasteries for meaningful food donations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS for maps */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
      </body>
    </html>
  );
}
