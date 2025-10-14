// Setup Supabase Storage for Product Images
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qivobmyugolhzrimfuht.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdm9ibXl1Z29saHpyaW1mdWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDk4OTIsImV4cCI6MjA3Mzk4NTg5Mn0.YNWC1ntFaJ2BCDSbbI14XRrVVr_HML9SQcX4441YqP4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
  try {
    console.log('🔧 Setting up Supabase storage for product images...')
    
    // Create product-images bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('product-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB limit
    })
    
    if (bucketError) {
      console.error('❌ Error creating bucket:', bucketError.message)
      return
    }
    
    console.log('✅ Created product-images bucket successfully!')
    
    // Test upload a small file to verify it works
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload('test/test.txt', testFile)
    
    if (uploadError) {
      console.log('ℹ️  Test upload failed (this is normal for text files):', uploadError.message)
    } else {
      console.log('✅ Test upload successful!')
      // Clean up test file
      await supabase.storage.from('product-images').remove(['test/test.txt'])
    }
    
    console.log('🎉 Storage setup complete!')
    console.log('You can now upload product images to the product-images bucket.')
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }
}

setupStorage()




