'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase, Monastery } from '@/lib/supabase'
import { Building, Phone, Mail, Globe, MapPin, Users, CheckCircle, X } from 'lucide-react'
import { hasRole } from '@/types/auth'

const DIETARY_REQUIREMENTS = [
  'vegetarian',
  'vegan',
  'no_onion',
  'no_garlic',
  'gluten_free',
  'dairy_free',
  'halal',
  'kosher',
  'organic_only'
]

export default function ManageMonasteryPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [monastery, setMonastery] = useState<Monastery | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    capacity: 50,
    dietary_requirements: [] as string[],
    preferred_donation_times: ''
  })

  useEffect(() => {
    if (user) {
      fetchMonastery()
    }
  }, [user, profile])

  const fetchMonastery = async () => {
    if (!user) return

    setLoading(true)
    
    const { data, error } = await supabase
      .from('monasteries')
      .select('*')
      .eq('admin_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Error fetching monastery:', error)
    } else if (data) {
      setMonastery(data)
      setFormData({
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        capacity: data.capacity || 50,
        dietary_requirements: data.dietary_requirements || [],
        preferred_donation_times: data.preferred_donation_times || ''
      })
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (monastery) {
        // Update existing monastery
        const { error } = await supabase
          .from('monasteries')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', monastery.id)

        if (error) {
          setError(error.message)
        } else {
          setMessage('Monastery information updated successfully!')
          fetchMonastery()
        }
      } else {
        // Create new monastery
        const { error: monasteryError } = await supabase
          .from('monasteries')
          .insert({
            ...formData,
            admin_id: user.id
          })

        if (monasteryError) {
          setError(monasteryError.message)
        } else {
          // Update user profile to add monastery_admin role
          // First get current user types, then add monastery_admin if not already present
          const { data: currentProfile } = await supabase
            .from('user_profiles')
            .select('user_types')
            .eq('id', user.id)
            .single()

          const currentUserTypes = currentProfile?.user_types || ['donor']
          const updatedUserTypes = currentUserTypes.includes('monastery_admin') 
            ? currentUserTypes 
            : [...currentUserTypes, 'monastery_admin']

          const { error: profileError } = await supabase
            .from('user_profiles')
            .update({ user_types: updatedUserTypes })
            .eq('id', user.id)

          if (profileError) {
            setError('Monastery created but failed to update user role. Please contact support.')
          } else {
            setMessage('Monastery created successfully! You are now a monastery administrator.')
            // Refresh the profile in the auth context
            window.location.reload()
          }
        }
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleDietaryRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_requirements: prev.dietary_requirements.includes(requirement)
        ? prev.dietary_requirements.filter(req => req !== requirement)
        : [...prev.dietary_requirements, requirement]
    }))
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  // Allow access for monastery admins and users who want to create a monastery
  const canAccess = hasRole(profile, 'monastery_admin') || !monastery

  if (!canAccess && !hasRole(profile, 'monastery_admin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {monastery ? 'Manage Monastery Information' : 'Set Up Your Monastery'}
          </h1>
          <p className="text-gray-600">
            {monastery 
              ? 'Update your monastery details and preferences' 
              : 'Complete the form below to set up your monastery profile'
            }
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading monastery information...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
                <CardDescription>
                  Essential details about your monastery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Monastery Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter monastery name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (people) *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of your monastery"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Full address of the monastery"
                    rows={2}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  How donors can reach your monastery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>Phone Number</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>Email Address</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@monastery.org"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.monastery.org"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dietary Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Dietary Requirements</CardTitle>
                <CardDescription>
                  Select all dietary restrictions or preferences that apply to your monastery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIETARY_REQUIREMENTS.map((requirement) => (
                    <div
                      key={requirement}
                      onClick={() => toggleDietaryRequirement(requirement)}
                      className={`
                        cursor-pointer p-3 rounded-lg border-2 transition-colors
                        ${formData.dietary_requirements.includes(requirement)
                          ? 'border-orange-300 bg-orange-50 text-orange-800'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {requirement.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                        {formData.dietary_requirements.includes(requirement) && (
                          <CheckCircle className="w-4 h-4 text-orange-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {formData.dietary_requirements.length > 0 && (
                  <div className="mt-4">
                    <Label>Selected Requirements:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.dietary_requirements.map((req) => (
                        <Badge key={req} variant="secondary" className="px-2 py-1">
                          {req.replace('_', ' ')}
                          <button
                            type="button"
                            onClick={() => toggleDietaryRequirement(req)}
                            className="ml-2 hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Donation Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Donation Preferences</CardTitle>
                <CardDescription>
                  Let donors know your preferred donation times and any special instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="preferred_donation_times">Preferred Donation Times</Label>
                  <Textarea
                    id="preferred_donation_times"
                    value={formData.preferred_donation_times}
                    onChange={(e) => handleInputChange('preferred_donation_times', e.target.value)}
                    placeholder="e.g., Mornings 7-9 AM, Lunch 11 AM - 1 PM, Evenings 5-7 PM"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            {message && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : (monastery ? 'Update Monastery' : 'Create Monastery')}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
