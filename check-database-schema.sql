-- Check your database schema to see all available columns
-- Run this in your Supabase SQL Editor

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Also show a sample row to see the actual data structure
SELECT * FROM products LIMIT 1;


