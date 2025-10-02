import { SkeletonAvatar, SkeletonForm } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="dana-container dana-section">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
          <div className="h-5 w-96 bg-muted animate-pulse rounded-lg" />
        </div>

        {/* Profile card */}
        <div className="dana-card p-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar section */}
            <div className="flex flex-col items-center gap-4">
              <SkeletonAvatar size="lg" />
              <div className="h-9 w-32 bg-muted animate-pulse rounded-lg" />
            </div>

            {/* Info section */}
            <div className="flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded-lg" />
              </div>

              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-24 w-full bg-muted animate-pulse rounded-lg" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-8 justify-end">
            <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
            <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>

        {/* Additional sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="dana-card p-6 space-y-4">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                  <div className="flex-1 h-4 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="dana-card p-6 space-y-4">
            <div className="h-6 w-40 bg-muted animate-pulse rounded" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-6 w-12 bg-muted animate-pulse rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
