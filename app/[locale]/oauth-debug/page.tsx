import OAuthDebugTool from '@/components/oauth-debug-tool'

export default function OAuthDebugPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-light)] py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-dark)] mb-2">
            OAuth Debug & Configuration
          </h1>
          <p className="text-[var(--text-light)]">
            Diagnose and fix Google OAuth authentication issues
          </p>
        </div>
        <OAuthDebugTool />
      </div>
    </div>
  )
}