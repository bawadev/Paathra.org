import { Navigation } from '@/components/navigation'

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 pt-24">
        {children}
      </main>
    </div>
  )
}
