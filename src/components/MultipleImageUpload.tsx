import React, { useRef, useState, useEffect } from 'react'
import { X, Loader2, Plus } from 'lucide-react'
import { useImageUploadFallback } from '../hooks/useImageUploadFallback'
import clsx from 'clsx'

interface MultipleImageUploadProps {
  value?: string[]
  onChange: (images: string[]) => void
  label?: string
  className?: string
  maxImages?: number
}

export const MultipleImageUpload: React.FC<MultipleImageUploadProps> = ({
  value = [],
  onChange,
  label = 'Product Images',
  className,
  maxImages = 6
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const { uploadImageAsBase64, uploading } = useImageUploadFallback()

  // Ensure value is always an array
  const images = Array.isArray(value) ? value : []
  

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return

    const newImages: string[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Check if we've reached the max limit
      if (images.length + newImages.length >= maxImages) {
        break
      }

      try {
        const base64Image = await uploadImageAsBase64(file)
        if (base64Image) {
          newImages.push(base64Image)
        }
      } catch (error) {
        console.error('Error processing image:', error)
      }
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages]
      console.log('🔍 MultipleImageUpload: Adding images:', newImages.length)
      console.log('🔍 MultipleImageUpload: Total images after add:', updatedImages.length)
      onChange(updatedImages)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      handleFileSelect(files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

    const files = e.dataTransfer.files
    if (files) {
      handleFileSelect(files)
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    console.log('🔍 MultipleImageUpload: Removing image at index:', index)
    console.log('🔍 MultipleImageUpload: Remaining images:', newImages.length)
    onChange(newImages)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const canAddMore = images.length < maxImages

  return (
    <div className={clsx('space-y-4', className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label} ({images.length}/{maxImages})
      </label>
      
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">Current Images ({images.length})</h4>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
            >
              Remove All
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 shadow-lg"
                  title={`Remove image ${index + 1}`}
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
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
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="text-center">
            <div className="flex flex-col items-center space-y-2">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              ) : (
                <Plus className="w-8 h-8 text-gray-400" />
              )}
              
              <div className="text-sm text-gray-600">
                {uploading ? (
                  'Processing images...'
                ) : (
                  <>
                    <span className="font-medium text-primary-600 hover:text-primary-500 cursor-pointer" onClick={openFileDialog}>
                      Click to add images
                    </span>
                    {' '}or drag and drop
                  </>
                )}
              </div>
              
              <p className="text-xs text-gray-500">
                PNG, JPG, JPEG, WebP up to 3MB each
              </p>
              <p className="text-xs text-gray-500">
                You can select multiple images at once
              </p>
            </div>
          </div>
        </div>
      )}

      {!canAddMore && (
        <div className="text-center text-sm text-gray-500 py-4">
          Maximum {maxImages} images reached
        </div>
      )}
    </div>
  )
}
