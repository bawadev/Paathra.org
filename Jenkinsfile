@Library('softx-cicd') _
deployApp(
    appName: 'paathra',
    dockerImage: 'bawadev/paathra',
    dockerfile: 'Dockerfile',
    containerPort: '3000',
    traefikLabels: [
        prod: [domain: 'paathra.org'],
        dev:  [domain: 'dev.paathra.org']
    ],
    buildArgs: [
        prod: [
            NEXT_PUBLIC_SUPABASE_URL: 'https://nosxuzuvckyqbbzpgnsl.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc3h1enV2Y2t5cWJienBnbnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTAwMTMsImV4cCI6MjA2NzgyNjAxM30.eCE5Zw7C9146ZpKlrqfr4NjQzUXlYBpY2X1hbbXfyf4'
        ],
        dev: [
            NEXT_PUBLIC_SUPABASE_URL: 'https://nosxuzuvckyqbbzpgnsl.supabase.co',
            NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc3h1enV2Y2t5cWJienBnbnNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTAwMTMsImV4cCI6MjA2NzgyNjAxM30.eCE5Zw7C9146ZpKlrqfr4NjQzUXlYBpY2X1hbbXfyf4'
        ]
    ],
    envVars: [
        prod: [
            SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc3h1enV2Y2t5cWJienBnbnNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI1MDAxMywiZXhwIjoyMDY3ODI2MDEzfQ.AOH14-q3tEjUC-jsDF_xJQ-ML--weJxlTlmMghUkif8',
            SUPABASE_SECRET_KEY: 'sb_secret_3y0sdS1VazxJzab0_1P9xw_4kgyKEZr',
            SUPABASE_JWT_SECRET: 'zew+2xV+hEtId4znmK8riwK5FDs4+kvaMo0mrHs8YmZFlWaqHAI5Q2mryqlcJpS4xwsinzlyOJ8HOEA5/8qLpw=='
        ],
        dev: [
            SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vc3h1enV2Y2t5cWJienBnbnNsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjI1MDAxMywiZXhwIjoyMDY3ODI2MDEzfQ.AOH14-q3tEjUC-jsDF_xJQ-ML--weJxlTlmMghUkif8',
            SUPABASE_SECRET_KEY: 'sb_secret_3y0sdS1VazxJzab0_1P9xw_4kgyKEZr',
            SUPABASE_JWT_SECRET: 'zew+2xV+hEtId4znmK8riwK5FDs4+kvaMo0mrHs8YmZFlWaqHAI5Q2mryqlcJpS4xwsinzlyOJ8HOEA5/8qLpw=='
        ]
    ]
)
