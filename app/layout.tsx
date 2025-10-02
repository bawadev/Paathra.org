import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Don't wrap in html/body here - the locale layout handles that
  // This fixes hydration errors from nested <html> tags
  return children;
}
