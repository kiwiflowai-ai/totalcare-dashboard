-- Add warranty column to products table
-- Run this in your Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS warranty TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name = 'warranty';

-- Optional: Add a comment to the column
COMMENT ON COLUMN products.warranty IS 'Product warranty information (e.g., 5 Years, 10 Years Parts & Labour)';

