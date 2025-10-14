import { useState } from 'react'
import toast from 'react-hot-toast'

export const useImageUploadFallback = () => {
  const [uploading, setUploading] = useState(false)

  const uploadImageAsBase64 = async (file: File): Promise<string | null> => {
    try {
      setUploading(true)

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast.error('Please upload a valid image file (JPEG, PNG, or WebP)')
        return null
      }

      // Validate file size (3MB limit for base64)
      if (file.size > 3 * 1024 * 1024) {
        toast.error('Image size must be less than 3MB for base64 encoding')
        return null
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          const result = e.target?.result
          if (typeof result === 'string') {
            console.log('Base64 conversion successful')
            toast.success('Image processed successfully!')
            resolve(result)
          } else {
            reject(new Error('Failed to convert image to base64'))
          }
        }
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'))
        }
        
        reader.readAsDataURL(file)
      })

    } catch (error) {
      console.error('Base64 conversion error:', error)
      toast.error('Failed to process image. Please try again.')
      return null
    } finally {
      setUploading(false)
    }
  }

  return {
    uploadImageAsBase64,
    uploading
  }
}


