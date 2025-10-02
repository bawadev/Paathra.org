import { SkeletonForm } from '@/components/ui/skeleton'
import { LoadingState } from '@/components/loading'

export default function DonateLoading() {
  return (
    <div className="dana-container dana-section">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="h-10 w-64 bg-muted animate-pulse rounded-lg mx-auto" />
          <div className="h-6 w-96 bg-muted animate-pulse rounded-lg mx-auto" />
        </div>

        {/* Progress indicator skeleton */}
        <div className="flex justify-between items-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              {i < 2 && <div className="flex-1 h-1 bg-muted animate-pulse mx-2" />}
            </div>
          ))}
        </div>

        {/* Form skeleton */}
        <div className="dana-card p-8">
          <SkeletonForm />
        </div>

        {/* Trust indicator */}
        <div className="text-center">
          <LoadingState
            message="Preparing donation form..."
            variant="trust"
            size="md"
          />
        </div>
      </div>
    </div>
  )
}
