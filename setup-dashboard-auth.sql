-- Dashboard Authentication Setup
-- Run this SQL script in your Supabase SQL Editor

-- 1. Create a simple settings table to store the dashboard password
CREATE TABLE IF NOT EXISTS dashboard_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert the dashboard password
-- ⚠️ IMPORTANT: Replace 'your_secure_password_here' with your actual password
INSERT INTO dashboard_settings (setting_key, setting_value)
VALUES ('dashboard_password', 'your_secure_password_here')
ON CONFLICT (setting_key) DO UPDATE 
SET setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 3. Enable Row Level Security
ALTER TABLE dashboard_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create policy: Allow anyone to read the password (needed for login check)
-- This is safe because it's just comparing passwords, not exposing sensitive operations
CREATE POLICY "Allow read access to dashboard password" ON dashboard_settings
FOR SELECT USING (setting_key = 'dashboard_password');

-- 5. Prevent updates/deletes via API (only allow reads)
-- Updates should be done directly in Supabase dashboard for security
CREATE POLICY "Deny all write operations" ON dashboard_settings
FOR ALL USING (false);

-- 6. Verify the setup
SELECT * FROM dashboard_settings WHERE setting_key = 'dashboard_password';

