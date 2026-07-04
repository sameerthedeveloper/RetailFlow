import React, { useState } from 'react'
import axios from 'axios'
import { X, CreditCard, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react'

function CheckoutModal({ isOpen, onClose, cartItems, totalPrice, onOrderSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const token = localStorage.getItem('token')
    if (!token) {
      setError('You must be logged in to complete checkout!')
      setLoading(false)
      return
    }

    const orderPayload = {
      orderItems: cartItems.map(item => ({
        product: item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      shippingAddress: {
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country
      },
      paymentMethod: 'Cash on Delivery',
      totalPrice: totalPrice
    }

    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api'
      const response = await axios.post(`${baseUrl}/order/new`, orderPayload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setIsSuccess(true)
      localStorage.setItem('cart', JSON.stringify([]))
      window.dispatchEvent(new Event('cartUpdated'))
      
      if (onOrderSuccess) {
        setTimeout(() => {
          onOrderSuccess()
        }, 2500)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.response?.data?.message || 'Error occurred while placing the order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={!loading && !isSuccess ? onClose : undefined}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 ease-out border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4.5 bg-slate-50/50">
          <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Shipping Details
          </h3>
          {!loading && !isSuccess && (
            <button 
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-650 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isSuccess ? (
          /* Success Screen */
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4 overflow-y-auto">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md shadow-emerald-500/10">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Order Placed!</h2>
            <p className="text-sm text-slate-500 max-w-sm">
              Your order has been registered successfully. We are preparing it for delivery.
            </p>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 mt-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Payment Mode: Cash on Delivery (COD)
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Summary Card */}
            <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100/60 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-655 shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Summary</p>
                  <p className="text-xs font-bold text-slate-700">{cartItems.length} Products</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
                <p className="text-lg font-black text-blue-655">₹{totalPrice.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2">Recipient Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 hover:bg-slate-50 transition text-sm text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2">Street Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Flat, House no., Building, Company, Apartment"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 hover:bg-slate-50 transition text-sm text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 hover:bg-slate-50 transition text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="ZIP / Pincode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 hover:bg-slate-50 transition text-sm text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  placeholder="India"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 hover:bg-slate-50 transition text-sm text-slate-800"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-xl p-3">
                {error}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4" />
                {loading ? 'Processing...' : 'Place COD Order'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default CheckoutModal