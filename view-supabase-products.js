// Script to view products from Supabase in order
// Run this with: node view-supabase-products.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qivobmyugolhzrimfuht.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdm9ibXl1Z29saHpyaW1mdWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDk4OTIsImV4cCI6MjA3Mzk4NTg5Mn0.YNWC1ntFaJ2BCDSbbI14XRrVVr_HML9SQcX4441YqP4'

const supabase = createClient(supabaseUrl, supabaseKey)

async function viewProducts() {
  try {
    console.log('📊 Fetching products from Supabase...\n')
    
    // Fetch products without any ordering (natural table order)
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, brand, model, price, created_at')
    
    if (error) {
      console.log('❌ Error fetching products:', error.message)
      return
    }
    
    console.log(`✅ Found ${products.length} products in natural table order:\n`)
    console.log('═══════════════════════════════════════════════════════════════')
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Brand: ${product.brand}`)
      console.log(`   Model: ${product.model}`)
      console.log(`   Price: ${product.price}`)
      console.log(`   Created: ${new Date(product.created_at).toLocaleString()}`)
      console.log('───────────────────────────────────────────────────────────────')
    })
    
    console.log('\n📝 This is the order that will appear in your dashboard.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

viewProducts()
