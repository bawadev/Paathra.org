import { Navigation } from '@/components/organisms/Navigation'

export default function MonasteriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 pt-24">
        {children}
      </main>
    </div>
  )
}
