import { SkeletonCard, SkeletonTable } from '@/components/ui/skeleton'

export default function ManageLoading() {
  return (
    <div className="dana-container dana-section">
      <div className="space-y-8">
        {/* Header with action button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
            <div className="h-5 w-96 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="h-10 w-40 bg-muted animate-pulse rounded-lg" />
        </div>

        {/* Dashboard stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dana-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
              </div>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        {/* Recent bookings table */}
        <div className="dana-card">
          <div className="p-6 border-b border-border">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="p-6">
            <SkeletonTable rows={5} />
          </div>
        </div>
      </div>
    </div>
  )
}
