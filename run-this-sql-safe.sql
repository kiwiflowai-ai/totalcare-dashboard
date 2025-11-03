-- Dashboard Authentication Setup (Safe Version - No DROP statements)
-- This version is completely safe - no destructive operations

-- 1. Create table
CREATE TABLE IF NOT EXISTS dashboard_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert or update password
INSERT INTO dashboard_settings (setting_key, setting_value)
VALUES ('dashboard_password', 'Dashboard123!')
ON CONFLICT (setting_key) DO UPDATE 
SET setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 3. Enable Row Level Security
ALTER TABLE dashboard_settings ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies (only if they don't exist)
-- First, try to create them - if they exist, we'll get an error but that's okay
DO $$
BEGIN
  -- Create read policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'dashboard_settings' 
    AND policyname = 'Allow read access to dashboard password'
  ) THEN
    CREATE POLICY "Allow read access to dashboard password" ON dashboard_settings
    FOR SELECT USING (setting_key = 'dashboard_password');
  END IF;

  -- Create write deny policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'dashboard_settings' 
    AND policyname = 'Deny all write operations'
  ) THEN
    CREATE POLICY "Deny all write operations" ON dashboard_settings
    FOR ALL USING (false);
  END IF;
EXCEPTION
  WHEN duplicate_object THEN
    -- Policies already exist, that's fine
    NULL;
END $$;

-- 5. Verify setup
SELECT * FROM dashboard_settings WHERE setting_key = 'dashboard_password';

