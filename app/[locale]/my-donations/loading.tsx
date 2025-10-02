import { SkeletonTable, SkeletonCard } from '@/components/ui/skeleton'

export default function MyDonationsLoading() {
  return (
    <div className="dana-container dana-section">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-6 w-96 bg-muted animate-pulse rounded-lg" />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="dana-card p-6 space-y-3">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="flex gap-4 border-b border-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-t" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="dana-card p-6">
          <SkeletonTable rows={5} />
        </div>
      </div>
    </div>
  )
}
