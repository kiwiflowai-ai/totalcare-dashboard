import React, { useState } from 'react'
import { Trash2, Eye, Search, Filter, Image, Grid3X3, X } from 'lucide-react'
import { Product } from '../types/product'
import { ProductDetailModal } from './ProductDetailModal'
import clsx from 'clsx'

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  loading?: boolean
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [seriesFilter, setSeriesFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [wifiFilter, setWifiFilter] = useState('')
  const [coolingCapacityFilter, setCoolingCapacityFilter] = useState('')
  const [heatingCapacityFilter, setHeatingCapacityFilter] = useState('')
  const [sortField, setSortField] = useState<keyof Product>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProductImages, setSelectedProductImages] = useState<string[]>([])
  const [showImageGallery, setShowImageGallery] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductDetail, setShowProductDetail] = useState(false)

  // Helper function to safely get product images
  const getProductImages = (product: Product): string[] => {
    try {
      if (!product.product_images) return []
      if (Array.isArray(product.product_images)) return product.product_images
      // Handle case where product_images might be a string or other type
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

  // Define filter options based on CSV data
  const brands = ['Daikin', 'Haire', 'LG', 'MHI', 'Midea', 'Mitsubishi', 'Panasonic', 'Samsung']
  const series = ['Alira', 'Cora', 'Other', 'Standard']
  const coolingCapacities = [
    '2.0kW', '2.2kW', '2.50kW', '2.5kW', '2.6kW', '3.4kW', '3.5kW', '4.2kW', '4.8kW', '5.0kW',
    '6.0kW', '6.2kW', '6.3kW', '7.1kW', '7.8kW', '8.0kW', '8.5kW', '9.0kW', '9.4kW', '9.5kW'
  ]
  const heatingCapacities = [
    '10.3kW', '2.7kW', '2.8kW', '3.0kW', '3.1kW', '3.20kW', '3.2kW', '3.3kW', '3.7kW', '4.0kW',
    '5.1kW', '5.2kW', '5.9kW', '6.0kW', '6.1kW', '6.5kW', '7.2kW', '7.3kW', '8.0kW', '8.1kW',
    '9.0kW', '9.5kW'
  ]

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSeries = !seriesFilter || product.series === seriesFilter
      const matchesBrand = !brandFilter || product.brand === brandFilter
      const matchesWifi = !wifiFilter || 
        (wifiFilter === 'yes' && product.has_wifi === true) ||
        (wifiFilter === 'no' && product.has_wifi === false)
      const matchesCoolingCapacity = !coolingCapacityFilter || product.cooling_capacity === coolingCapacityFilter
      const matchesHeatingCapacity = !heatingCapacityFilter || product.heating_capacity === heatingCapacityFilter
      return matchesSearch && matchesSeries && matchesBrand && matchesWifi && matchesCoolingCapacity && matchesHeatingCapacity
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleViewImages = (product: Product) => {
    const images = getProductImages(product)
    setSelectedProductImages(images)
    setShowImageGallery(true)
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setShowProductDetail(true)
  }

  const handleCloseProductDetail = () => {
    setShowProductDetail(false)
    setSelectedProduct(null)
  }

  const handleEditFromDetail = (product: Product) => {
    setShowProductDetail(false)
    setSelectedProduct(null)
    onEdit(product)
  }

  const handleDeleteFromDetail = (product: Product) => {
    setShowProductDetail(false)
    setSelectedProduct(null)
    onDelete(product)
  }

  const formatPrice = (price: string | number) => {
    // If price already contains "+ GST", return as is
    if (typeof price === 'string' && price.includes('+ GST')) {
      return price
    }
    
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.]/g, '')) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(numericPrice)
  }

  const formatPriceWithGST = (product: Product) => {
    const basePrice = typeof product.price === 'string' ? parseFloat(product.price.replace(/[^0-9.]/g, '')) : product.price
    const gstAmount = Math.round(basePrice * 0.15 * 100) / 100  // 15% GST
    const totalPrice = Math.round((basePrice + gstAmount) * 100) / 100
    
    return {
      base: basePrice,
      gst: gstAmount,
      total: totalPrice
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg transition-colors duration-200">
      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Brand
              </label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Series
              </label>
              <select
                value={seriesFilter}
                onChange={(e) => setSeriesFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Series</option>
                {series.map(seriesName => (
                  <option key={seriesName} value={seriesName}>{seriesName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                WiFi Capability
              </label>
              <select
                value={wifiFilter}
                onChange={(e) => setWifiFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All WiFi Options</option>
                <option value="yes">WiFi Enabled</option>
                <option value="no">No WiFi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cooling Capacity
              </label>
              <select
                value={coolingCapacityFilter}
                onChange={(e) => setCoolingCapacityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Cooling Capacities</option>
                {coolingCapacities.map(capacity => (
                  <option key={capacity} value={capacity}>{capacity}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heating Capacity
              </label>
              <select
                value={heatingCapacityFilter}
                onChange={(e) => setHeatingCapacityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Heating Capacities</option>
                {heatingCapacities.map(capacity => (
                  <option key={capacity} value={capacity}>{capacity}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSeriesFilter('')
                  setBrandFilter('')
                  setWifiFilter('')
                  setCoolingCapacityFilter('')
                  setHeatingCapacityFilter('')
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => handleSort('name')}
              >
                Product
                {sortField === 'name' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => handleSort('series')}
              >
                Series
                {sortField === 'series' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => handleSort('brand')}
              >
                Brand
                {sortField === 'brand' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => handleSort('price')}
              >
                Price
                {sortField === 'price' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
                onClick={() => handleSort('cooling_capacity')}
              >
                Cooling
                {sortField === 'cooling_capacity' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                WiFi
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Images
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm || seriesFilter || brandFilter || wifiFilter || coolingCapacityFilter || heatingCapacityFilter
                    ? 'No products match your filters'
                    : 'No products found'
                  }
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                return (
                  <tr 
                    key={product.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                    onClick={() => handleProductClick(product)}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image ? (
                          <img
                            className="h-8 w-8 rounded object-cover border border-gray-200"
                            src={product.image}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center border border-gray-200">
                            <span className="text-gray-400 text-xs font-medium">
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="ml-2 flex-1">
                          <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {product.model}
                          </div>
                          {(() => {
                            try {
                              const images = getProductImages(product)
                              if (!Array.isArray(images) || images.length === 0) return null
                              
                              return (
                                <div className="flex items-center space-x-2 mt-2">
                                  <div className="flex space-x-1">
                                    {images.slice(0, 3).map((img, idx) => {
                                      if (typeof img !== 'string') return null
                                      return (
                                        <img
                                          key={idx}
                                          src={img}
                                          alt={`${product.name} ${idx + 1}`}
                                          className="w-8 h-8 rounded object-cover border border-gray-200 hover:scale-110 transition-transform cursor-pointer"
                                          onError={(e) => {
                                            console.warn('Failed to load image:', img)
                                            e.currentTarget.style.display = 'none'
                                          }}
                                        />
                                      )
                                    })}
                                    {images.length > 3 && (
                                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500 border border-gray-200">
                                        +{images.length - 3}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleViewImages(product)
                                    }}
                                    className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                    title={`View all ${images.length} images`}
                                  >
                                    <Grid3X3 className="w-3 h-3" />
                                    <span>{images.length}</span>
                                  </button>
                                </div>
                              )
                            } catch (error) {
                              console.warn('Error rendering product images:', error)
                              return null
                            }
                          })()}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                      {product.series || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                      {product.brand}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                      <div className="space-y-1">
                        <div className="font-medium">
                          {formatPrice(product.price)}
                        </div>
                        {(() => {
                          const priceInfo = formatPriceWithGST(product)
                          return (
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                              Total: {formatPrice(priceInfo.total)}
                            </div>
                          )
                        })()}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900 dark:text-white">
                      {product.cooling_capacity || '-'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={clsx(
                        'inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full',
                        product.has_wifi ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900' : 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
                      )}>
                        {product.has_wifi ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {/* Main Image */}
                        {product.image && (
                          <div className="w-4 h-4 rounded border border-gray-200 overflow-hidden">
                            <img
                              src={product.image}
                              alt="Main"
                              className="w-full h-full object-cover"
                              onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                          </div>
                        )}
                        
                        {/* Additional Images */}
                        {(() => {
                          const images = getProductImages(product)
                          if (images.length > 0) {
                            return (
                              <div className="flex items-center space-x-1">
                                {images.slice(0, 2).map((img, idx) => (
                                  <div key={idx} className="w-4 h-4 rounded border border-gray-200 overflow-hidden">
                                    <img
                                      src={img}
                                      alt={`Additional ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                      onError={(e) => e.currentTarget.style.display = 'none'}
                                    />
                                  </div>
                                ))}
                                {images.length > 2 && (
                                  <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                                    +{images.length - 2}
                                  </div>
                                )}
                              </div>
                            )
                          }
                          return null
                        })()}
                        
                        {/* No Images */}
                        {!product.image && getProductImages(product).length === 0 && (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(product)
                          }}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors duration-200"
                          title="Delete product"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Results count */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 flex items-center justify-between transition-colors duration-200">
        <span>Showing {filteredProducts.length} of {products.length} products</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <Eye className="w-3 h-3 mr-1" />
          Click row for details
        </span>
      </div>

      {/* Image Gallery Modal */}
      {showImageGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden transition-colors duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Product Images ({selectedProductImages.length})
              </h3>
              <button
                onClick={() => setShowImageGallery(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {selectedProductImages.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No images available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedProductImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                        onError={(e) => {
                          console.warn('Failed to load image:', image)
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={showProductDetail}
        onClose={handleCloseProductDetail}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />
    </div>
  )
}
