import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qivobmyugolhzrimfuht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdm9ibXl1Z29saHpyaW1mdWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDk4OTIsImV4cCI6MjA3Mzk4NTg5Mn0.YNWC1ntFaJ2BCDSbbI14XRrVVr_HML9SQcX4441YqP4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function addWarrantyColumn() {
  console.log('Adding warranty column to products table...')
  
  // Note: The anon key doesn't have permissions to ALTER TABLE
  // We need to use the SQL query through the Supabase API
  const { data, error } = await supabase.rpc('exec_sql', {
    query: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty TEXT;'
  })
  
  if (error) {
    console.error('Error adding warranty column:', error)
    console.log('\n⚠️  The anon key does not have permissions to alter the table schema.')
    console.log('You need to run this SQL in your Supabase SQL Editor:')
    console.log('\nALTER TABLE products ADD COLUMN IF NOT EXISTS warranty TEXT;')
  } else {
    console.log('✅ Warranty column added successfully!')
    console.log('Data:', data)
  }
  
  // Let's check the current columns
  console.log('\nChecking current products table structure...')
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .limit(1)
  
  if (fetchError) {
    console.error('Error fetching products:', fetchError)
  } else {
    console.log('\nCurrent columns in products table:')
    if (products && products.length > 0) {
      console.log(Object.keys(products[0]))
    } else {
      console.log('No products found to check columns')
    }
  }
}

addWarrantyColumn()

