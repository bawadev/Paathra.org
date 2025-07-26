import { Navigation } from '@/components/navigation'

export default function MonasteryAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monastery Administration</h1>
              <p className="text-sm text-gray-600">Manage donation bookings and confirmations</p>
            </div>
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4">
        {children}
      </main>
    </div>
  )
}
