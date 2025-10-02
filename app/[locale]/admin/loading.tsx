import { SkeletonTable } from '@/components/ui/skeleton'

export default function AdminLoading() {
  return (
    <div className="dana-container dana-section">
      <div className="space-y-8">
        {/* Admin header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
            <div className="h-5 w-72 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>

        {/* System stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dana-card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="w-10 h-10 bg-muted animate-pulse rounded-lg" />
              </div>
              <div className="h-10 w-20 bg-muted animate-pulse rounded-lg" />
              <div className="h-3 w-32 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          {['Users', 'Monasteries', 'Donations', 'Analytics'].map((tab, i) => (
            <div key={i} className="h-10 w-28 bg-muted animate-pulse rounded-t" />
          ))}
        </div>

        {/* Content area */}
        <div className="dana-card p-6">
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex gap-4">
              <div className="flex-1 h-10 bg-muted animate-pulse rounded-lg" />
              <div className="w-32 h-10 bg-muted animate-pulse rounded-lg" />
            </div>

            {/* Table */}
            <SkeletonTable rows={8} />
          </div>
        </div>
      </div>
    </div>
  )
}
