import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Save, Loader2, Plus, Trash2, Upload } from 'lucide-react'
import { Product, CreateProductData, UpdateProductData } from '../types/product'
import { uploadImage } from '../utils/imageUpload'
import clsx from 'clsx'

interface DynamicProductFormProps {
  product?: Product | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateProductData | UpdateProductData) => Promise<void>
  loading?: boolean
  availableColumns?: string[]
}

const categories = [
  'Air Conditioning Units',
  'Heating Systems',
  'Ventilation',
  'Ductwork',
  'Thermostats',
  'Filters',
  'Tools & Equipment',
  'Parts & Accessories',
  'Other'
]

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
  'Other'
]

const fieldTypes = {
  string: 'text',
  number: 'number',
  boolean: 'checkbox',
  textarea: 'textarea',
  select: 'select',
  date: 'date',
  email: 'email',
  url: 'url'
}

const getFieldType = (fieldName: string, value: any): string => {
  if (fieldName.includes('email')) return 'email'
  if (fieldName.includes('url') || fieldName.includes('image')) return 'url'
  if (fieldName.includes('date')) return 'date'
  if (fieldName.includes('description') || fieldName.includes('notes')) return 'textarea'
  if (fieldName.includes('rating') || fieldName.includes('efficiency')) return 'select'
  if (typeof value === 'boolean') return 'checkbox'
  if (typeof value === 'number') return 'number'
  return 'text'
}

const getFieldOptions = (fieldName: string): string[] => {
  if (fieldName.includes('category')) return categories
  if (fieldName.includes('brand')) return brands
  if (fieldName.includes('rating')) return ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D']
  if (fieldName.includes('condition')) return ['New', 'Used', 'Refurbished', 'Damaged']
  if (fieldName.includes('status')) return ['Active', 'Inactive', 'Discontinued', 'Pending']
  if (fieldName.includes('installation')) return ['Indoor', 'Outdoor', 'Split', 'Package', 'Portable']
  if (fieldName.includes('refrigerant')) return ['R-410A', 'R-22', 'R-134a', 'R-32', 'R-454B']
  return []
}

export const DynamicProductForm: React.FC<DynamicProductFormProps> = ({
  product,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customFields, setCustomFields] = useState<Array<{key: string, type: string, value: any}>>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      brand: '',
      model: '',
      sku: '',
      stock_quantity: 0,
      min_stock_level: 0,
      is_active: true,
      image_url: '',
      specifications: {}
    }
  })

  useEffect(() => {
    if (product) {
      const productData = { 
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price.replace('$', '')) || 0 : product.price
      }
      reset(productData)
      
      // Extract custom fields that aren't in the default form
      const defaultFields = ['id', 'name', 'description', 'price', 'category', 'brand', 'model', 'sku', 'stock_quantity', 'min_stock_level', 'is_active', 'image_url', 'specifications', 'created_at', 'updated_at']
      const customFieldsData = Object.entries(productData)
        .filter(([key, value]) => !defaultFields.includes(key) && value !== null && value !== undefined)
        .map(([key, value]) => ({
          key,
          type: getFieldType(key, value),
          value: value
        }))
      setCustomFields(customFieldsData)
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        category: '',
        brand: '',
        model: '',
        sku: '',
        stock_quantity: 0,
        min_stock_level: 0,
        is_active: true,
        image_url: '',
        specifications: {}
      })
      setCustomFields([])
    }
  }, [product, reset])

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      const result = await uploadImage(file)
      if (!result) {
        throw new Error('Failed to upload image')
      }
      return result
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to upload image')
    }
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        // Validate file using the upload utility
        await uploadImage(file)
        
        setSelectedImage(file)
        
        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Invalid image file')
        // Reset the input
        event.target.value = ''
      }
    }
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleFormSubmit = async (data: CreateProductData | UpdateProductData) => {
    try {
      setIsSubmitting(true)
      setIsUploading(true)
      
      // Handle image upload
      let imageUrl = data.image_url || ''
      if (selectedImage) {
        try {
          imageUrl = await handleImageUpload(selectedImage)
        } catch (error) {
          console.error('Image upload error:', error)
          alert('Failed to upload image. Please try again.')
          return
        }
      }
      
      // Merge custom fields into the data
      const customFieldsData = customFields.reduce((acc, field) => {
        acc[field.key] = field.value
        return acc
      }, {} as Record<string, any>)
      
      const finalData = { ...data, image_url: imageUrl, ...customFieldsData }
      
      if (isEdit && product) {
        await onSubmit({ ...finalData, id: product.id })
      } else {
        await onSubmit(finalData)
      }
      onClose()
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const addCustomField = () => {
    setCustomFields([...customFields, { key: '', type: 'text', value: '' }])
  }

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index))
  }

  const updateCustomField = (index: number, field: string, value: any) => {
    const updated = [...customFields]
    updated[index] = { ...updated[index], [field]: value }
    setCustomFields(updated)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            </div>

            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                {...register('name', { required: 'Product name is required' })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.name ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.category ? 'border-red-500' : 'border-gray-300'
                )}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">
                  {typeof errors.category.message === 'string' ? errors.category.message : 'This field is required'}
                </p>
              )}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <select
                {...register('brand', { required: 'Brand is required' })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.brand ? 'border-red-500' : 'border-gray-300'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                {...register('model', { required: 'Model is required' })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.model ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Enter model number"
              />
              {errors.model && (
                <p className="mt-1 text-sm text-red-600">{errors.model.message}</p>
              )}
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                {...register('sku', { required: 'SKU is required' })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.sku ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Enter SKU"
              />
              {errors.sku && (
                <p className="mt-1 text-sm text-red-600">
                  {typeof errors.sku.message === 'string' ? errors.sku.message : 'This field is required'}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                  errors.price ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                {...register('stock_quantity', { 
                  required: 'Stock quantity is required',
                  min: { value: 0, message: 'Stock quantity must be non-negative' }
                })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.stock_quantity ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="0"
              />
              {errors.stock_quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {typeof errors.stock_quantity.message === 'string' ? errors.stock_quantity.message : 'This field is required'}
                </p>
              )}
            </div>

            {/* Min Stock Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Stock Level *
              </label>
              <input
                type="number"
                {...register('min_stock_level', { 
                  required: 'Min stock level is required',
                  min: { value: 0, message: 'Min stock level must be non-negative' }
                })}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.min_stock_level ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="0"
              />
              {errors.min_stock_level && (
                <p className="mt-1 text-sm text-red-600">
                  {typeof errors.min_stock_level.message === 'string' ? errors.min_stock_level.message : 'This field is required'}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              
              {/* Image Preview */}
              {(imagePreview || product?.image_url) && (
                <div className="mb-4 relative inline-block">
                  <img
                    src={imagePreview || product?.image_url}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={clearSelectedImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              
              {/* Upload Button */}
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  {selectedImage ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                
                {selectedImage && (
                  <span className="text-sm text-gray-600">
                    {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
              
              {/* Or URL Input */}
              <div className="mt-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Or enter image URL:
                </label>
                <input
                  {...register('image_url')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: PNG, JPEG, JPG, GIF, WebP (max 5MB)
              </p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                rows={3}
                className={clsx(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500',
                  errors.description ? 'border-red-500' : 'border-gray-300'
                )}
                placeholder="Enter product description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Product is active
                </span>
              </label>
            </div>
          </div>

          {/* Custom Fields */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Additional Fields</h3>
              <button
                type="button"
                onClick={addCustomField}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </button>
            </div>

            {customFields.map((field, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateCustomField(index, 'key', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., part_number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) => updateCustomField(index, 'type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="textarea">Text Area</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={field.value}
                      onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={2}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={field.value}
                      onChange={(e) => updateCustomField(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select value</option>
                      {getFieldOptions(field.key).map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => updateCustomField(index, 'value', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  ) : (
                    <input
                      type={fieldTypes[field.type as keyof typeof fieldTypes] || 'text'}
                      value={field.value}
                      onChange={(e) => updateCustomField(index, 'value', field.type === 'number' ? Number(e.target.value) : e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  )}
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeCustomField(index)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading || isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading Image...' : (isEdit ? 'Updating...' : 'Adding...')}
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

