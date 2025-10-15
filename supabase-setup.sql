-- HVAC Product Dashboard - Supabase Database Setup
-- Run this SQL script in your Supabase SQL Editor

-- 1. Create the products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for data access
-- Allow all operations for authenticated users (adjust based on your needs)
CREATE POLICY "Enable all operations for authenticated users" ON products
FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: Allow all operations for everyone (for testing)
-- CREATE POLICY "Enable all operations for all users" ON products
-- FOR ALL USING (true);

-- 5. Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Insert sample data (optional - remove if you have your own data)
INSERT INTO products (name, description, price, category, brand, model, sku, stock_quantity, min_stock_level, is_active, image_url) VALUES
('Carrier Infinity 19VS Air Conditioner', 'High-efficiency variable speed air conditioner with advanced humidity control and quiet operation.', 3200.00, 'Air Conditioning Units', 'Carrier', '24VNA9', 'CAR-24VNA9-001', 15, 5, true, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
('Trane XR16 Heat Pump', 'Energy-efficient heat pump with up to 16 SEER rating, perfect for moderate climates.', 2800.00, 'Heating Systems', 'Trane', '4TWR6016', 'TRA-4TWR6016-001', 8, 3, true, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
('Lennox Elite Series Furnace', 'High-efficiency gas furnace with variable-speed blower motor and quiet operation.', 2400.00, 'Heating Systems', 'Lennox', 'EL296V', 'LEN-EL296V-001', 2, 4, true, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
('Honeywell T6 Pro Thermostat', 'Smart programmable thermostat with Wi-Fi connectivity and energy-saving features.', 180.00, 'Thermostats', 'Honeywell', 'TH6220WF2006', 'HON-TH6220WF2006-001', 25, 10, true, null),
('Rheem Performance Plus Water Heater', 'High-efficiency electric water heater with 50-gallon capacity and 6-year warranty.', 650.00, 'Heating Systems', 'Rheem', 'RE50T06', 'RHE-RE50T06-001', 0, 2, false, 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop'),
('MERV 13 Air Filter 20x25x1', 'High-efficiency air filter that captures 90% of particles 1-3 microns in size.', 24.99, 'Filters', 'Generic', 'MERV13-20x25x1', 'FIL-MERV13-20x25x1-001', 50, 20, true, null);

-- 8. Verify the table was created correctly
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;


