import React from 'react'
import { Package, DollarSign, AlertTriangle, TrendingUp, Image } from 'lucide-react'
import { Product } from '../types/product'

interface StatsCardsProps {
  products: Product[]
}

export const StatsCards: React.FC<StatsCardsProps> = ({ products }) => {
  const totalProducts = products.length
  const wifiProducts = products.filter(p => p.has_wifi).length
  const totalValue = products.reduce((sum: number, product) => {
    const basePrice = typeof product.price === 'string' ? parseFloat(product.price.replace('$', '')) || 0 : product.price
    const gstAmount = product.gst_amount || Math.round(basePrice * 0.10 * 100) / 100
    const totalPrice = product.price_with_gst || Math.round((basePrice + gstAmount) * 100) / 100
    return sum + totalPrice
  }, 0)
  const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0
  const brands = [...new Set(products.map(p => p.brand))].length
  
  // Calculate total images across all products
  const totalImages = products.reduce((sum, product) => {
    let count = 0
    if (product.image) count++
    if (product.cover_image) count++
    if (product.product_images && Array.isArray(product.product_images)) {
      count += product.product_images.length
    }
    return sum + count
  }, 0)
  
  const productsWithImages = products.filter(product => 
    product.image || product.cover_image || (product.product_images && Array.isArray(product.product_images) && product.product_images.length > 0)
  ).length

  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900',
      change: brands,
      changeLabel: 'Brands'
    },
    {
      title: 'Total Value (Inc. GST)',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(totalValue),
      icon: DollarSign,
      color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900',
      change: Math.round(avgPrice),
      changeLabel: 'Avg Price (Inc. GST)'
    },
    {
      title: 'WiFi Products',
      value: wifiProducts,
      icon: AlertTriangle,
      color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900',
      change: totalProducts > 0 ? Math.round((wifiProducts / totalProducts) * 100) : 0,
      changeLabel: '% of Total'
    },
    {
      title: 'Unique Brands',
      value: brands,
      icon: TrendingUp,
      color: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900',
      change: totalProducts > 0 ? Math.round(totalProducts / brands) : 0,
      changeLabel: 'Avg per Brand'
    },
    {
      title: 'Total Images',
      value: totalImages,
      icon: Image,
      color: 'text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900',
      change: productsWithImages,
      changeLabel: 'Products with Images'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stat.change} {stat.changeLabel}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
