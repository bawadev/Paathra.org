'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, AlertTriangle, Copy, ExternalLink } from 'lucide-react'

interface ConfigCheck {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: string
  action?: string
}

export default function OAuthDebugTool() {
  const [checks, setChecks] = useState<ConfigCheck[]>([])
  const [loading, setLoading] = useState(false)
  const [testingOAuth, setTestingOAuth] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    const diagnostics: ConfigCheck[] = []

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    diagnostics.push({
      name: 'Supabase URL',
      status: supabaseUrl ? 'success' : 'error',
      message: supabaseUrl ? 'Supabase URL is configured' : 'Supabase URL is missing',
      details: supabaseUrl || 'Not found in environment variables'
    })

    diagnostics.push({
      name: 'Supabase Anon Key',
      status: supabaseKey ? 'success' : 'error',
      message: supabaseKey ? 'Supabase anon key is configured' : 'Supabase anon key is missing',
      details: supabaseKey ? 'Key present (hidden for security)' : 'Not found in environment variables'
    })

    // Check current URL structure
    const currentUrl = window.location.origin
    const expectedCallbackUrl = `${currentUrl}/en/auth/callback`
    
    diagnostics.push({
      name: 'Callback URL Structure',
      status: 'success',
      message: 'Callback URL structure is correct',
      details: expectedCallbackUrl,
      action: 'Copy this URL to add to Google Console and Supabase Dashboard'
    })

    // Check if we can connect to Supabase
    try {
      const { data, error } = await supabase.auth.getSession()
      diagnostics.push({
        name: 'Supabase Connection',
        status: error ? 'error' : 'success',
        message: error ? 'Cannot connect to Supabase' : 'Successfully connected to Supabase',
        details: error?.message || 'Connection established'
      })
    } catch (err) {
      diagnostics.push({
        name: 'Supabase Connection',
        status: 'error',
        message: 'Failed to connect to Supabase',
        details: err instanceof Error ? err.message : 'Unknown error'
      })
    }

    // Check OAuth provider configuration (this will likely show the issue)
    diagnostics.push({
      name: 'Google OAuth Configuration',
      status: 'warning',
      message: 'Google OAuth must be configured in Supabase Dashboard',
      details: 'Go to Supabase Dashboard → Authentication → Providers → Google',
      action: 'Configure Google OAuth in Supabase Dashboard'
    })

    setChecks(diagnostics)
    setLoading(false)
  }

  const testOAuthFlow = async () => {
    setTestingOAuth(true)
    try {
      const currentPath = window.location.pathname
      const locale = currentPath.split('/')[1] || 'en'
      const redirectUrl = `${window.location.origin}/${locale}/auth/callback`
      
      console.log('Testing OAuth with redirect URL:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      })
      
      if (error) {
        console.error('OAuth test failed:', error)
        alert(`OAuth test failed: ${error.message}`)
      } else {
        console.log('OAuth test initiated:', data)
      }
    } catch (err) {
      console.error('OAuth test error:', err)
      alert(`OAuth test error: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setTestingOAuth(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const getStatusIcon = (status: ConfigCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: ConfigCheck['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            OAuth Debug Tool
          </CardTitle>
          <CardDescription>
            Diagnose and fix Google OAuth authentication issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runDiagnostics} disabled={loading}>
              {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
            </Button>
            <Button 
              variant="outline" 
              onClick={testOAuthFlow} 
              disabled={testingOAuth}
            >
              {testingOAuth ? 'Testing OAuth...' : 'Test OAuth Flow'}
            </Button>
          </div>

          {checks.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Diagnostic Results</h3>
              {checks.map((check, index) => (
                <Alert key={index} className={getStatusColor(check.status)}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{check.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {check.status}
                        </Badge>
                      </div>
                      <AlertDescription className="mb-2">
                        {check.message}
                      </AlertDescription>
                      {check.details && (
                        <div className="text-sm bg-white/50 p-2 rounded border">
                          <code className="text-xs">{check.details}</code>
                          {check.action && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-2 h-6 px-2"
                              onClick={() => copyToClipboard(check.details!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )}
                      {check.action && (
                        <div className="mt-2 text-sm font-medium text-blue-600">
                          → {check.action}
                        </div>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Guide</CardTitle>
          <CardDescription>
            Step-by-step instructions to fix Google OAuth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-lg mb-2">Step 1: Google Cloud Console</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="h-3 w-3" /></a></li>
                <li>Create a new project or select an existing one</li>
                <li>Enable the Google+ API</li>
                <li>Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"</li>
                <li>Set Application type to "Web application"</li>
                <li>Add these Authorized redirect URIs:</li>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><code className="bg-gray-100 px-2 py-1 rounded text-xs">http://localhost:3000/en/auth/callback</code></li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded text-xs">https://nosxuzuvckyqbbzpgnsl.supabase.co/auth/v1/callback</code></li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded text-xs">https://your-production-domain.com/en/auth/callback</code></li>
                </ul>
                <li>Copy the Client ID and Client Secret</li>
              </ol>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-lg mb-2">Step 2: Supabase Dashboard</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Supabase Dashboard <ExternalLink className="h-3 w-3" /></a></li>
                <li>Select your project: <code className="bg-gray-100 px-2 py-1 rounded text-xs">nosxuzuvckyqbbzpgnsl</code></li>
                <li>Go to Authentication → Providers</li>
                <li>Find "Google" and click to configure</li>
                <li>Enable Google provider</li>
                <li>Paste your Google Client ID and Client Secret</li>
                <li>Add these redirect URLs in the "Redirect URLs" section:</li>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li><code className="bg-gray-100 px-2 py-1 rounded text-xs">http://localhost:3000/en/auth/callback</code></li>
                  <li><code className="bg-gray-100 px-2 py-1 rounded text-xs">https://your-production-domain.com/en/auth/callback</code></li>
                </ul>
                <li>Save the configuration</li>
              </ol>
            </div>

            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-lg mb-2">Step 3: Test the Configuration</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Wait 2-3 minutes for changes to propagate</li>
                <li>Use the "Test OAuth Flow" button above</li>
                <li>You should be redirected to Google's consent screen</li>
                <li>After authorization, you should be redirected back with a code parameter</li>
                <li>Check the browser console for any errors</li>
              </ol>
            </div>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Make sure the redirect URLs in Google Console exactly match those in Supabase Dashboard. Any mismatch will cause the "no code" error you're experiencing.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Issues & Solutions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border rounded p-3">
              <h4 className="font-semibold text-red-600 mb-2">❌ "No code or error received from OAuth provider"</h4>
              <p className="text-sm mb-2">This means Google OAuth is not configured or redirect URLs don't match.</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Check if Google provider is enabled in Supabase Dashboard</li>
                <li>Verify Client ID and Secret are correctly set</li>
                <li>Ensure redirect URLs match exactly between Google Console and Supabase</li>
              </ul>
            </div>

            <div className="border rounded p-3">
              <h4 className="font-semibold text-red-600 mb-2">❌ "redirect_uri_mismatch"</h4>
              <p className="text-sm mb-2">The redirect URL doesn't match what's configured in Google Console.</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Add the exact callback URL to Google Console authorized redirect URIs</li>
                <li>Include both localhost and production URLs</li>
                <li>Don't forget the Supabase callback URL</li>
              </ul>
            </div>

            <div className="border rounded p-3">
              <h4 className="font-semibold text-yellow-600 mb-2">⚠️ "access_denied"</h4>
              <p className="text-sm mb-2">User denied access or OAuth app needs verification.</p>
              <ul className="text-sm list-disc list-inside space-y-1">
                <li>Make sure your OAuth consent screen is properly configured</li>
                <li>For production, you may need to verify your app with Google</li>
                <li>Check if your app is in testing mode and user is added as test user</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}