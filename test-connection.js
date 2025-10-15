// Quick test to verify Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qivobmyugolhzrimfuht.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdm9ibXl1Z29saHpyaW1mdWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDk4OTIsImV4cCI6MjA3Mzk4NTg5Mn0.YNWC1ntFaJ2BCDSbbI14XRrVVr_HML9SQcX4441YqP4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...')
    
    // Test 1: Check if we can connect
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      return
    }
    
    console.log('✅ Connection successful!')
    
    // Test 2: Get product count
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Count query failed:', countError.message)
      return
    }
    
    console.log(`📊 Found ${count} products in your database`)
    
    // Test 3: Get sample products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, brand, price')
      .limit(3)
    
    if (productsError) {
      console.error('❌ Products query failed:', productsError.message)
      return
    }
    
    console.log('📦 Sample products:')
    products.forEach(product => {
      console.log(`  - ${product.name} (${product.brand}) - $${product.price}`)
    })
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }
}

testConnection()


