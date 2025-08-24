import { BaseLayout } from '@/components/layout/base-layout'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication is now handled by middleware
  return (
    <BaseLayout>
      <div className="container mx-auto px-4">
        {children}
      </div>
    </BaseLayout>
  )
}
