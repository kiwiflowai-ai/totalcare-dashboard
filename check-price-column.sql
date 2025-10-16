-- Check the current state of your price column
-- Run this in your Supabase SQL Editor

-- 1. Check the data type of the price column
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'price';

-- 2. Check if there are any products and what the price looks like
SELECT 
  id,
  name,
  price,
  pg_typeof(price) as price_type
FROM products 
LIMIT 5;

-- 3. Check if the price column exists and what type it is
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 4. Try to insert a test value to see what happens
-- (This will help us understand the current column type)
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
) RETURNING id, name, price, pg_typeof(price) as price_type;

-- 5. Clean up the test data
DELETE FROM products WHERE name = 'Test Product';
