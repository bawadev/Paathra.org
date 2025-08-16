/**
 * Image utility functions for handling image uploads, compression, and validation
 */

export interface ImageValidationOptions {
  maxSizeMB: number
  maxWidth: number
  maxHeight: number
  allowedTypes: string[]
}

export interface CompressedImage {
  file: File
  blob: Blob
  url: string
  originalSize: number
  compressedSize: number
}

const DEFAULT_OPTIONS: ImageValidationOptions = {
  maxSizeMB: 5,
  maxWidth: 1920,
  maxHeight: 1080,
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}

/**
 * Validate image file type and size
 */
export function validateImageFile(
  file: File, 
  options: Partial<ImageValidationOptions> = {}
): { isValid: boolean; error?: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  // Check file type
  if (!opts.allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `Invalid file type. Allowed types: ${opts.allowedTypes.join(', ')}` 
    }
  }
  
  // Check file size
  const maxSizeBytes = opts.maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: `File size exceeds ${opts.maxSizeMB}MB limit` 
    }
  }
  
  return { isValid: true }
}

/**
 * Compress image using canvas
 */
export async function compressImage(
  file: File,
  options: Partial<ImageValidationOptions> = {}
): Promise<CompressedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        // Calculate dimensions while maintaining aspect ratio
        let { width, height } = img
        
        if (width > opts.maxWidth || height > opts.maxHeight) {
          const aspectRatio = width / height
          
          if (width > height) {
            width = opts.maxWidth
            height = width / aspectRatio
          } else {
            height = opts.maxHeight
            width = height * aspectRatio
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not create blob from canvas'))
              return
            }
            
            // Create new compressed file
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            
            // Create object URL for preview
            const url = URL.createObjectURL(blob)
            
            resolve({
              file: compressedFile,
              blob,
              url,
              originalSize: file.size,
              compressedSize: blob.size
            })
          },
          'image/jpeg',
          0.8 // Quality setting (0.8 = 80%)
        )
      }
      
      img.onerror = () => reject(new Error('Could not load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Clean up object URLs to prevent memory leaks
 */
export function cleanupObjectURL(url: string) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Generate a unique filename for uploads
 */
export function generateUniqueFilename(originalName: string, prefix: string = ''): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop() || 'jpg'
  
  return `${prefix}${timestamp}_${randomString}.${extension}`
}

/**
 * Get file size in readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Create image preview from file
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      resolve(e.target?.result as string)
    }
    
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}