# HVAC Product Dashboard

A modern, responsive product management dashboard for HVAC electricians built with React, TypeScript, and Supabase.

## Features

- 📦 **Product Management**: Add, edit, delete, and view HVAC products
- 📊 **Dashboard Analytics**: View inventory statistics and stock levels
- 🔍 **Search & Filter**: Find products by name, SKU, category, or brand
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- ⚡ **Real-time Updates**: Live data synchronization with Supabase
- 🎨 **Modern UI**: Clean, professional interface with Tailwind CSS

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **State Management**: React Hooks
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Copy the environment file:
```bash
cp env.example .env
```

2. Update `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Supabase Database

Create a `products` table in your Supabase database with the following schema:

```sql
CREATE TABLE products (
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

-- Create an index for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (adjust based on your needs)
CREATE POLICY "Enable all operations for all users" ON products
FOR ALL USING (true);
```

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Adding Products

1. Click the "Add Product" button
2. Fill in the product details:
   - **Name**: Product name
   - **Description**: Detailed description
   - **Category**: HVAC category (Air Conditioning, Heating, etc.)
   - **Brand**: Manufacturer brand
   - **Model**: Model number
   - **SKU**: Stock Keeping Unit
   - **Price**: Product price
   - **Stock Quantity**: Current inventory
   - **Min Stock Level**: Reorder threshold
   - **Image URL**: Optional product image
3. Click "Add Product" to save

### Managing Products

- **Search**: Use the search bar to find products by name, SKU, or model
- **Filter**: Filter by category or brand using the filter dropdowns
- **Sort**: Click column headers to sort by different fields
- **Edit**: Click the edit icon to modify product details
- **Delete**: Click the delete icon to remove products (with confirmation)

### Dashboard Analytics

The dashboard shows:
- Total number of products
- Total inventory value
- Low stock alerts
- Active vs inactive products

## Project Structure

```
src/
├── components/          # React components
│   ├── ProductForm.tsx     # Add/Edit product form
│   ├── ProductTable.tsx    # Product listing table
│   ├── DeleteConfirmModal.tsx # Delete confirmation
│   └── StatsCards.tsx      # Dashboard statistics
├── hooks/              # Custom React hooks
│   └── useProducts.ts      # Product data management
├── lib/                # Utility libraries
│   └── supabase.ts         # Supabase client
├── types/              # TypeScript type definitions
│   └── product.ts          # Product data types
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Customization

### Adding New Product Categories

Edit the `categories` array in `src/components/ProductForm.tsx`:

```typescript
const categories = [
  'Air Conditioning Units',
  'Heating Systems',
  'Ventilation',
  'Ductwork',
  'Thermostats',
  'Filters',
  'Tools & Equipment',
  'Parts & Accessories',
  'Your New Category', // Add here
  'Other'
]
```

### Adding New Brands

Edit the `brands` array in `src/components/ProductForm.tsx`:

```typescript
const brands = [
  'Carrier',
  'Trane',
  'Lennox',
  'Rheem',
  'Goodman',
  'York',
  'American Standard',
  'Daikin',
  'Mitsubishi',
  'Your New Brand', // Add here
  'Other'
]
```

## Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Deploy to Vercel/Netlify

1. Connect your repository to Vercel or Netlify
2. Set the environment variables in your deployment platform
3. Deploy!

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**: Verify your environment variables are correct
2. **Build Errors**: Make sure all dependencies are installed with `npm install`
3. **TypeScript Errors**: Run `npm run lint` to check for issues

### Getting Help

- Check the browser console for error messages
- Verify your Supabase table schema matches the expected structure
- Ensure your Supabase RLS policies allow the operations you need

## License

This project is private and proprietary.