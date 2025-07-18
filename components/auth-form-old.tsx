'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/lib/auth-context'
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { TextField } from '@/components/forms/FormFields'

function SignInForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) {
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleSubmit = async (data: SignInInput) => {
    setLoading(true)
    try {
      const { error } = await signIn(data.email, data.password)
      if (error) {
        onError(error.message)
      } else {
        onSuccess()
      }
    } catch (err) {
      onError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <TextField
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          required
        />
        
        <TextField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </FormProvider>
  )
}

function SignUpForm({ onSuccess, onError }: { onSuccess: (message: string) => void; onError: (error: string) => void }) {
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  })

  const handleSubmit = async (data: SignUpInput) => {
    setLoading(true)
    try {
      const { error } = await signUp(data.email, data.password, data.fullName)
      if (error) {
        onError(error.message)
      } else {
        onSuccess('Check your email for the confirmation link!')
      }
    } catch (err) {
      onError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <TextField
          name="fullName"
          label="Full Name"
          placeholder="Enter your full name"
          required
        />
        
        <TextField
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          required
        />
        
        <TextField
          name="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
    </FormProvider>
  )
}

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSuccess = (msg?: string) => {
    setError('')
    if (msg) setMessage(msg)
  }

  const handleError = (err: string) => {
    setError(err)
    setMessage('')
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setMessage('')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'Sign In' : 'Sign Up'}</CardTitle>
          <CardDescription>
            {isLogin 
              ? 'Enter your credentials to access your account' 
              : 'Create an account to start donating food'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <SignInForm onSuccess={handleSuccess} onError={handleError} />
          ) : (
            <SignUpForm onSuccess={handleSuccess} onError={handleError} />
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert className="mt-4">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={switchMode}
              className="text-sm text-blue-600 hover:underline"
            >
              {isLogin 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
