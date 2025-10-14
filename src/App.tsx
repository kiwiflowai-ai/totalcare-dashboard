import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { Plus, Settings, BarChart3 } from 'lucide-react'
import { useProducts } from './hooks/useProducts'
import { Product, CreateProductData, UpdateProductData } from './types/product'
import { ProductForm } from './components/ProductForm'
import { ProductTable } from './components/ProductTable'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { StatsCards } from './components/StatsCards'
import { ThemeProvider } from './contexts/ThemeContext'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  const {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProducts()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const handleFormSubmit = async (data: CreateProductData | UpdateProductData) => {
    try {
      setIsSubmitting(true)
      if (selectedProduct) {
        await updateProduct(data as UpdateProductData)
      } else {
        await addProduct(data as CreateProductData)
      }
      setIsFormOpen(false)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return

    try {
      setIsSubmitting(true)
      await deleteProduct(selectedProduct.id)
      setIsDeleteModalOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedProduct(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSelectedProduct(null)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    HVAC Product Dashboard
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 rounded-md">
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 rounded-md">
                  <Settings className="w-5 h-5" />
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards products={products} />

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Product Inventory
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your HVAC product catalog
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>

        {/* Product Table */}
        <ProductTable
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          loading={loading}
        />
      </main>

      {/* Modals */}
      <ProductForm
        product={selectedProduct}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        loading={isSubmitting}
      />

      <DeleteConfirmModal
        product={selectedProduct}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        loading={isSubmitting}
      />
      </div>
    </ThemeProvider>
  )
}

export default App
