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
        .order('created_at', { ascending: false })

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

      const productWithId = {
        ...productData,
        id: generateId(productData.name, productData.brand, productData.model)
      }


      const { data, error } = await supabase
        .from('products')
        .insert([productWithId])
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
        
        setProducts(prev => [processedProduct, ...prev])
        toast.success('Product added successfully!')
        return processedProduct
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product'
      toast.error(errorMessage)
      throw err
    }
  }

  const updateProduct = async (productData: UpdateProductData) => {
    try {
      const { id, ...updateData } = productData
      
      
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
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
