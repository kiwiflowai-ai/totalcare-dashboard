-- Fix the price column to store formatted price strings like "$300 + GST"
-- Run this SQL script in your Supabase SQL Editor

-- 1. First, add a new price_text column to store the formatted price
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_text TEXT;

-- 2. Migrate existing price data to the new format
UPDATE products 
SET price_text = '$' || price::TEXT || ' + GST'
WHERE price_text IS NULL;

-- 3. Make price_text NOT NULL and drop the old price column
ALTER TABLE products 
ALTER COLUMN price_text SET NOT NULL;

-- 4. Drop the old price column (DECIMAL type)
ALTER TABLE products 
DROP COLUMN IF EXISTS price;

-- 5. Rename price_text to price
ALTER TABLE products 
RENAME COLUMN price_text TO price;

-- 6. Add other useful columns for price calculations
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_numeric DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_with_gst DECIMAL(10,2);

-- 7. Create a function to extract numeric value from formatted price
CREATE OR REPLACE FUNCTION extract_price_numeric(price_string TEXT)
RETURNS DECIMAL AS $$
BEGIN
  -- Extract numeric value from strings like "$300 + GST"
  RETURN CAST(REGEXP_REPLACE(price_string, '[^0-9.]', '', 'g') AS DECIMAL);
END;
$$ LANGUAGE plpgsql;

-- 8. Update existing records with calculated values
UPDATE products 
SET 
  price_numeric = extract_price_numeric(price),
  gst_amount = ROUND(extract_price_numeric(price) * 0.10, 2),
  price_with_gst = ROUND(extract_price_numeric(price) * 1.10, 2)
WHERE price_numeric IS NULL;

-- 9. Create a trigger to automatically calculate GST when price is updated
CREATE OR REPLACE FUNCTION update_price_calculations()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract numeric value and calculate GST
  NEW.price_numeric := extract_price_numeric(NEW.price);
  NEW.gst_amount := ROUND(NEW.price_numeric * 0.10, 2);
  NEW.price_with_gst := ROUND(NEW.price_numeric * 1.10, 2);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for automatic calculations
DROP TRIGGER IF EXISTS trigger_update_price_calculations ON products;
CREATE TRIGGER trigger_update_price_calculations
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_price_calculations();

-- 11. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('price', 'price_numeric', 'gst_amount', 'price_with_gst')
ORDER BY ordinal_position;

-- 12. Show sample data
SELECT id, name, price, price_numeric, gst_amount, price_with_gst 
FROM products 
LIMIT 5;
