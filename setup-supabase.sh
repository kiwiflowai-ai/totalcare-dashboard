#!/bin/bash

echo "🚀 HVAC Product Dashboard - Supabase Setup"
echo "=========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created from template"
else
    echo "⚠️  .env file already exists"
fi

echo ""
echo "📋 Next steps:"
echo "1. Get your Supabase credentials from https://supabase.com"
echo "2. Edit the .env file with your Supabase URL and API key"
echo "3. Run the SQL script in your Supabase SQL Editor"
echo "4. Restart the development server"
echo ""
echo "📖 See SUPABASE_SETUP.md for detailed instructions"


