import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qivobmyugolhzrimfuht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdm9ibXl1Z29saHpyaW1mdWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDk4OTIsImV4cCI6MjA3Mzk4NTg5Mn0.YNWC1ntFaJ2BCDSbbI14XRrVVr_HML9SQcX4441YqP4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkWarrantyColumn() {
  console.log('🔍 Checking for warranty column in products table...\n')
  
  // Fetch a product to see all columns
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('❌ Error fetching products:', error)
    return
  }
  
  if (products && products.length > 0) {
    const columns = Object.keys(products[0])
    console.log('📋 All columns in products table:')
    columns.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col}`)
    })
    
    console.log('\n🔎 Checking for warranty column...')
    if (columns.includes('warranty')) {
      console.log('✅ WARRANTY COLUMN EXISTS!')
      console.log(`   Value: ${products[0].warranty || '(null/empty)'}`)
    } else {
      console.log('❌ WARRANTY COLUMN NOT FOUND')
      console.log('\n⚠️  Please add the warranty column using Supabase SQL Editor:')
      console.log('   ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty TEXT;')
    }
  } else {
    console.log('⚠️  No products found in the table')
  }
  
  // Also try to specifically select warranty to see if it exists
  console.log('\n🧪 Testing direct warranty column access...')
  const { data: testData, error: testError } = await supabase
    .from('products')
    .select('id, name, warranty')
    .limit(3)
  
  if (testError) {
    console.error('❌ Error accessing warranty column:', testError.message)
    if (testError.message.includes('warranty')) {
      console.log('   → Warranty column does NOT exist in database')
    }
  } else {
    console.log('✅ Successfully accessed warranty column!')
    console.log('\nSample products with warranty:')
    testData.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}: ${p.warranty || '(no warranty set)'}`)
    })
  }
}

checkWarrantyColumn()

