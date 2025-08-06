import { supabase } from '@/lib/supabase'
import { generateUniqueFilename } from '@/lib/utils/image-utils'

export interface ImageUploadResult {
  url: string
  path: string
  size: number
  filename: string
}

export interface ImageUploadError {
  message: string
  code?: string
}

export class ImageUploadService {
  private readonly bucketName: string

  constructor(bucketName: string = 'monastery-images') {
    this.bucketName = bucketName
  }

  /**
   * Upload a single image to Supabase storage
   */
  async uploadImage(
    file: File,
    monasteryId: string,
    imageType: 'background' | 'gallery' | 'logo'
  ): Promise<ImageUploadResult | ImageUploadError> {
    try {
      // Generate unique filename
      const prefix = `${monasteryId}/${imageType}/`
      const filename = generateUniqueFilename(file.name, prefix)
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        })

      if (error) {
        return { 
          message: `Upload failed: ${error.message}`, 
          code: (error as any).code 
        }
      }

      if (!data) {
        return { message: 'Upload completed but no data returned' }
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(data.path)

      return {
        url: urlData.publicUrl,
        path: data.path,
        size: file.size,
        filename: filename
      }

    } catch (error) {
      return {
        message: error instanceof Error ? error.message : 'Unknown upload error'
      }
    }
  }

  /**
   * Upload multiple images (for gallery)
   */
  async uploadMultipleImages(
    files: File[],
    monasteryId: string,
    imageType: 'gallery' = 'gallery'
  ): Promise<(Array<ImageUploadResult> | ImageUploadError)> {
    try {
      const uploadPromises = files.map(file => 
        this.uploadImage(file, monasteryId, imageType)
      )

      const results = await Promise.all(uploadPromises)

      // Check for errors
      const errors = results.filter(r => 'message' in r)
      if (errors.length > 0) {
        return { message: `${errors.length} uploads failed` }
      }

      return results as ImageUploadResult[]

    } catch (error) {
      return {
        message: error instanceof Error ? error.message : 'Unknown upload error'
      }
    }
  }

  /**
   * Delete an image from storage
   */
  async deleteImage(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([path])

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }

    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown deletion error' 
      }
    }
  }

  /**
   * Get signed URL for secure access
   */
  async getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(path, expiresIn)

      if (error) {
        console.error('Error creating signed URL:', error)
        return null
      }

      return data.signedUrl
    } catch (error) {
      console.error('Error creating signed URL:', error)
      return null
    }
  }

  /**
   * List all images for a monastery
   */
  async listMonasteryImages(monasteryId: string): Promise<ImageUploadResult[] | ImageUploadError> {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .list(`${monasteryId}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        return { message: `Failed to list images: ${error.message}` }
      }

      if (!data) {
        return []
      }

      // Get public URLs for all images
      const images = data.map(item => {
        const fullPath = `${monasteryId}/${item.name}`
        const { data: urlData } = supabase.storage
          .from(this.bucketName)
          .getPublicUrl(fullPath)

        return {
          url: urlData.publicUrl,
          path: fullPath,
          size: item.metadata?.size || 0,
          filename: item.name
        }
      })

      return images

    } catch (error) {
      return {
        message: error instanceof Error ? error.message : 'Unknown error listing images'
      }
    }
  }

  /**
   * Create a folder structure for monastery images
   */
  async ensureMonasteryFolder(monasteryId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Create empty files to establish folder structure
      const folders = ['background/', 'gallery/', 'logo/']
      
      for (const folder of folders) {
        const path = `${monasteryId}/${folder}.gitkeep`
        const emptyFile = new Blob([''], { type: 'text/plain' })
        
        await supabase.storage
          .from(this.bucketName)
          .upload(path, emptyFile, { upsert: true })
      }

      return { success: true }

    } catch (error) {
      // Folder might already exist, which is fine
      return { success: true }
    }
  }
}

// Create singleton instance
export const imageUploadService = new ImageUploadService()

// Export utility functions
export const getImageUrl = (path: string): string => {
  const { data } = supabase.storage
    .from('monastery-images')
    .getPublicUrl(path)
  
  return data.publicUrl
}

export const getImagePathFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    // Extract path after the bucket name
    // URL format: https://nosxuzuvckyqbbzpgnsl.supabase.co/storage/v1/object/public/monastery-images/[monasteryId]/[type]/[filename]
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/monastery-images\/(.+)/)
    return pathMatch ? pathMatch[1] : ''
  } catch {
    return ''
  }
}