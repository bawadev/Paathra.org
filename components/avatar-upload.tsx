'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { Upload, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AvatarUploadProps {
  onUploadComplete?: (url: string) => void
  size?: 'sm' | 'md' | 'lg'
  showUploadButton?: boolean
}

export function AvatarUpload({ 
  onUploadComplete, 
  size = 'md',
  showUploadButton = true 
}: AvatarUploadProps) {
  const { profile, updateProfile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const t = useTranslations('Profile')

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update user profile
      await updateProfile({ avatar_url: publicUrl })
      
      if (onUploadComplete) {
        onUploadComplete(publicUrl)
      }

    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    try {
      setUploading(true)
      
      // Remove from storage if URL exists
      if (profile?.avatar_url) {
        const url = new URL(profile.avatar_url)
        const path = url.pathname.split('/').slice(2).join('/')
        
        await supabase.storage
          .from('avatars')
          .remove([path])
      }

      // Update profile
      await updateProfile({ avatar_url: null })
      
      if (onUploadComplete) {
        onUploadComplete('')
      }

    } catch (error) {
      console.error('Error removing avatar:', error)
      alert('Error removing image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
          <AvatarFallback>
            {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      {showUploadButton && (
        <div className="flex flex-col space-y-2 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            id="avatar-upload"
            disabled={uploading}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('avatar-upload')?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {t('uploadPhoto')}
          </Button>
          
          {profile?.avatar_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={uploading}
            >
              {t('removePhoto')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}