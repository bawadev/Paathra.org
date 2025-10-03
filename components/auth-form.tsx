'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/lib/stores/useAuthStore'
import { signInSchema, signUpSchema, type SignInInput, type SignUpInput } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Chrome, Facebook, Twitter, Lock, User, AtSign } from 'lucide-react'
import Image from 'next/image'
import { useLocale } from 'next-intl'
import { LanguageSwitcher } from '@/components/language-switcher'

interface SocialAuthButtonsProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

function SocialAuthButtons({ onSuccess, onError }: SocialAuthButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { signInWithSocial } = useAuthStore();

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
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105"
        >
          <Chrome className="w-5 h-5" />
          <span className="sr-only">Google</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('facebook')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105"
        >
          <Facebook className="w-5 h-5" />
          <span className="sr-only">Facebook</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialLogin('twitter')}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border-2 hover:border-primary hover:bg-primary/5 transition-all duration-200 hover:scale-105"
        >
          <Twitter className="w-5 h-5" />
          <span className="sr-only">Twitter</span>
        </Button>
      </div>
    </div>
  );
}

function SignInForm({ onSuccess, onError }: { onSuccess: () => void; onError: (error: string) => void }) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuthStore()

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
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <div className="relative group">
              <input
                type="email"
                id="email"
                {...form.register('email')}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-12 transition-all duration-200 hover:border-primary/50"
                placeholder="Enter your email"
                required
              />
              <AtSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
            </div>
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...form.register('password')}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-12 pr-12 transition-all duration-200 hover:border-primary/50"
                placeholder="Enter your password"
                required
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="min-w-[44px] min-h-[44px] text-[var(--primary-color)] border-gray-300 rounded focus:ring-[var(--primary-color)]" />
            <span className="ml-2 text-sm text-[var(--text-light)]">Remember me</span>
          </label>
          <a href="#" className="text-sm text-[var(--primary-color)] hover:underline min-h-[44px] inline-flex items-center">
            Forgot password?
          </a>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
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
  const { signUp } = useAuthStore()

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
            <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
              Full Name
            </label>
            <div className="relative group">
              <input
                type="text"
                id="fullName"
                {...form.register('fullName')}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-12 transition-all duration-200 hover:border-primary/50"
                placeholder="Enter your full name"
                required
              />
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
            </div>
            {form.formState.errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.fullName.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address
            </label>
            <div className="relative group">
              <input
                type="email"
                id="email"
                {...form.register('email')}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-12 transition-all duration-200 hover:border-primary/50"
                placeholder="Enter your email"
                required
              />
              <AtSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
            </div>
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password
            </label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                {...form.register('password')}
                className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-12 pr-12 transition-all duration-200 hover:border-primary/50"
                placeholder="Create a strong password"
                required
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors w-5 h-5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
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
  const { error: authError, clearError } = useAuthStore()
  const locale = useLocale()

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
      {/* Left Side - Hero with Animation Background */}
      <div className="hidden lg:flex lg:flex-1 gradient-primary relative overflow-hidden">
        {/* Animated Background - Bottom Left */}
        <div className="absolute bottom-0 left-0 w-80 h-80 opacity-30">
          <div className="relative w-full h-full">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-br from-amber-300/40 to-orange-300/40 rounded-full animate-dana-float"></div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-300/40 to-amber-300/40 rounded-full particle particle-1"></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-br from-orange-300/40 to-red-300/40 rounded-full particle particle-2"></div>
            <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-gradient-to-br from-pink-300/40 to-red-300/40 rounded-full particle particle-3"></div>
            <div className="absolute bottom-1/3 left-1/3 w-24 h-24 bg-gradient-to-br from-amber-300/40 to-yellow-300/40 rounded-full animate-dana-float" style={{ animationDelay: '1.5s' }}></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
          {/* Logo and Name - with frosted glass */}
          <div className="mb-8 fade-in-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <Image
                src="/images/Gemini_Generated_Image_qul0nmqul0nmqul0.png"
                alt="Paathra"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-2">
              {locale === 'si' ? 'පාත්‍ර' : 'Paathra'}
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              {locale === 'si' ? 'ආහාර දාන වේදිකාව' : 'Food Donation Platform'}
            </p>
          </div>

          {/* Inspiring Text - with frosted glass */}
          <div className="max-w-md space-y-6 fade-in-2">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl">
              <p className="text-2xl text-gray-900 font-semibold leading-relaxed">
                {locale === 'si'
                  ? '"දානං දානානං අග්‍ගං"'
                  : '"Generosity is the highest virtue"'
                }
              </p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 shadow-xl">
              <p className="text-lg text-gray-800 leading-relaxed">
                {locale === 'si'
                  ? 'ලොව පුරා බෞද්ධ පන්සල්වලට සහාය වීමට හා දායකත්වය සැපයීමට අපව එක් කරවන්න'
                  : 'Connect with Buddhist monasteries worldwide and make a meaningful difference through your generosity'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 relative">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-4 right-4 z-20">
          <LanguageSwitcher />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile Logo and Name */}
          <div className="lg:hidden flex flex-col items-center mb-8 fade-in-1">
            <div className="relative w-20 h-20 mb-4">
              <Image
                src="/images/Gemini_Generated_Image_qul0nmqul0nmqul0.png"
                alt="Paathra"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-4xl font-bold text-primary mb-1">
              {locale === 'si' ? 'පාත්‍ර' : 'Paathra'}
            </h1>
            <p className="text-muted-foreground">
              {locale === 'si' ? 'ආහාර දාන වේදිකාව' : 'Food Donation Platform'}
            </p>
          </div>

          <Card className="p-6 sm:p-8 shadow-elegant-lg border-border/50 backdrop-blur-sm bg-white/95 fade-in-2">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-foreground">
                {isSignUp ? (locale === 'si' ? 'ගිණුමක් සාදන්න' : 'Create Account') : (locale === 'si' ? 'ඇතුළු වන්න' : 'Sign In')}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-base mt-2">
                {isSignUp
                  ? (locale === 'si' ? 'දාන සැපයීම ආරම්භ කිරීමට ඔබේ ගිණුම නිර්මාණය කරන්න' : 'Create your account to start making donations')
                  : (locale === 'si' ? 'ඔබේ ගිණුමට ප්‍රවේශ වීමට ඔබේ විස්තර ඇතුළත් කරන්න' : 'Enter your credentials to access your account')
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
              
              <div className="text-center pt-4 border-t border-border">
                <p className="text-muted-foreground mb-2">
                  {isSignUp
                    ? (locale === 'si' ? 'ගිණුමක් තිබේද?' : 'Already have an account?')
                    : (locale === 'si' ? 'ගිණුමක් නැද්ද?' : "Don't have an account?")
                  }
                </p>
                <button
                  type="button"
                  onClick={handleModeSwitch}
                  className="text-primary hover:text-primary/80 font-semibold inline-flex items-center min-h-[44px] py-2 transition-colors"
                >
                  {isSignUp
                    ? (locale === 'si' ? 'ඇතුළු වන්න' : 'Sign In')
                    : (locale === 'si' ? 'ගිණුමක් සාදන්න' : 'Sign Up')
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
