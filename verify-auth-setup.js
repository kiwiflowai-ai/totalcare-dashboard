// Verify Dashboard Authentication Setup
// Run this with: node verify-auth-setup.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qivobmyugolhzrimfuht.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpdm9ibXl1Z29saHpyaW1mdWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MDk4OTIsImV4cCI6MjA3Mzk4NTg5Mn0.YNWC1ntFaJ2BCDSbbI14XRrVVr_HML9SQcX4441YqP4'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyAuthSetup() {
  console.log('🔍 Verifying Dashboard Authentication Setup...\n')

  try {
    // Check if dashboard_settings table exists
    console.log('1. Checking if dashboard_settings table exists...')
    const { data, error } = await supabase
      .from('dashboard_settings')
      .select('*')
      .eq('setting_key', 'dashboard_password')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Table not found! You need to run the SQL script first.')
        console.log('   → Go to Supabase Dashboard → SQL Editor')
        console.log('   → Run: setup-dashboard-auth.sql')
        return
      }
      
      if (error.code === '42P01') {
        console.log('❌ Table "dashboard_settings" does not exist!')
        console.log('   → Run the setup-dashboard-auth.sql script in Supabase SQL Editor')
        return
      }
      
      console.error('❌ Error:', error.message)
      return
    }

    if (!data) {
      console.log('❌ No password found in dashboard_settings table!')
      console.log('   → Run the setup-dashboard-auth.sql script to insert the password')
      return
    }

    console.log('✅ Table exists and password is set!')
    console.log('   Setting Key:', data.setting_key)
    console.log('   Password Length:', data.setting_value ? data.setting_value.length : 0, 'characters')
    console.log('   Created:', new Date(data.created_at).toLocaleString())
    console.log('   Updated:', new Date(data.updated_at).toLocaleString())

    // Test password check (without revealing the actual password)
    console.log('\n2. Testing password retrieval...')
    const { data: testData, error: testError } = await supabase
      .from('dashboard_settings')
      .select('setting_value')
      .eq('setting_key', 'dashboard_password')
      .single()

    if (testError) {
      console.log('❌ Cannot retrieve password:', testError.message)
      console.log('   → Check your RLS policies')
      return
    }

    if (testData && testData.setting_value) {
      console.log('✅ Password can be retrieved successfully!')
      console.log('   → Authentication should work in the dashboard')
    } else {
      console.log('❌ Password value is empty!')
      console.log('   → Update the password in Supabase Table Editor')
    }

    console.log('\n✅ Setup verification complete!')
    console.log('\n📝 Next steps:')
    console.log('   1. Make sure your password is set correctly in the database')
    console.log('   2. Try logging in to your dashboard with that password')
    console.log('   3. If you need to change the password, update it in Supabase Table Editor')

  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
  }
}

verifyAuthSetup()

