-- Fix Row Level Security policies for product images storage bucket
-- Run this in your Supabase SQL Editor

-- 1. Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Create policy to allow public read access to product images
CREATE POLICY "Public read access for product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product images');

-- 3. Create policy to allow public insert/upload to product images
CREATE POLICY "Public insert access for product images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product images');

-- 4. Create policy to allow public update to product images
CREATE POLICY "Public update access for product images" ON storage.objects
FOR UPDATE USING (bucket_id = 'product images');

-- 5. Create policy to allow public delete from product images
CREATE POLICY "Public delete access for product images" ON storage.objects
FOR DELETE USING (bucket_id = 'product images');

-- 6. Alternative: If you want to allow all operations for all users (more permissive)
-- Uncomment the following lines if the above doesn't work:

-- DROP POLICY IF EXISTS "Public read access for product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public insert access for product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public update access for product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public delete access for product images" ON storage.objects;

-- CREATE POLICY "Allow all operations for all users" ON storage.objects
-- FOR ALL USING (true);

-- 7. Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';




