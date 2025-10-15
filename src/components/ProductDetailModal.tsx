import React from 'react'
import { X, Edit, Trash2, Image, Wifi, Package, Calendar, Tag } from 'lucide-react'
import { Product } from '../types/product'
import clsx from 'clsx'

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !product) return null

  // Helper function to safely get product images
  const getProductImages = (product: Product): string[] => {
    try {
      if (!product.product_images) return []
      if (Array.isArray(product.product_images)) return product.product_images
      if (typeof product.product_images === 'string') {
        const parsed = JSON.parse(product.product_images)
        return Array.isArray(parsed) ? parsed : []
      }
      return []
    } catch (error) {
      console.warn('Error parsing product_images:', error)
      return []
    }
  }

  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericPrice)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const additionalImages = getProductImages(product)
  const totalImages = (product.image ? 1 : 0) + additionalImages.length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-sm text-gray-600">{product.brand} • {product.model}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => onDelete(product)}
              className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Images */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2" />
                  Product Images ({totalImages})
                </h3>
                
                {/* Main Image */}
                {product.image && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Main Product Image</h4>
                    <div className="relative">
                      <img
                        src={product.image}
                        alt="Main product image"
                        className="w-full h-64 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                          if (nextElement) {
                            nextElement.style.display = 'block'
                          }
                        }}
                      />
                      <div className="hidden w-full h-64 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500">
                        Image failed to load
                      </div>
                    </div>
                  </div>
                )}


                {/* Additional Images */}
                {additionalImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Images ({additionalImages.length})</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {additionalImages.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`Additional image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                              if (nextElement) {
                                nextElement.style.display = 'block'
                              }
                            }}
                          />
                          <div className="hidden w-full h-32 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 text-sm">
                            Failed to load
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Images */}
                {totalImages === 0 && (
                  <div className="text-center py-12">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No images available for this product</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Brand</label>
                      <p className="text-sm text-gray-900">{product.brand}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Model</label>
                      <p className="text-sm text-gray-900">{product.model}</p>
                    </div>
                  </div>
                  
                  {product.series && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Series</label>
                      <p className="text-sm text-gray-900">{product.series}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Price</label>
                      <p className="text-lg font-semibold text-green-600">{formatPrice(product.price)}</p>
                    </div>
                    {product.price_numeric && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Price (Numeric)</label>
                        <p className="text-sm text-gray-900">${product.price_numeric}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Specifications</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {product.cooling_capacity && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Cooling Capacity</label>
                        <p className="text-sm text-gray-900">{product.cooling_capacity}</p>
                      </div>
                    )}
                    {product.heating_capacity && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Heating Capacity</label>
                        <p className="text-sm text-gray-900">{product.heating_capacity}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Wifi className={clsx(
                      'w-4 h-4',
                      product.has_wifi ? 'text-green-600' : 'text-gray-400'
                    )} />
                    <span className={clsx(
                      'text-sm font-medium',
                      product.has_wifi ? 'text-green-600' : 'text-gray-500'
                    )}>
                      {product.has_wifi ? 'WiFi Enabled' : 'No WiFi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Promotions */}
              {product.promotions && Array.isArray(product.promotions) && product.promotions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotions</h3>
                  <div className="space-y-2">
                    {product.promotions.map((promotion, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">{promotion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-700">{formatDate(product.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-sm text-gray-700">{formatDate(product.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
