import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WebP)')
      return null
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return null
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    console.log('Attempting to upload to:', filePath)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error details:', error)
      
      // If RLS error, try a different approach
      if (error.message.includes('row-level security') || error.message.includes('policy')) {
        toast.error('Storage permissions issue. Please check your Supabase storage policies.')
        console.log('RLS Policy Error - You need to run the fix-storage-policies.sql script in your Supabase SQL Editor')
      } else {
        toast.error(`Upload failed: ${error.message}`)
      }
      return null
    }

    console.log('Upload successful:', data)

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product images')
      .getPublicUrl(filePath)

    console.log('Public URL generated:', urlData.publicUrl)

    toast.success('Image uploaded successfully!')
    return urlData.publicUrl

  } catch (error) {
    console.error('Upload error:', error)
    toast.error('Failed to upload image. Please try again.')
    return null
  }
}

export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract file path from URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const filePath = pathParts.slice(pathParts.indexOf('product%20images') + 1).join('/')

    const { error } = await supabase.storage
      .from('product images')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete image')
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}
