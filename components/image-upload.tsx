'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  validateImageFile, 
  compressImage, 
  formatFileSize, 
  createImagePreview,
  cleanupObjectURL 
} from '@/lib/utils/image-utils'
import { ImageUploadResult, imageUploadService, getImagePathFromUrl } from '@/lib/services/image-upload'

export interface ImageUploadProps {
  monasteryId?: string
  imageType: 'background' | 'gallery' | 'logo'
  multiple?: boolean
  maxImages?: number
  currentImages?: string[]
  onImageUploaded?: (result: ImageUploadResult) => void
  onImageRemoved?: (index: number) => void
  onImagesChanged?: (urls: string[]) => void
  className?: string
}

interface UploadingFile {
  file: File
  preview: string
  progress: number
  error?: string
}

export function ImageUpload({
  monasteryId,
  imageType,
  multiple = false,
  maxImages = 10,
  currentImages = [],
  onImageUploaded,
  onImageRemoved,
  onImagesChanged,
  className
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || !monasteryId || monasteryId === 'temp') {
      setError('Please save the monastery first before uploading images')
      return
    }

    const newFiles = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    // Validate files
    for (const file of newFiles) {
      const validation = validateImageFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    }

    if (errors.length > 0) {
      setError(errors.join(', '))
      return
    }

    // Check image limits
    const totalImages = currentImages.length + uploadingFiles.length + validFiles.length
    if (totalImages > maxImages) {
      setError(`Maximum ${maxImages} images allowed`)
      return
    }

    setError('')
    setIsUploading(true)

    // Create preview and upload
    for (const file of validFiles) {
      try {
        const preview = await createImagePreview(file)
        
        setUploadingFiles(prev => [...prev, {
          file,
          preview,
          progress: 0
        }])

        // Compress image
        const compressed = await compressImage(file, {
          maxSizeMB: 2,
          maxWidth: imageType === 'logo' ? 512 : 1920,
          maxHeight: imageType === 'logo' ? 512 : 1080
        })

        // Upload to Supabase
        const result = await imageUploadService.uploadImage(
          compressed.file,
          monasteryId,
          imageType
        )

        if ('url' in result) {
          // Success
          onImageUploaded?.(result)
          onImagesChanged?.([...currentImages, result.url])
        } else {
          // Error
          setError(result.message)
        }

        // Clean up preview URL
        cleanupObjectURL(compressed.url)
        
      } catch (error) {
        console.error('Upload error:', error)
        setError(error instanceof Error ? error.message : 'Upload failed')
      }
    }

    setUploadingFiles([])
    setIsUploading(false)
  }, [monasteryId, imageType, maxImages, currentImages, uploadingFiles, onImageUploaded, onImagesChanged])

  const handleRemoveImage = useCallback(async (index: number) => {
    const imageUrl = currentImages[index]
    if (!imageUrl) return

    try {
      // Extract path from URL
      const path = getImagePathFromUrl(imageUrl)
      console.log('Removing image:', { url: imageUrl, extractedPath: path })
      
      if (!path) {
        setError('Could not extract image path from URL')
        console.error('Failed to extract path from URL:', imageUrl)
        return
      }

      const result = await imageUploadService.deleteImage(path)
      if (!result.success) {
        setError(`Failed to remove image: ${result.error}`)
        console.error('Delete failed:', result.error)
        return
      }

      // Remove from state
      const newImages = currentImages.filter((_, i) => i !== index)
      onImageRemoved?.(index)
      onImagesChanged?.(newImages)
      setError('') // Clear any previous errors
      console.log('Image removed successfully')
    } catch (error) {
      console.error('Remove error:', error)
      setError(`Failed to remove image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [currentImages, onImageRemoved, onImagesChanged])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
  }, [handleFileSelect])

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className={className}>
      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Current Images ({currentImages.length}/{maxImages})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {currentImages.map((url, index) => (
              <Card key={index} className="relative group">
                <img 
                  src={url} 
                  alt={`${imageType} ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {(multiple || currentImages.length === 0) && currentImages.length < maxImages && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFileDialog}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              openFileDialog()
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                {multiple ? 'Drag & drop images here or click to browse' : 'Click to browse or drag & drop'}
              </p>
              <p className="text-xs mt-1">
                JPG, PNG, WEBP up to 5MB
                {imageType === 'logo' && ' (recommended: 512x512px)'}
                {imageType === 'background' && ' (recommended: 1920x1080px)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uploading Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Uploading...</h4>
          {uploadingFiles.map((file, index) => (
            <div key={index} className="flex items-center space-x-2">
              <img 
                src={file.preview} 
                alt="uploading preview"
                className="w-10 h-10 object-cover rounded"
              />
              <div className="flex-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{file.file.name}</span>
                  <span className="text-gray-500">{formatFileSize(file.file.size)}</span>
                </div>
                <Progress value={file.progress} className="h-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Limits */}
      {currentImages.length >= maxImages && (
        <Alert className="mt-4">
          <AlertDescription>
            Maximum number of images ({maxImages}) reached
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

/**
 * Single image upload component for simple use cases
 */
export function SingleImageUpload({
  onImageUploaded,
  currentImage,
  onImageRemoved,
  label = "Upload Image",
  monasteryId,
  imageType = 'background'
}: {
  onImageUploaded: (result: ImageUploadResult) => void
  currentImage?: string
  onImageRemoved?: () => void
  label?: string
  monasteryId: string
  imageType: 'background' | 'gallery' | 'logo'
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {currentImage ? (
        <div className="relative group">
          <img 
            src={currentImage} 
            alt="Current image"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <button
            type="button"
            onClick={onImageRemoved}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <ImageUpload
          monasteryId={monasteryId}
          imageType={imageType}
          multiple={false}
          maxImages={1}
          onImageUploaded={onImageUploaded}
          onImagesChanged={(urls) => urls[0] && onImageUploaded({ url: urls[0], path: '', size: 0, filename: '' })}
        />
      )}
    </div>
  )
}