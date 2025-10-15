# Supabase Database Setup Guide

This guide will help you connect your HVAC Product Dashboard to your Supabase database.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `hvac-product-dashboard`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
6. Click "Create new project"
7. Wait for the project to be ready (2-3 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 3: Set Up Environment Variables

1. In your project folder, create a `.env` file:
```bash
cp env.example .env
```

2. Edit the `.env` file and add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" to execute the script

This will create:
- ✅ `products` table with all required columns
- ✅ Indexes for better performance
- ✅ Row Level Security (RLS) policies
- ✅ Auto-updating timestamps
- ✅ Sample data (6 HVAC products)

## Step 5: Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the `products` table
3. Click on it to view the sample data
4. You should see 6 products with different categories and brands

## Step 6: Test the Dashboard

1. Make sure your development server is running:
```bash
npm run dev
```

2. Open http://localhost:5173/ in your browser
3. You should now see your products from Supabase!

## Troubleshooting

### Common Issues:

**1. "Missing Supabase environment variables" error**
- Make sure your `.env` file exists and has the correct variable names
- Restart your development server after creating the `.env` file

**2. "Failed to fetch products" error**
- Check that your Supabase URL and API key are correct
- Verify the `products` table exists in your Supabase database
- Check the browser console for detailed error messages

**3. "Permission denied" error**
- Make sure RLS policies are set up correctly
- Check that your API key has the right permissions

**4. Empty product list**
- Verify the table has data by checking the Supabase Table Editor
- Make sure the table name is exactly `products` (case-sensitive)

### Database Schema Verification:

Run this query in Supabase SQL Editor to verify your table structure:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
```

## Next Steps

Once your database is connected:

1. **Add your own products** using the dashboard
2. **Customize categories and brands** in the form
3. **Set up authentication** if needed (optional)
4. **Deploy to production** when ready

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase credentials
3. Ensure the database schema is set up correctly
4. Check the Supabase logs in your dashboard


