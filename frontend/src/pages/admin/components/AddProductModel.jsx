import React, { useState } from 'react'
import { X, Image as ImageIcon } from 'lucide-react'
import axios from 'axios';


// input: existing product (edit) or null (create). onClose + onSave callbacks.
function ProductModal({ product = null, onClose, onSave }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price || 0,
    description: product?.description || '',
    brand: product?.brand || '',
    category: product?.category || '',
    countInStock: product?.countInStock || 0,
    image: product?.image || '',
  });



  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api';
      const payload = {
        ...form,
        price: Number(form.price),
        countInStock: Number(form.countInStock)
      };
      
      const token = localStorage.getItem('adminToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      let response;
      if (product && product._id) {
        response = await axios.put(`${baseUrl}/product/edit`, { ...payload, id: product._id }, { headers });
      } else {
        response = await axios.post(`${baseUrl}/product/add`, payload, { headers });
      }
      onSave?.(response.data);
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.response?.data?.message || 'Error occurred while saving product');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* blurred backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* floating card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white border border-gray-100 p-8 shadow-2xl">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit}>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {product ? 'Edit Product' : 'New Product'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              This info will be shown to customers on the product page.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              {/* name */}
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Product name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    required
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Wireless Headphones"
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  />
                </div>
              </div>

              {/* description */}
              <div className="col-span-full">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    required
                    rows={3}
                    value={form.description}
                    onChange={set('description')}
                    placeholder="Describe the product details..."
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Short summary of the product.</p>
              </div>

              {/* image */}
              <div className="col-span-full">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image</label>
                <div className="mt-1 flex justify-center rounded-2xl border border-dashed border-gray-300 px-6 py-8 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="text-center w-full">
                    {form.image ? (
                      <img
                        src={form.image}
                        alt=""
                        className="mx-auto size-24 rounded-2xl object-cover mb-4 shadow-sm border border-gray-200"
                      />
                    ) : (
                      <ImageIcon className="mx-auto w-12 h-12 text-gray-400 mb-2" />
                    )}
                    <div className="mt-2">
                      <input
                        type="text"
                        value={form.image}
                        onChange={set('image')}
                        placeholder="Paste image URL"
                        className="block w-full max-w-sm mx-auto px-4 py-2 text-sm border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB, or hosted URL</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8">
            <h2 className="text-xl font-bold text-gray-800">Pricing & Inventory</h2>
            <p className="mt-1 text-sm text-gray-500">Set price, stock, and categorization.</p>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                  Price (₹)
                </label>
                <div className="mt-1">
                  <input
                    id="price"
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={set('price')}
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="countInStock" className="block text-sm font-semibold text-gray-700 mb-2">
                  Stock
                </label>
                <div className="mt-1">
                  <input
                    id="countInStock"
                    required
                    type="number"
                    min="0"
                    value={form.countInStock}
                    onChange={set('countInStock')}
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <div className="mt-1">
                  <input
                    id="category"
                    type="text"
                    value={form.category}
                    onChange={set('category')}
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="brand" className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand
                </label>
                <div className="mt-1">
                  <input
                    id="brand"
                    type="text"
                    value={form.brand}
                    onChange={set('brand')}
                    className="block w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-x-4 border-t border-gray-200 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold text-gray-600 hover:text-gray-800 px-4 py-2 rounded-xl transition hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition cursor-pointer"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductModal;