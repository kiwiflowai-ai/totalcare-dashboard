-- Verify your products table structure
-- Run this in your Supabase SQL Editor to check if your table matches the expected schema

-- Check if products table exists and has the right columns
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check if you have any products
SELECT COUNT(*) as total_products FROM products;

-- Show a sample of your products
SELECT 
  id, 
  name, 
  category, 
  brand, 
  price, 
  stock_quantity,
  is_active
FROM products 
LIMIT 5;


