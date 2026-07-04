import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { X, ShoppingBag, Package, Calendar, Loader2 } from 'lucide-react'

function MyOrdersModal({ isOpen, onClose }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      setLoading(true)
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api'
      const response = await axios.get(`${baseUrl}/order/myorders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setOrders(response.data)
    } catch (error) {
      console.error('Error fetching my orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchOrders()
    }
  }, [isOpen])

  if (!isOpen) return null

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100'
      case 'Cancelled':
        return 'bg-red-50 text-red-650 border-red-100'
      default:
        return 'bg-amber-50 text-amber-600 border-amber-100'
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-100 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed m-3 border border-slate-200 rounded-3xl right-0 top-0 bottom-0 z-100 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            My Orders
            {orders.length > 0 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                {orders.length}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-slate-50/50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-slate-450 mt-2">Loading orders history...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-base font-semibold text-slate-700">No orders placed yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Your purchase history will appear here once you place a COD order.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3.5"
              >
                {/* Order Meta Header */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Order ID</span>
                    <span className="text-xs font-bold text-slate-700">#{order._id.substring(order._id.length - 8)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Placed On</span>
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2">
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-11 h-11 object-cover rounded-xl border border-slate-100 shrink-0 bg-slate-50"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-5 h-5 text-slate-350" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {item.quantity} x ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status & Total Price */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Order Value</span>
                    <span className="text-sm font-black text-blue-650">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default MyOrdersModal
