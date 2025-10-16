-- Quick database test to check if products table is working
-- Run this in your Supabase SQL Editor

-- 1. Check if products table exists and get its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Check if there are any existing products
SELECT COUNT(*) as total_products FROM products;

-- 3. Try to insert a simple test product
INSERT INTO products (
  name, 
  brand, 
  description, 
  model, 
  price
) VALUES (
  'Test Product', 
  'Test Brand', 
  'Test Description', 
  'TEST-001', 
  '$100.00 + GST'
) RETURNING id, name, price;

-- 4. Clean up the test data
DELETE FROM products WHERE name = 'Test Product';

-- 5. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'products';
