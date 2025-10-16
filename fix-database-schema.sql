-- Fix database schema to match the application requirements
-- Run this in your Supabase SQL Editor

-- 1. First, let's see what columns currently exist
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Add missing columns if they don't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_numeric DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_with_gst DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS cooling_capacity TEXT,
ADD COLUMN IF NOT EXISTS heating_capacity TEXT,
ADD COLUMN IF NOT EXISTS has_wifi BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS series TEXT,
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS product_images JSONB,
ADD COLUMN IF NOT EXISTS promotions JSONB;

-- 3. Make sure price column is TEXT (not DECIMAL)
-- First, add a new price_text column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_text TEXT;

-- Migrate existing price data to text format
UPDATE products 
SET price_text = '$' || price::TEXT || ' + GST'
WHERE price_text IS NULL AND price IS NOT NULL;

-- Make price_text NOT NULL
ALTER TABLE products 
ALTER COLUMN price_text SET NOT NULL;

-- Drop the old price column and rename price_text to price
ALTER TABLE products DROP COLUMN IF EXISTS price;
ALTER TABLE products RENAME COLUMN price_text TO price;

-- 4. Make sure we have the required fields for the app
-- Add any missing required fields
ALTER TABLE products 
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN brand SET NOT NULL,
ALTER COLUMN description SET NOT NULL,
ALTER COLUMN model SET NOT NULL,
ALTER COLUMN price SET NOT NULL;

-- 5. Create a function to calculate GST
CREATE OR REPLACE FUNCTION calculate_gst(price_value DECIMAL)
RETURNS TABLE(
  gst_amount DECIMAL(10,2),
  price_with_gst DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY SELECT 
    ROUND(price_value * 0.10, 2) as gst_amount,
    ROUND(price_value * 1.10, 2) as price_with_gst;
END;
$$ LANGUAGE plpgsql;

-- 6. Create a trigger to automatically calculate GST when price is updated
CREATE OR REPLACE FUNCTION update_price_gst()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract numeric value from price string and calculate GST
  IF NEW.price IS NOT NULL THEN
    NEW.price_numeric := CAST(REGEXP_REPLACE(NEW.price, '[^0-9.]', '', 'g') AS DECIMAL);
    NEW.gst_amount := ROUND(NEW.price_numeric * 0.10, 2);
    NEW.price_with_gst := ROUND(NEW.price_numeric * 1.10, 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for automatic GST calculation
DROP TRIGGER IF EXISTS trigger_update_price_gst ON products;
CREATE TRIGGER trigger_update_price_gst
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_price_gst();

-- 8. Update existing records with calculated values
UPDATE products 
SET 
  price_numeric = CAST(REGEXP_REPLACE(price, '[^0-9.]', '', 'g') AS DECIMAL),
  gst_amount = ROUND(CAST(REGEXP_REPLACE(price, '[^0-9.]', '', 'g') AS DECIMAL) * 0.10, 2),
  price_with_gst = ROUND(CAST(REGEXP_REPLACE(price, '[^0-9.]', '', 'g') AS DECIMAL) * 1.10, 2)
WHERE price_numeric IS NULL;

-- 9. Verify the final schema
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 10. Test insert
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
) RETURNING id, name, price, price_numeric, gst_amount, price_with_gst;

-- 11. Clean up test data
DELETE FROM products WHERE name = 'Test Product';
