'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/lib/auth-context'
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Chrome, Facebook, Twitter } from 'lucide-react'

interface SocialAuthButtonsProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

function SocialAuthButtons({ onSuccess, onError }: SocialAuthButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { signInWithSocial } = useAuth();

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setLoading(provider);
    try {
      const { error } = await signInWithSocial(provider);
      
      if (error) {
        onError(error.message);
      } else {
        // OAuth redirect will handle success
        onSuccess();
      }
    } catch (err) {
      onError('An unexpected error occurred during social login');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-white text-[var(--text-light)]">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50"
        >
          <Chrome className="w-4 h-4" />
          <span className="sr-only">Google</span>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('facebook')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50"
        >
          <Facebook className="w-4 h-4" />
          <span className="sr-only">Facebook</span>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('twitter')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-50"
        >
          <Twitter className="w-4 h-4" />
          <span className="sr-only">Twitter</span>
        </Button>
      </div>
    </div>
  );
}

function SignInForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                {...form.register('email')}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
            </div>
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...form.register('password')}
                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all"
                placeholder="Enter your password"
                required
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="w-4 h-4 text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]" />
            <span className="ml-2 text-sm text-[var(--text-light)]">Remember me</span>
          </label>
          <a href="#" className="text-sm text-[var(--primary-color)] hover:underline">
            Forgot password?
          </a>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full btn-dana-primary py-3 text-white font-semibold"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        
        <SocialAuthButtons onSuccess={onSuccess} onError={onError} />
      </form>
    </FormProvider>
  )
}

function SignUpForm({ onSuccess, onError }: { onSuccess: (message: string) => void; onError: (error: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              Full Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="fullName"
                {...form.register('fullName')}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all"
                placeholder="Enter your full name"
                required
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">👤</span>
            </div>
            {form.formState.errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                {...form.register('email')}
                className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all"
                placeholder="Enter your email"
                required
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
            </div>
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...form.register('password')}
                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent transition-all"
                placeholder="Create a strong password"
                required
              />
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔒</span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full btn-dana-primary py-3 text-white font-semibold"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
        
        <SocialAuthButtons onSuccess={() => onSuccess('Account created successfully!')} onError={onError} />
        
        <p className="text-xs text-[var(--text-light)] text-center">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </form>
    </FormProvider>
  )
}

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { error: authError, clearError } = useAuth()

  // Show auth context errors
  const displayError = error || authError

  const handleSuccess = (message?: string) => {
    setError('')
    clearError()
    if (message) {
      setSuccess(message)
    }
  }

  const handleError = (error: string) => {
    setSuccess('')
    setError(error)
  }

  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp)
    setError('')
    setSuccess('')
    clearError()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:flex-1 gradient-primary relative overflow-hidden">
        <div className="flex flex-col justify-between p-12 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 text-white text-xl font-bold">
            <div className="lotus-icon bg-white"></div>
            <span>Dana</span>
          </div>
          
          {/* Hero Content */}
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold text-white mb-6 fade-in-1">
              {isSignUp ? 'Join Our Community' : 'Welcome Back'}
            </h1>
            <p className="text-xl text-white/90 fade-in-2">
              {isSignUp 
                ? 'Start your journey of compassion and generosity with Buddhist monasteries around the world.'
                : 'Continue your journey of compassion and generosity'
              }
            </p>
            
            {/* Floating Elements */}
            <div className="absolute top-10 right-[-100px] w-48 h-48 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-20 left-[-75px] w-36 h-36 bg-white/10 rounded-full animate-pulse"></div>
            <div className="absolute top-60 right-20 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
          </div>
          
          <div></div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-light)]">
        <div className="w-full max-w-md">
          <Card className="card-dana p-8">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-[var(--text-dark)]">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </CardTitle>
              <CardDescription className="text-[var(--text-light)]">
                {isSignUp 
                  ? 'Create your account to start making donations'
                  : 'Enter your credentials to access your account'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {displayError && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600">{displayError}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}
              
              {isSignUp ? (
                <SignUpForm onSuccess={handleSuccess} onError={handleError} />
              ) : (
                <SignInForm onSuccess={handleSuccess} onError={handleError} />
              )}
              
              <div className="text-center">
                <span className="text-[var(--text-light)]">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </span>
                <button
                  type="button"
                  onClick={handleModeSwitch}
                  className="ml-1 text-[var(--primary-color)] hover:underline font-medium"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
