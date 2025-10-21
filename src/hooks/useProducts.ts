import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Product, CreateProductData, UpdateProductData } from '../types/product'
import toast from 'react-hot-toast'

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true })

      if (error) throw error
      
      // Parse product_images if they're stored as JSON strings
      const processedData = (data || []).map(product => ({
        ...product,
        product_images: typeof product.product_images === 'string' 
          ? JSON.parse(product.product_images) 
          : product.product_images
      }))
      
      setProducts(processedData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const addProduct = async (productData: CreateProductData) => {
    try {
      // Generate a unique ID based on the product name and brand
      const generateId = (name: string, brand: string, model: string) => {
        return `${brand.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${model.toLowerCase()}`.replace(/-+/g, '-').replace(/^-|-$/g, '')
      }

      // Only include fields that exist in the database
      const productWithId = {
        id: generateId(productData.name, productData.brand, productData.model),
        name: productData.name,
        brand: productData.brand,
        description: productData.description,
        model: productData.model,
        price: productData.price,
        // Only include these if they exist in the database
        ...(productData.cooling_capacity && { cooling_capacity: productData.cooling_capacity }),
        ...(productData.heating_capacity && { heating_capacity: productData.heating_capacity }),
        ...(productData.has_wifi !== undefined && { has_wifi: productData.has_wifi }),
        ...(productData.series && { series: productData.series }),
        ...(productData.warranty && { warranty: productData.warranty }),
        ...(productData.image && { image: productData.image }),
        ...(productData.product_images && { product_images: productData.product_images }),
        ...(productData.promotions && { promotions: productData.promotions })
      }


      console.log('Attempting to insert product:', productWithId)
      
      const { data, error } = await supabase
        .from('products')
        .insert([productWithId])
        .select()

      if (error) {
        console.error('Supabase insert error:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      if (data && data[0]) {
        // Parse product_images if they're stored as JSON strings
        const processedProduct = {
          ...data[0],
          product_images: typeof data[0].product_images === 'string' 
            ? JSON.parse(data[0].product_images) 
            : data[0].product_images
        }
        
        setProducts(prev => [processedProduct, ...prev])
        toast.success('Product added successfully!')
        return processedProduct
      }
    } catch (err) {
      console.error('Add product error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product'
      console.error('Error message:', errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }

  const updateProduct = async (productData: UpdateProductData) => {
    try {
      const { id, ...updateData } = productData
      
      // Only include fields that exist in the database
      const safeUpdateData = {
        name: updateData.name,
        brand: updateData.brand,
        description: updateData.description,
        model: updateData.model,
        price: updateData.price,
        // Only include these if they exist in the database
        ...(updateData.cooling_capacity && { cooling_capacity: updateData.cooling_capacity }),
        ...(updateData.heating_capacity && { heating_capacity: updateData.heating_capacity }),
        ...(updateData.has_wifi !== undefined && { has_wifi: updateData.has_wifi }),
        ...(updateData.series && { series: updateData.series }),
        ...(updateData.warranty && { warranty: updateData.warranty }),
        ...(updateData.image && { image: updateData.image }),
        ...(updateData.product_images && { product_images: updateData.product_images }),
        ...(updateData.promotions && { promotions: updateData.promotions })
      }
      
      const { data, error } = await supabase
        .from('products')
        .update(safeUpdateData)
        .eq('id', id)
        .select()

      if (error) throw error

      if (data && data[0]) {
        // Parse product_images if they're stored as JSON strings
        const processedProduct = {
          ...data[0],
          product_images: typeof data[0].product_images === 'string' 
            ? JSON.parse(data[0].product_images) 
            : data[0].product_images
        }
        
        setProducts(prev => 
          prev.map(product => 
            product.id === id ? processedProduct : product
          )
        )
        toast.success('Product updated successfully!')
        return processedProduct
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product'
      toast.error(errorMessage)
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProducts(prev => prev.filter(product => product.id !== id))
      toast.success('Product deleted successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
      toast.error(errorMessage)
      throw err
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts
  }
}
