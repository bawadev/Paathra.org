@Library('bawadev/kamal-deployment@main') _

// Jenkinsfile for Paathra
// Type: Next.js + Supabase
// Backend: Supabase (external)

deployKamalApp(
    appName:      'paathra',
    sourceRepo:   'bawadev/Paathra.org',
    dockerImage:  'bawadev/paathra',
    containerPort: '3000',
    kamalConfig:  'apps/paathra/deploy.yml',
    domains:      [
        dev:  'dev.paathra.org',
        prod: 'paathra.org'
    ],
    buildArgs:    [
        dev:  [
            NEXT_PUBLIC_SUPABASE_URL:      'https://nosxuzuvckyqbbzpgnsl.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc3h1enV2Y2t5cWJienBnbnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTAwMTMsImV4cCI6MjA2NzgyNjAxM30.eCE5Zw7C9146ZpKlrqfr4NjQzUXlYBpY2X1hbbXfyf4'
        ],
        prod: [
            NEXT_PUBLIC_SUPABASE_URL:      'https://nosxuzuvckyqbbzpgnsl.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc3h1enV2Y2t5cWJienBnbnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTAwMTMsImV4cCI6MjA2NzgyNjAxM30.eCE5Zw7C9146ZpKlrqfr4NjQzUXlYBpY2X1hbbXfyf4'
        ]
    ]
)
