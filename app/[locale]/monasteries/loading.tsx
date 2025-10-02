import { SkeletonCard } from '@/components/ui/skeleton'

export default function MonasteriesLoading() {
  return (
    <div className="dana-container dana-section">
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-6 w-96 bg-muted animate-pulse rounded-lg" />
        </div>

        {/* Search and filters skeleton */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 h-12 bg-muted animate-pulse rounded-lg" />
          <div className="w-full md:w-48 h-12 bg-muted animate-pulse rounded-lg" />
        </div>

        {/* Monastery cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
