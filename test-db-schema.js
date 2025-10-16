// Test script to check database schema and try simple insert
// Run this with: node test-db-schema.js

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://qivobmyugolhzrimfuht.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdm9ibXl1Z29saHpyaW1mdWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDk4OTIsImV4cCI6MjA3Mzk4NTg5Mn0.YNWC1ntFaJ2BCDSbbI14XRrVVr_HML9SQcX4441YqP4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabaseSchema() {
  try {
    console.log('🔍 Testing database schema and insert...\n')
    
    // 1. Check what columns exist
    console.log('1. Checking existing products to see schema...')
    const { data: existingProducts, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (fetchError) {
      console.log('❌ Error fetching existing products:', fetchError.message)
      console.log('Error details:', fetchError)
    } else {
      console.log('✅ Successfully fetched existing products')
      if (existingProducts && existingProducts.length > 0) {
        console.log('Sample product structure:')
        console.log(JSON.stringify(existingProducts[0], null, 2))
      } else {
        console.log('No existing products found')
      }
    }
    
    // 2. Try a minimal insert with only basic fields
    console.log('\n2. Trying minimal insert...')
    const minimalProduct = {
      name: 'Test Product',
      brand: 'Test Brand',
      description: 'Test Description',
      model: 'TEST-001',
      price: '$100.00 + GST'
    }
    
    console.log('Inserting minimal product:', minimalProduct)
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([minimalProduct])
      .select()
    
    if (insertError) {
      console.log('❌ Minimal insert failed:', insertError.message)
      console.log('Error code:', insertError.code)
      console.log('Error details:', insertError.details)
      console.log('Error hint:', insertError.hint)
    } else {
      console.log('✅ Minimal insert successful!')
      console.log('Inserted data:', insertData[0])
      
      // Clean up
      await supabase
        .from('products')
        .delete()
        .eq('name', 'Test Product')
      console.log('🧹 Cleaned up test data')
    }
    
    // 3. Try with the original schema from supabase-setup.sql
    console.log('\n3. Trying with original schema fields...')
    const originalSchemaProduct = {
      name: 'Test Product 2',
      brand: 'Test Brand',
      description: 'Test Description',
      model: 'TEST-002',
      price: '$200.00 + GST',
      category: 'Test Category',
      sku: 'TEST-SKU-002',
      stock_quantity: 10,
      min_stock_level: 5,
      is_active: true,
      image_url: '',
      specifications: null
    }
    
    console.log('Inserting with original schema:', originalSchemaProduct)
    
    const { data: insertData2, error: insertError2 } = await supabase
      .from('products')
      .insert([originalSchemaProduct])
      .select()
    
    if (insertError2) {
      console.log('❌ Original schema insert failed:', insertError2.message)
      console.log('Error code:', insertError2.code)
      console.log('Error details:', insertError2.details)
      console.log('Error hint:', insertError2.hint)
    } else {
      console.log('✅ Original schema insert successful!')
      console.log('Inserted data:', insertData2[0])
      
      // Clean up
      await supabase
        .from('products')
        .delete()
        .eq('name', 'Test Product 2')
      console.log('🧹 Cleaned up test data')
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testDatabaseSchema()
