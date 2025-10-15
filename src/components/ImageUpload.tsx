import React, { useRef, useState, useEffect } from 'react'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { useImageUpload } from '../hooks/useImageUpload'
import { useImageUploadFallback } from '../hooks/useImageUploadFallback'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface ImageUploadProps {
  value?: string
  onChange: (url: string | null) => void
  label?: string
  className?: string
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Upload Image',
  className
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const [useFallback, setUseFallback] = useState(false)
  const { uploadImage, deleteImage, uploading } = useImageUpload()
  const { uploadImageAsBase64, uploading: uploadingFallback } = useImageUploadFallback()

  // Update preview when value changes
  useEffect(() => {
    setPreview(value || null)
  }, [value])

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Create preview
    const previewUrl = URL.createObjectURL(file)
    setPreview(previewUrl)

    try {
      let uploadedUrl: string | null = null

      if (useFallback) {
        // Use Supabase upload (fallback)
        uploadedUrl = await uploadImage(file)
      } else {
        // Use base64 as primary method
        uploadedUrl = await uploadImageAsBase64(file)
        
        // If base64 fails, try Supabase as fallback
        if (!uploadedUrl) {
          console.log('Base64 conversion failed, trying Supabase upload...')
          uploadedUrl = await uploadImage(file)
          if (uploadedUrl) {
            setUseFallback(true)
            toast.success('Using Supabase storage as fallback')
          }
        }
      }

      if (uploadedUrl) {
        onChange(uploadedUrl)
        // Clean up preview URL
        URL.revokeObjectURL(previewUrl)
        setPreview(uploadedUrl)
      } else {
        // Reset preview on upload failure
        setPreview(value || null)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setPreview(value || null)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveImage = async () => {
    if (value && value.includes('supabase')) {
      await deleteImage(value)
    }
    onChange(null)
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={clsx('space-y-2', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div
        className={clsx(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative group">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                disabled={uploading}
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {(uploading || uploadingFallback) && (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{useFallback ? 'Uploading to storage...' : 'Processing image...'}</span>
              </div>
            )}
            
            <button
              type="button"
              onClick={openFileDialog}
              className="w-full px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors"
              disabled={uploading}
            >
              Change Image
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-gray-400" />
              )}
              
              <div className="text-sm text-gray-600">
                {uploading ? (
                  'Uploading...'
                ) : (
                  <>
                    <span className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer" onClick={openFileDialog}>
                      Click to upload
                    </span>
                    {' '}or drag and drop
                  </>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG, WebP up to {useFallback ? '5MB' : '3MB'}
              </p>
              
              {!useFallback && (
                <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  <AlertCircle className="w-3 h-3" />
                  <span>Using base64 encoding (recommended)</span>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setUseFallback(!useFallback)}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {useFallback ? 'Switch to base64 encoding' : 'Use Supabase storage'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
