const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qivobmyugolhzrimfuht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdm9ibXl1Z29saHpyaW1mdWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDk4OTIsImV4cCI6MjA3Mzk4NTg5Mn0.YNWC1ntFaJ2BCDSbbI14XRrVVr_HML9SQcX4441YqP4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
  console.log('🔍 DASHBOARD DIAGNOSTIC REPORT');
  console.log('═══════════════════════════════════════════════════\n');

  // Test 1: Basic connection
  console.log('1️⃣  Testing Supabase Connection...');
  try {
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) {
      console.log('   ❌ Connection error:', error.message);
      console.log('   Code:', error.code);
    } else {
      console.log('   ✅ Connection successful');
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  // Test 2: Count products
  console.log('\n2️⃣  Counting Products...');
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log('   ❌ Error counting:', error.message);
    } else {
      console.log('   ✅ Total products:', count);
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  // Test 3: Fetch sample products (simulating dashboard query)
  console.log('\n3️⃣  Fetching Products (Dashboard Query)...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true })
      .limit(3);
    
    if (error) {
      console.log('   ❌ Fetch error:', error.message);
      console.log('   Details:', error);
    } else {
      console.log('   ✅ Fetched', data.length, 'products');
      if (data.length > 0) {
        console.log('   Sample product:');
        console.log('   - ID:', data[0].id);
        console.log('   - Name:', data[0].name);
        console.log('   - Brand:', data[0].brand);
        console.log('   - Price:', data[0].price);
      }
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  // Test 4: Check for JSON parsing issues
  console.log('\n4️⃣  Checking Product Data Structure...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('product_images')
      .limit(5);
    
    if (error) {
      console.log('   ❌ Error:', error.message);
    } else {
      console.log('   ✅ Checked product_images field');
      let jsonStringCount = 0;
      let arrayCount = 0;
      let nullCount = 0;
      
      data.forEach(p => {
        if (p.product_images === null) nullCount++;
        else if (typeof p.product_images === 'string') jsonStringCount++;
        else if (Array.isArray(p.product_images)) arrayCount++;
      });
      
      console.log('   - JSON strings:', jsonStringCount);
      console.log('   - Arrays:', arrayCount);
      console.log('   - Null:', nullCount);
    }
  } catch (err) {
    console.log('   ❌ Exception:', err.message);
  }

  // Test 5: Check RLS policies
  console.log('\n5️⃣  Checking RLS Policies...');
  try {
    const { data, error } = await supabase
      .rpc('exec_sql', { 
        sql_query: `SELECT schemaname, tablename, policyname, permissive, cmd 
                    FROM pg_policies 
                    WHERE tablename = 'products' AND schemaname = 'public'` 
      });
    
    if (error) {
      console.log('   ⚠️  Cannot check policies directly (requires admin)');
    } else {
      console.log('   ✅ RLS Policies:', data);
    }
  } catch (err) {
    console.log('   ⚠️  Cannot check policies:', err.message);
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 DIAGNOSIS COMPLETE\n');
  console.log('💡 NEXT STEPS:');
  console.log('   1. Open http://localhost:5173 in your browser');
  console.log('   2. Open browser DevTools (F12)');
  console.log('   3. Check Console tab for errors');
  console.log('   4. Check Network tab for failed requests');
  console.log('   5. Look for any CORS or fetch errors\n');
}

diagnose();

