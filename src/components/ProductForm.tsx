import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Save, Loader2, Image } from 'lucide-react'
import { Product, CreateProductData, UpdateProductData } from '../types/product'
import { ImageUpload } from './ImageUpload'
import { MultipleImageUpload } from './MultipleImageUpload'
import clsx from 'clsx'

interface ProductFormProps {
  product?: Product | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<void>
  loading?: boolean
}

const brands = [
  'Daikin',
  'Haire',
  'LG',
  'MHI',
  'Midea',
  'Mitsubishi',
  'Panasonic',
  'Samsung'
]

const series = [
  'Standard',
  'Cora',
  'New Cora',
  'Alira',
  'Lite',
  'Aura',
  'Zena',
  'Aurora',
  'Ciara',
  'AI Smart AIRISE WindFree™',
  'AI windfree',
  'AP',
  'GS',
  'Pinnacle',
  'Quartz',
  'DELUXE',
  'Developer',
  'Aero',
  'Other'
]

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [productImages, setProductImages] = useState<string[]>([])
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
    watch
  } = useForm<CreateProductData>({
    defaultValues: {
      name: '',
      brand: '',
      description: '',
      model: '',
      price: 0,
      price_numeric: 0,
      cooling_capacity: 0,
      heating_capacity: 0,
      has_wifi: false,
      series: '',
      image: null,
      product_images: [],
      promotions: []
    }
  })

  // Update form fields when state changes
  useEffect(() => {
    setValue('product_images', productImages)
  }, [productImages, setValue])

  useEffect(() => {
    setValue('image', imageUrl)
  }, [imageUrl, setValue])

  useEffect(() => {
    if (product) {
      
      reset({
        name: product.name,
        brand: product.brand,
        description: product.description,
        model: product.model,
        price: product.price,
        price_numeric: product.price_numeric || 0,
        cooling_capacity: product.cooling_capacity || '',
        heating_capacity: product.heating_capacity || '',
        has_wifi: product.has_wifi || false,
        series: product.series || '',
        image: product.image || null,
        product_images: product.product_images || [],
        promotions: product.promotions || []
      })
      setImageUrl(product.image || null)
      setProductImages(Array.isArray(product.product_images) ? product.product_images : [])
    } else {
      reset({
        name: '',
        brand: '',
        description: '',
        model: '',
        price: 0,
        price_numeric: 0,
        cooling_capacity: '',
        heating_capacity: '',
        has_wifi: false,
        series: '',
        image: null,
        product_images: [],
        promotions: []
      })
      setImageUrl(null)
      setProductImages([])
    }
  }, [product, reset])

  const handleFormSubmit = async (data: CreateProductData) => {
    try {
      setIsSubmitting(true)
      
      // Ensure price has $ sign
      let formattedPrice = data.price.toString();
      if (!formattedPrice.startsWith('$')) {
        formattedPrice = `$${formattedPrice}`;
      }
      
      // Process the data to match database requirements
      const processedData = {
        ...data,
        price: formattedPrice, // Ensure $ sign is included
        price_numeric: Math.round(data.price_numeric || data.price), // Convert to integer
        cooling_capacity: data.cooling_capacity || '',
        heating_capacity: data.heating_capacity || '',
        image: data.image || null,
        product_images: Array.isArray(data.product_images) && data.product_images.length > 0 ? data.product_images : null,
        promotions: data.promotions || null
      }
      
      
      if (isEdit && product) {
        await onSubmit({ ...processedData, id: product.id })
      } else {
        await onSubmit(processedData)
      }
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-8">
          {/* Current Images Overview - Only show when editing */}
          {isEdit && (imageUrl || (Array.isArray(productImages) && productImages.length > 0)) && (
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Current Product Images
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Main Image Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-800">Main Product Image</h4>
                  {imageUrl ? (
                    <div className="relative">
                      <img
                        src={imageUrl}
                        alt="Current main image"
                        className="w-full h-32 object-cover rounded-lg border border-blue-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling.style.display = 'block'
                        }}
                      />
                      <div className="hidden w-full h-32 bg-gray-200 rounded-lg border border-blue-300 flex items-center justify-center text-gray-500 text-sm">
                        Image failed to load
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg border border-blue-300 flex items-center justify-center text-gray-500 text-sm">
                      No main image set
                    </div>
                  )}
                </div>

                {/* Additional Images Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-800">
                    Additional Images ({Array.isArray(productImages) ? productImages.length : 0})
                  </h4>
                  {Array.isArray(productImages) && productImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {productImages.slice(0, 4).map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`Additional image ${index + 1}`}
                            className="w-full h-16 object-cover rounded border border-blue-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling.style.display = 'block'
                            }}
                          />
                          <div className="hidden w-full h-16 bg-gray-200 rounded border border-blue-300 flex items-center justify-center text-gray-500 text-xs">
                            Failed
                          </div>
                        </div>
                      ))}
                      {productImages.length > 4 && (
                        <div className="w-full h-16 bg-gray-200 rounded border border-blue-300 flex items-center justify-center text-gray-500 text-xs">
                          +{productImages.length - 4} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-16 bg-gray-200 rounded border border-blue-300 flex items-center justify-center text-gray-500 text-sm">
                      No additional images
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Basic Product Information */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Product Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name *
                </label>
                <input
                  {...register('name', { required: 'Product name is required' })}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                    errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  )}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

            {/* Series */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Series
              </label>
              <select
                {...register('series')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select series</option>
                {series.map((seriesName) => (
                  <option key={seriesName} value={seriesName}>
                    {seriesName}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand *
              </label>
              <select
                {...register('brand', { required: 'Brand is required' })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white',
                  errors.brand ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                )}
              >
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
              {errors.brand && (
                <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Model *
              </label>
              <input
                {...register('model', { required: 'Model is required' })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                  errors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                )}
                placeholder="Enter model number"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
              )}
            </div>

            {/* Cooling Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cooling Capacity
              </label>
              <input
                {...register('cooling_capacity')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="e.g., 7.1kW or 12000 BTU"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                  errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                )}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* Heating Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Heating Capacity
              </label>
              <input
                {...register('heating_capacity')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="e.g., 8.0kW or 10000 BTU"
              />
            </div>

            {/* Main Product Image Upload */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-6 border border-gray-200 dark:border-gray-500 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Main Product Image
                  </h3>
                  {imageUrl && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center">
                        <Image className="w-3 h-3 mr-1" />
                        Image set
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl(null)
                          setValue('image', null)
                        }}
                        className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <ImageUpload
                    value={imageUrl}
                    onChange={setImageUrl}
                    label=""
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This is the primary image shown in product listings. Click the X button on the image to remove it.
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Product Images */}
            <div className="md:col-span-2">
              <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-6 border border-gray-200 dark:border-gray-500 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Image className="w-5 h-5 mr-2" />
                    Additional Product Images
                  </h3>
                  {Array.isArray(productImages) && productImages.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {productImages.length} image{productImages.length !== 1 ? 's' : ''} selected
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setProductImages([])
                          setValue('product_images', [])
                        }}
                        className="text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                      >
                        Remove All
                      </button>
                    </div>
                  )}
                </div>
                
                
                <MultipleImageUpload
                  value={Array.isArray(productImages) ? productImages : []}
                  onChange={(images) => {
                    setProductImages(images)
                    // Update the form field as well
                    setValue('product_images', images)
                  }}
                  label=""
                  maxImages={6}
                />
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Upload up to 6 additional images to showcase different angles, features, or details of your product. 
                  Hover over images to remove them individually, or use "Remove All" to clear all additional images.
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                  errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                )}
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

              {/* WiFi Support */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('has_wifi')}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Has WiFi connectivity
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEdit ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEdit ? 'Update Product' : 'Add Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
