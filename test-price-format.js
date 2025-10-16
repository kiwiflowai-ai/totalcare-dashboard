// Test script to verify price format in Supabase
// Run this with: node test-price-format.js

const { createClient } = require('@supabase/supabase-js')

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPriceFormat() {
  try {
    console.log('Testing price format in Supabase...')
    
    // Test inserting a product with formatted price
    const testProduct = {
      name: 'Test Product',
      brand: 'Test Brand',
      description: 'Test Description',
      model: 'TEST-001',
      price: '$300.00 + GST', // This should be saved exactly as this string
      price_numeric: 300.00,
      gst_amount: 30.00,
      price_with_gst: 330.00,
      cooling_capacity: 'Test Capacity',
      heating_capacity: 'Test Heating',
      has_wifi: false,
      series: 'Test Series',
      image: '',
      product_images: [],
      promotions: null
    }
    
    console.log('Inserting test product with price:', testProduct.price)
    
    const { data, error } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
    
    if (error) {
      console.error('Error inserting product:', error)
      return
    }
    
    console.log('Product inserted successfully!')
    console.log('Saved price in database:', data[0].price)
    
    // Verify the price format
    if (data[0].price === '$300.00 + GST') {
      console.log('✅ SUCCESS: Price is saved correctly as "$300.00 + GST"')
    } else {
      console.log('❌ ERROR: Price format is incorrect. Expected "$300.00 + GST", got:', data[0].price)
    }
    
    // Clean up test data
    await supabase
      .from('products')
      .delete()
      .eq('name', 'Test Product')
    
    console.log('Test product cleaned up.')
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

testPriceFormat()
