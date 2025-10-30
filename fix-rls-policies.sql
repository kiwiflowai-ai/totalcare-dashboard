-- Fix Row Level Security policies to allow anonymous read access
-- This will allow the dashboard to display products without authentication

-- 1. Drop existing restrictive policy
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all operations for all users" ON products;

-- 2. Create policy to allow public read access (anyone can view products)
CREATE POLICY "Allow public read access" ON products
FOR SELECT USING (true);

-- 3. Create policy to allow public insert (for adding products)
CREATE POLICY "Allow public insert" ON products
FOR INSERT WITH CHECK (true);

-- 4. Create policy to allow public update (for editing products)
CREATE POLICY "Allow public update" ON products
FOR UPDATE USING (true);

-- 5. Create policy to allow public delete (for deleting products)
CREATE POLICY "Allow public delete" ON products
FOR DELETE USING (true);

-- 6. Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'products';

-- 7. Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'products' AND schemaname = 'public';

