import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { ShoppingBag, Truck, Calendar, CheckCircle2, AlertCircle, RefreshCw, Eye, ArrowRight, User, Mail, MapPin } from 'lucide-react'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async (isSilent = false) => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api'
      const response = await axios.get(`${baseUrl}/order/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setOrders(response.data)
      setError('')
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('Failed to fetch orders data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    try {
      setUpdatingId(orderId)
      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api'
      await axios.put(`${baseUrl}/order/status`, {
        orderId,
        status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // Update locally
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      console.error('Error updating order status:', err)
      alert('Failed to update order status.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Calculate stats
  const stats = React.useMemo(() => {
    const total = orders.length
    const pending = orders.filter(o => o.status === 'Pending').length
    const shipped = orders.filter(o => o.status === 'Shipped').length
    const delivered = orders.filter(o => o.status === 'Delivered').length
    const value = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0)

    return { total, pending, shipped, delivered, value }
  }, [orders])

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'bg-blue-50 text-blue-650 border border-blue-200'
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-650 border border-indigo-200'
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-650 border border-emerald-200'
      case 'Cancelled':
        return 'bg-red-50 text-red-650 border border-red-200'
      default:
        return 'bg-amber-50 text-amber-650 border border-amber-200'
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white h-full">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-550 text-sm mt-3 font-medium">Loading orders list...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Orders Management</h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Track customer orders and manage dispatch status</p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Orders</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Orders</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{stats.pending}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sales</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">₹{stats.value.toLocaleString('en-IN')}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Delivered Orders</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.delivered}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {orders.length === 0 ? (
          <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No orders registered yet</p>
            <p className="text-xs text-slate-500 mt-1">Orders placed by customers will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between hover:border-slate-300/85 transition duration-150"
              >
                {/* Product Detail Items */}
                <div className="flex-1 space-y-3 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                      #{order._id.substring(order._id.length - 8)}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-100 shrink-0 bg-slate-50"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            <ShoppingBag className="w-5 h-5 text-slate-350" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate max-w-[280px] sm:max-w-[400px]">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {item.quantity} x ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recipient details */}
                <div className="shrink-0 space-y-1.5 text-xs text-slate-650 w-full lg:w-56 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                    <span>{order.user?.name || 'Customer'}</span>
                  </div>
                  {order.user?.email && (
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{order.user.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-1.5 text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">
                      {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    </span>
                  </div>
                </div>

                {/* Status Dropdown & Price */}
                <div className="shrink-0 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 w-full lg:w-44 border-t lg:border-t-0 border-slate-100 pt-3 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Total Price</span>
                    <span className="text-base font-black text-blue-650">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="relative shrink-0 w-32">
                    <select
                      disabled={updatingId === order._id}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`w-full text-xs font-bold px-3 py-2 rounded-xl outline-none transition cursor-pointer appearance-none ${getStatusColor(
                        order.status
                      )}`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {updatingId === order._id && (
                      <RefreshCw className="absolute right-2 top-2.5 w-3.5 h-3.5 text-slate-400 animate-spin" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders