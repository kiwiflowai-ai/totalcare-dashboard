// Debug script to identify why "Failed to add product" error occurs
// Run this with: node debug-add-product.js

const { createClient } = require('@supabase/supabase-js')

// Replace with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL'  // Replace with your actual URL
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'  // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugAddProduct() {
  try {
    console.log('🔍 Debugging "Failed to add product" error...\n')
    
    // 1. Check database connection
    console.log('1. Testing database connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.log('❌ Database connection failed:', connectionError.message)
      console.log('Error details:', connectionError)
      return
    }
    console.log('✅ Database connection successful')
    
    // 2. Check table structure
    console.log('\n2. Checking table structure...')
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'products' })
      .catch(async () => {
        // Fallback: get sample data to see structure
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(1)
        return { data: data ? [Object.keys(data[0] || {})] : [], error }
      })
    
    if (columnError) {
      console.log('❌ Error getting table structure:', columnError.message)
    } else {
      console.log('✅ Table structure available')
    }
    
    // 3. Test with minimal product data
    console.log('\n3. Testing with minimal product data...')
    const minimalProduct = {
      name: 'Test Product Debug',
      brand: 'Test Brand',
      description: 'Test Description',
      model: 'TEST-DEBUG-001',
      price: '$100.00 + GST',
      price_numeric: 100.00,
      gst_amount: 10.00,
      price_with_gst: 110.00,
      cooling_capacity: 'Test',
      heating_capacity: 'Test',
      has_wifi: false,
      series: 'Test',
      image: '',
      product_images: [],
      promotions: null
    }
    
    console.log('Attempting to insert minimal product...')
    console.log('Product data:', JSON.stringify(minimalProduct, null, 2))
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([minimalProduct])
      .select()
    
    if (insertError) {
      console.log('❌ Insert failed with error:', insertError.message)
      console.log('Error code:', insertError.code)
      console.log('Error details:', insertError)
      console.log('Error hint:', insertError.hint)
      
      // Check for common issues
      if (insertError.code === '23505') {
        console.log('🔍 Issue: Duplicate key violation - ID already exists')
      } else if (insertError.code === '23502') {
        console.log('🔍 Issue: Not null violation - required field is missing')
      } else if (insertError.code === '42501') {
        console.log('🔍 Issue: Permission denied - check RLS policies')
      } else if (insertError.code === 'PGRST116') {
        console.log('🔍 Issue: Column not found - check table schema')
      }
    } else {
      console.log('✅ Minimal product inserted successfully!')
      console.log('Inserted data:', insertData[0])
      
      // Clean up test data
      await supabase
        .from('products')
        .delete()
        .eq('name', 'Test Product Debug')
      console.log('🧹 Test data cleaned up')
    }
    
    // 4. Test with ID generation (like the actual app does)
    console.log('\n4. Testing with ID generation...')
    const generateId = (name, brand, model) => {
      return `${brand.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${model.toLowerCase()}`.replace(/-+/g, '-').replace(/^-|-$/g, '')
    }
    
    const testId = generateId('Test Product Debug 2', 'Test Brand', 'TEST-DEBUG-002')
    console.log('Generated ID:', testId)
    
    const productWithId = {
      ...minimalProduct,
      id: testId,
      name: 'Test Product Debug 2',
      model: 'TEST-DEBUG-002'
    }
    
    const { data: insertData2, error: insertError2 } = await supabase
      .from('products')
      .insert([productWithId])
      .select()
    
    if (insertError2) {
      console.log('❌ Insert with ID failed:', insertError2.message)
      console.log('Error details:', insertError2)
    } else {
      console.log('✅ Product with ID inserted successfully!')
      
      // Clean up test data
      await supabase
        .from('products')
        .delete()
        .eq('name', 'Test Product Debug 2')
      console.log('🧹 Test data cleaned up')
    }
    
    // 5. Check for RLS policies
    console.log('\n5. Checking RLS policies...')
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'products' })
      .catch(() => ({ data: null, error: { message: 'Cannot check policies directly' } }))
    
    if (policyError) {
      console.log('⚠️  Cannot check RLS policies directly:', policyError.message)
      console.log('💡 Make sure RLS policies allow INSERT operations')
    } else {
      console.log('✅ RLS policies checked')
    }
    
    // 6. Test with actual form data format
    console.log('\n6. Testing with actual form data format...')
    const formData = {
      name: 'Real Test Product',
      brand: 'Real Brand',
      description: 'Real Description',
      model: 'REAL-001',
      price: '$250.00 + GST',
      price_numeric: 250.00,
      gst_amount: 25.00,
      price_with_gst: 275.00,
      cooling_capacity: '5kW',
      heating_capacity: '6kW',
      has_wifi: true,
      series: 'Premium',
      image: '',
      product_images: [],
      promotions: null
    }
    
    const realId = generateId(formData.name, formData.brand, formData.model)
    const realProduct = {
      ...formData,
      id: realId
    }
    
    console.log('Testing with real form data...')
    console.log('Generated ID:', realId)
    
    const { data: realInsertData, error: realInsertError } = await supabase
      .from('products')
      .insert([realProduct])
      .select()
    
    if (realInsertError) {
      console.log('❌ Real form data insert failed:', realInsertError.message)
      console.log('Error details:', realInsertError)
    } else {
      console.log('✅ Real form data inserted successfully!')
      
      // Clean up test data
      await supabase
        .from('products')
        .delete()
        .eq('name', 'Real Test Product')
      console.log('🧹 Test data cleaned up')
    }
    
  } catch (error) {
    console.error('❌ Debug script failed:', error)
  }
}

// Instructions for the user
console.log('🔧 ADD PRODUCT DEBUG SCRIPT')
console.log('============================')
console.log('')
console.log('Before running this script:')
console.log('1. Replace YOUR_SUPABASE_URL with your actual Supabase URL')
console.log('2. Replace YOUR_SUPABASE_ANON_KEY with your actual anon key')
console.log('3. Make sure you have @supabase/supabase-js installed: npm install @supabase/supabase-js')
console.log('4. Run: node debug-add-product.js')
console.log('')
console.log('This will help identify why you\'re getting "Failed to add product" error.')
console.log('')

debugAddProduct()
