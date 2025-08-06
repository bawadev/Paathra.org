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
import { ImageUpload } from '@/components/image-upload'
import { imageUploadService } from '@/lib/services/image-upload'
import { Building, Phone, Mail, Globe, MapPin, Users, CheckCircle, X, Image as ImageIcon } from 'lucide-react'
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
    portfolio_description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    capacity: 50,
    monk_count: 0,
    established_year: 1900,
    tradition: '',
    background_image_url: '',
    gallery_images: [] as string[],
    avatar_url: '',
    dietary_requirements: [] as string[],
    preferred_donation_times: '',
    facilities: [] as string[],
    rules_guidelines: '',
    contact_person_name: '',
    contact_person_role: '',
    daily_schedule: {
      morning: '',
      afternoon: '',
      evening: ''
    },
    social_media: {
      facebook: '',
      twitter: '',
      instagram: ''
    }
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
        portfolio_description: data.portfolio_description || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        capacity: data.capacity || 50,
        monk_count: data.monk_count || 0,
        established_year: data.established_year || 1900,
        tradition: data.tradition || '',
        background_image_url: data.background_image_url || '',
        gallery_images: data.gallery_images || [],
        avatar_url: data.avatar_url || '',
        dietary_requirements: data.dietary_requirements || [],
        preferred_donation_times: data.preferred_donation_times || '',
        facilities: data.facilities || [],
        rules_guidelines: data.rules_guidelines || '',
        contact_person_name: data.contact_person_name || '',
        contact_person_role: data.contact_person_role || '',
        daily_schedule: data.daily_schedule || {
          morning: '',
          afternoon: '',
          evening: ''
        },
        social_media: data.social_media || {
          facebook: '',
          twitter: '',
          instagram: ''
        }
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
      let monasteryId: string

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
          setSaving(false)
          return
        }

        monasteryId = monastery.id
        setMessage('Monastery information updated successfully!')
      } else {
        // Create new monastery
        const { data: newMonastery, error: monasteryError } = await supabase
          .from('monasteries')
          .insert({
            ...formData,
            admin_id: user.id
          })
          .select()
          .single()

        if (monasteryError) {
          setError(monasteryError.message)
          setSaving(false)
          return
        }

        monasteryId = newMonastery.id

        // Update user profile to add monastery_admin role
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
          setSaving(false)
          return
        }

        setMessage('Monastery created successfully! You are now a monastery administrator.')
      }

      // Ensure storage folder structure exists
      await imageUploadService.ensureMonasteryFolder(monasteryId)
      
      if (!monastery) {
        // Refresh to get new monastery ID for image uploads
        setTimeout(() => {
          fetchMonastery()
        }, 1000)
      } else {
        fetchMonastery()
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

            {/* Portfolio Information */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Information</CardTitle>
                <CardDescription>
                  Detailed information for your monastery portfolio page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="established_year">Established Year</Label>
                    <Input
                      id="established_year"
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={formData.established_year}
                      onChange={(e) => handleInputChange('established_year', parseInt(e.target.value))}
                      placeholder="1900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tradition">Buddhist Tradition</Label>
                    <Input
                      id="tradition"
                      value={formData.tradition}
                      onChange={(e) => handleInputChange('tradition', e.target.value)}
                      placeholder="Theravada, Mahayana, etc."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monk_count">Number of Monks</Label>
                    <Input
                      id="monk_count"
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.monk_count}
                      onChange={(e) => handleInputChange('monk_count', parseInt(e.target.value))}
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolio_description">Detailed Description</Label>
                  <Textarea
                    id="portfolio_description"
                    value={formData.portfolio_description}
                    onChange={(e) => handleInputChange('portfolio_description', e.target.value)}
                    placeholder="Detailed description for your monastery portfolio page..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5" />
                  <span>Images</span>
                </CardTitle>
                <CardDescription>
                  Upload photos for your monastery portfolio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Monastery Logo/Avatar */}
                <div className="space-y-2">
                  <Label>Monastery Logo/Avatar</Label>
                  <ImageUpload
                    monasteryId={monastery?.id || 'temp'}
                    imageType="logo"
                    multiple={false}
                    maxImages={1}
                    currentImages={formData.avatar_url ? [formData.avatar_url] : []}
                    onImageUploaded={(result) => handleInputChange('avatar_url', result.url)}
                    onImagesChanged={(urls) => handleInputChange('avatar_url', urls[0] || '')}
                    onImageRemoved={() => handleInputChange('avatar_url', '')}
                  />
                </div>

                {/* Background Image */}
                <div className="space-y-2">
                  <Label>Background Image</Label>
                  <ImageUpload
                    monasteryId={monastery?.id || 'temp'}
                    imageType="background"
                    multiple={false}
                    maxImages={1}
                    currentImages={formData.background_image_url ? [formData.background_image_url] : []}
                    onImageUploaded={(result) => handleInputChange('background_image_url', result.url)}
                    onImagesChanged={(urls) => handleInputChange('background_image_url', urls[0] || '')}
                    onImageRemoved={() => handleInputChange('background_image_url', '')}
                  />
                </div>

                {/* Gallery Images */}
                <div className="space-y-2">
                  <Label>Gallery Images</Label>
                  <ImageUpload
                    monasteryId={monastery?.id || 'temp'}
                    imageType="gallery"
                    multiple={true}
                    maxImages={10}
                    currentImages={formData.gallery_images}
                    onImageUploaded={(result) => {
                      const newGallery = [...formData.gallery_images, result.url]
                      handleInputChange('gallery_images', newGallery)
                    }}
                    onImagesChanged={(urls) => handleInputChange('gallery_images', urls)}
                    onImageRemoved={(index) => {
                      const newGallery = formData.gallery_images.filter((_, i) => i !== index)
                      handleInputChange('gallery_images', newGallery)
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Person */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Person</CardTitle>
                <CardDescription>
                  Primary contact for monastery inquiries
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person_name">Full Name</Label>
                    <Input
                      id="contact_person_name"
                      value={formData.contact_person_name}
                      onChange={(e) => handleInputChange('contact_person_name', e.target.value)}
                      placeholder="Ven. Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_person_role">Role/Title</Label>
                    <Input
                      id="contact_person_role"
                      value={formData.contact_person_role}
                      onChange={(e) => handleInputChange('contact_person_role', e.target.value)}
                      placeholder="Abbot, Secretary, etc."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Facilities</CardTitle>
                <CardDescription>
                  Available facilities at your monastery
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="facilities">Facilities (comma-separated)</Label>
                  <Textarea
                    id="facilities"
                    value={formData.facilities.join(', ')}
                    onChange={(e) => handleInputChange('facilities', 
                      e.target.value.split(',').map(facility => facility.trim()).filter(facility => facility)
                    )}
                    placeholder="Meditation hall, library, guest house, dining hall, etc."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Daily Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Daily Schedule</CardTitle>
                <CardDescription>
                  Typical daily routine at the monastery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="morning_schedule">Morning Schedule</Label>
                  <Textarea
                    id="morning_schedule"
                    value={formData.daily_schedule.morning}
                    onChange={(e) => handleInputChange('daily_schedule', {
                      ...formData.daily_schedule,
                      morning: e.target.value
                    })}
                    placeholder="4:30 AM - Morning chanting, 6:00 AM - Breakfast..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="afternoon_schedule">Afternoon Schedule</Label>
                  <Textarea
                    id="afternoon_schedule"
                    value={formData.daily_schedule.afternoon}
                    onChange={(e) => handleInputChange('daily_schedule', {
                      ...formData.daily_schedule,
                      afternoon: e.target.value
                    })}
                    placeholder="12:00 PM - Lunch, 1:00 PM - Rest period..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evening_schedule">Evening Schedule</Label>
                  <Textarea
                    id="evening_schedule"
                    value={formData.daily_schedule.evening}
                    onChange={(e) => handleInputChange('daily_schedule', {
                      ...formData.daily_schedule,
                      evening: e.target.value
                    })}
                    placeholder="5:00 PM - Evening chanting, 6:00 PM - Dinner..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rules & Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Rules & Guidelines</CardTitle>
                <CardDescription>
                  Important rules and guidelines for visitors and donors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="rules_guidelines">Rules and Guidelines</Label>
                  <Textarea
                    id="rules_guidelines"
                    value={formData.rules_guidelines}
                    onChange={(e) => handleInputChange('rules_guidelines', e.target.value)}
                    placeholder="Dress code, visiting hours, donation guidelines..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>
                  Links to your monastery's social media profiles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.social_media.facebook}
                    onChange={(e) => handleInputChange('social_media', {
                      ...formData.social_media,
                      facebook: e.target.value
                    })}
                    placeholder="https://facebook.com/monastery"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.social_media.twitter}
                    onChange={(e) => handleInputChange('social_media', {
                      ...formData.social_media,
                      twitter: e.target.value
                    })}
                    placeholder="https://twitter.com/monastery"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.social_media.instagram}
                    onChange={(e) => handleInputChange('social_media', {
                      ...formData.social_media,
                      instagram: e.target.value
                    })}
                    placeholder="https://instagram.com/monastery"
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
