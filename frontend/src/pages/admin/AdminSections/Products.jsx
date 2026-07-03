import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, ShoppingBag, Loader2 } from 'lucide-react'
import axios from 'axios'
import ProductModal from '../AdminComponents/AddProductModel'

function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api'
      const response = await axios.get(`${baseUrl}/product/all`)
      setProducts(response.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleEditClick = (product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteClick = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api'
        await axios.delete(`${baseUrl}/product/delete?id=${productId}`)
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        alert(error.response?.data?.message || 'Error deleting product')
      }
    }
  }

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your retail products</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-500 mt-2 text-sm">Loading inventory...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 p-8 text-center">
          <div className="h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4 px-4">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">No products found</h3>
          <p className="text-gray-500 text-sm max-w-sm mt-1 mb-6">
            Get started by adding your first product to the inventory database.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add First Product
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0 border border-gray-200 rounded-2xl shadow-sm bg-white flex flex-col overflow-hidden">
          <div className="overflow-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {products.map((product, index) => (
                  <tr key={product._id || index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-gray-50"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {product.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {product.countInStock <= 0 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-150">
                          Out of Stock
                        </span>
                      ) : product.countInStock <= 5 ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-150">
                          Low Stock ({product.countInStock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-150">
                          In Stock ({product.countInStock})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      ₹{Number(product.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-650">
                      {product.brand || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-650">
                      {product.category || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-blue-600 hover:text-blue-800 transition p-1.5 rounded-lg hover:bg-blue-50 cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product._id)}
                          className="text-red-650 hover:text-red-800 transition p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => {
            setIsModalOpen(false)
            setEditingProduct(null)
          }}
          onSave={() => {
            fetchProducts()
            setIsModalOpen(false)
            setEditingProduct(null)
          }}
        />
      )}
    </div>
  )
}

export default Products