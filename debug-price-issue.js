// Debug script to check what's happening with the price column
// Run this with: node debug-price-issue.js

const { createClient } = require('@supabase/supabase-js')

// You need to replace these with your actual Supabase credentials
const supabaseUrl = 'YOUR_SUPABASE_URL'  // Replace with your actual URL
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'  // Replace with your actual anon key

const supabase = createClient(supabaseUrl, supabaseKey)

async function debugPriceIssue() {
  try {
    console.log('🔍 Debugging price column issue...\n')
    
    // 1. Check the current table structure
    console.log('1. Checking table structure...')
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'products' })
      .catch(async () => {
        // Fallback: try to get sample data to see structure
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(1)
        return { data: data ? [Object.keys(data[0] || {})] : [], error }
      })
    
    if (columnError) {
      console.log('❌ Error getting table structure:', columnError.message)
    } else {
      console.log('✅ Table structure:', columns)
    }
    
    // 2. Check existing data
    console.log('\n2. Checking existing products...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, price_numeric, gst_amount, price_with_gst')
      .limit(5)
    
    if (productsError) {
      console.log('❌ Error fetching products:', productsError.message)
    } else {
      console.log('✅ Found products:', products?.length || 0)
      if (products && products.length > 0) {
        console.log('Sample product data:')
        products.forEach((product, index) => {
          console.log(`  Product ${index + 1}:`)
          console.log(`    ID: ${product.id}`)
          console.log(`    Name: ${product.name}`)
          console.log(`    Price: "${product.price}" (type: ${typeof product.price})`)
          console.log(`    Price Numeric: ${product.price_numeric}`)
          console.log(`    GST Amount: ${product.gst_amount}`)
          console.log(`    Price with GST: ${product.price_with_gst}`)
          console.log('')
        })
      }
    }
    
    // 3. Test inserting a new product
    console.log('3. Testing product insertion...')
    const testProduct = {
      name: 'Debug Test Product',
      brand: 'Debug Brand',
      description: 'Testing price format',
      model: 'DEBUG-001',
      price: '$299.99 + GST', // This should be saved as text
      price_numeric: 299.99,
      gst_amount: 29.99,
      price_with_gst: 329.98,
      cooling_capacity: 'Test',
      heating_capacity: 'Test',
      has_wifi: false,
      series: 'Test',
      image: '',
      product_images: [],
      promotions: null
    }
    
    console.log('Inserting test product with price:', testProduct.price)
    
    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select()
    
    if (insertError) {
      console.log('❌ Error inserting product:', insertError.message)
      console.log('Error details:', insertError)
    } else {
      console.log('✅ Product inserted successfully!')
      console.log('Inserted product data:')
      console.log(`  Price: "${insertData[0].price}" (type: ${typeof insertData[0].price})`)
      console.log(`  Price Numeric: ${insertData[0].price_numeric}`)
      console.log(`  GST Amount: ${insertData[0].gst_amount}`)
      console.log(`  Price with GST: ${insertData[0].price_with_gst}`)
      
      // Check if the price format is correct
      if (insertData[0].price === '$299.99 + GST') {
        console.log('✅ SUCCESS: Price format is correct!')
      } else {
        console.log('❌ ISSUE: Price format is wrong!')
        console.log(`Expected: "$299.99 + GST"`)
        console.log(`Got: "${insertData[0].price}"`)
      }
      
      // Clean up test data
      await supabase
        .from('products')
        .delete()
        .eq('name', 'Debug Test Product')
      
      console.log('🧹 Test data cleaned up.')
    }
    
    // 4. Check if the price column is DECIMAL or TEXT
    console.log('\n4. Checking price column data type...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('products')
      .select('price')
      .limit(1)
    
    if (sampleError) {
      console.log('❌ Error getting sample data:', sampleError.message)
    } else if (sampleData && sampleData.length > 0) {
      const priceValue = sampleData[0].price
      console.log(`Price value: "${priceValue}"`)
      console.log(`Type: ${typeof priceValue}`)
      
      if (typeof priceValue === 'number') {
        console.log('❌ ISSUE: Price column is still DECIMAL type!')
        console.log('You need to run the database migration script.')
      } else if (typeof priceValue === 'string') {
        console.log('✅ Price column is TEXT type - migration worked!')
      }
    }
    
  } catch (error) {
    console.error('❌ Debug script failed:', error)
  }
}

// Instructions for the user
console.log('🔧 PRICE DEBUG SCRIPT')
console.log('====================')
console.log('')
console.log('Before running this script:')
console.log('1. Replace YOUR_SUPABASE_URL with your actual Supabase URL')
console.log('2. Replace YOUR_SUPABASE_ANON_KEY with your actual anon key')
console.log('3. Make sure you have @supabase/supabase-js installed: npm install @supabase/supabase-js')
console.log('4. Run: node debug-price-issue.js')
console.log('')
console.log('This will help us identify what\'s wrong with your price column.')
console.log('')

debugPriceIssue()
