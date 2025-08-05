'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Navigation } from '@/components/navigation'
import { AuthForm } from '@/components/auth-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AvatarUpload } from '@/components/avatar-upload'
import { useTranslations } from 'next-intl'
import { hasRole } from '@/types/auth'
import { useRouter } from '@/src/i18n/navigation'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || ''
  })
  const [loading, setLoading] = useState(false)
  const t = useTranslations('Profile')
  const router = useRouter()

  if (!user) {
    return <AuthForm />
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await updateProfile(formData)
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      address: profile?.address || ''
    })
    setEditing(false)
  }

  const handleAvatarUpload = (url: string) => {
    // Avatar is automatically updated via the AvatarUpload component
    console.log('Avatar uploaded:', url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('title')}</h1>
          
          <div className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profilePicture')}</CardTitle>
                <CardDescription>{t('profilePictureDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarUpload onUploadComplete={handleAvatarUpload} size="lg" />
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{t('basicInfo')}</CardTitle>
                    <CardDescription>{t('basicInfoDesc')}</CardDescription>
                  </div>
                  {!editing && (
                    <Button 
                      variant="outline" 
                      onClick={() => setEditing(true)}
                    >
                      {t('edit')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input 
                    id="email" 
                    value={profile?.email || ''} 
                    disabled 
                    className="bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">{t('fullName')}</Label>
                  <Input 
                    id="full_name" 
                    value={formData.full_name} 
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('phone')}</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!editing}
                    placeholder={t('phonePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t('address')}</Label>
                  <Textarea 
                    id="address" 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!editing}
                    placeholder={t('addressPlaceholder')}
                    rows={3}
                  />
                </div>

                {editing && (
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      {t('cancel')}
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? t('saving') : t('save')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('accountInfo')}</CardTitle>
                <CardDescription>{t('accountInfoDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('userRole')}</Label>
                  <div className="text-sm text-gray-600">
                    {profile?.user_types?.map(role => t(`roles.${role}`)).join(', ')}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('accountCreated')}</Label>
                  <div className="text-sm text-gray-600">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}