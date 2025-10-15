# 📸 Supabase Image Management Guide

This guide shows you how to view and manage product images in your Supabase dashboard.

## 🗂️ **Image Storage Structure**

Your product images are stored in two places:

### 1. **Database Columns** (in `products` table)
- `image` - Main product image URL
- `cover_image` - Cover image URL  
- `product_images` - Array of additional image URLs

### 2. **Storage Bucket** (if using Supabase Storage)
- Bucket name: `product images`
- Files stored as: `products/{timestamp}-{random}.{extension}`

## 🔍 **How to View Images in Supabase Dashboard**

### **Method 1: View in Database Table**
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → **products**
3. Look at these columns:
   - `image` - Main product image
   - `cover_image` - Cover image
   - `product_images` - JSON array of additional images

### **Method 2: View in Storage Browser**
1. Go to **Storage** in your Supabase dashboard
2. Click on the **`product images`** bucket
3. Browse through the `products/` folder
4. Click on any image to view it full-size

### **Method 3: Query Images with SQL**
Run this query in the **SQL Editor**:

```sql
-- View all products with their image information
SELECT 
  id,
  name,
  brand,
  image,
  cover_image,
  product_images,
  CASE 
    WHEN image IS NOT NULL THEN 1 ELSE 0 
  END + 
  CASE 
    WHEN cover_image IS NOT NULL THEN 1 ELSE 0 
  END + 
  COALESCE(array_length(product_images, 1), 0) as total_images
FROM products
ORDER BY total_images DESC;
```

### **Method 4: Count Images by Type**
```sql
-- Count images by type across all products
SELECT 
  COUNT(*) as total_products,
  COUNT(image) as products_with_main_image,
  COUNT(cover_image) as products_with_cover_image,
  COUNT(CASE WHEN product_images IS NOT NULL AND array_length(product_images, 1) > 0 THEN 1 END) as products_with_additional_images
FROM products;
```

## 🖼️ **Image URL Types**

### **Base64 Images** (Recommended)
- Format: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...`
- Stored directly in database columns
- No external storage needed
- Faster loading, no broken links

### **Supabase Storage URLs**
- Format: `https://your-project.supabase.co/storage/v1/object/public/product%20images/products/1234567890-abc123.jpg`
- Stored in Supabase Storage bucket
- Requires proper RLS policies
- Can be cached and optimized

## 🔧 **Troubleshooting Images**

### **If Images Don't Load:**
1. Check if the URL is valid
2. For Supabase Storage: Verify RLS policies
3. For Base64: Check if the data is complete

### **If You See "No Images":**
1. Check the `product_images` column - it might be `null` or empty array `[]`
2. Verify the image URLs are not broken
3. Check if images were uploaded successfully

## 📊 **Dashboard Features**

Your dashboard now shows:
- **Image Count Badge** - Total images across all products
- **Dedicated Images Column** - Shows main, cover, and additional images
- **Image Gallery Modal** - Click to view all images for a product
- **Visual Indicators** - Clear labels for each image type

## 🚀 **Quick Actions**

### **View All Images for a Product:**
1. In the dashboard, find the product
2. Click the blue grid icon button in the Images column
3. View all images in a beautiful gallery

### **Edit Product Images:**
1. Click the Edit button (pencil icon)
2. See current images in the form
3. Add/remove images as needed
4. Save changes

### **Check Image Status:**
- Green checkmarks show which images are set
- Image counters show how many images each product has
- "No images" appears for products without any images

## 💡 **Pro Tips**

1. **Use Base64 for small images** (< 3MB) - faster and more reliable
2. **Use Supabase Storage for large images** - better performance
3. **Check the Images column** to quickly see what each product has
4. **Use the gallery modal** to view all images at once
5. **Monitor the Total Images stat** to track your image inventory

---

**Need Help?** Check the dashboard's image management features or refer to this guide for viewing images in Supabase.

