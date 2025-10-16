-- Update the products table to store price as text with $ sign and add GST fields
-- Run this SQL script in your Supabase SQL Editor

-- 1. Add new columns for price handling
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_text TEXT,
ADD COLUMN IF NOT EXISTS price_numeric DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_with_gst DECIMAL(10,2);

-- 2. Migrate existing price data to new format
UPDATE products 
SET 
  price_text = '$' || price::TEXT,
  price_numeric = price,
  gst_amount = ROUND(price * 0.10, 2), -- 10% GST
  price_with_gst = ROUND(price * 1.10, 2)
WHERE price_text IS NULL;

-- 3. Make price_text the primary price field and make price_numeric optional
ALTER TABLE products 
ALTER COLUMN price_text SET NOT NULL;

-- 4. Create a function to calculate GST
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

-- 5. Create a trigger to automatically calculate GST when price is updated
CREATE OR REPLACE FUNCTION update_price_gst()
RETURNS TRIGGER AS $$
BEGIN
  -- If price_numeric is updated, calculate GST and update price_text
  IF NEW.price_numeric IS NOT NULL THEN
    NEW.gst_amount := ROUND(NEW.price_numeric * 0.10, 2);
    NEW.price_with_gst := ROUND(NEW.price_numeric * 1.10, 2);
    NEW.price_text := '$' || NEW.price_numeric::TEXT;
  END IF;
  
  -- If price_text is updated, extract numeric value and calculate GST
  IF NEW.price_text IS NOT NULL AND NEW.price_numeric IS NULL THEN
    NEW.price_numeric := CAST(REPLACE(NEW.price_text, '$', '') AS DECIMAL);
    NEW.gst_amount := ROUND(NEW.price_numeric * 0.10, 2);
    NEW.price_with_gst := ROUND(NEW.price_numeric * 1.10, 2);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for automatic GST calculation
DROP TRIGGER IF EXISTS trigger_update_price_gst ON products;
CREATE TRIGGER trigger_update_price_gst
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_price_gst();

-- 7. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('price', 'price_text', 'price_numeric', 'gst_amount', 'price_with_gst')
ORDER BY ordinal_position;
