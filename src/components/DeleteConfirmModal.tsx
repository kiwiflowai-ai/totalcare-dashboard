import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { Product } from '../types/product'

interface DeleteConfirmModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => {
  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Product
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">{product.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">SKU:</span> {product.sku}</p>
              <p><span className="font-medium">Brand:</span> {product.brand}</p>
              <p><span className="font-medium">Model:</span> {product.model}</p>
              <p><span className="font-medium">Category:</span> {product.category}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
