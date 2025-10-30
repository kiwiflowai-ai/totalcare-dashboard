-- Optimize Database Performance for Products Table
-- Run this in your Supabase SQL Editor to dramatically speed up queries

-- 1. Check current indexes
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'products';

-- 2. Add missing indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_updated_at ON products(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_brand_name ON products(brand, name);

-- 3. Add GIN indexes for JSON fields (if you search/filter by product_images or promotions)
CREATE INDEX IF NOT EXISTS idx_products_product_images_gin ON products USING GIN (product_images);
CREATE INDEX IF NOT EXISTS idx_products_promotions_gin ON products USING GIN (promotions);

-- 4. Analyze the table to update statistics
ANALYZE products;

-- 5. Check table size and bloat
SELECT 
    pg_size_pretty(pg_total_relation_size('products')) as total_size,
    pg_size_pretty(pg_relation_size('products')) as table_size,
    pg_size_pretty(pg_indexes_size('products')) as indexes_size;

-- 6. Verify indexes were created
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename = 'products'
ORDER BY indexname;

