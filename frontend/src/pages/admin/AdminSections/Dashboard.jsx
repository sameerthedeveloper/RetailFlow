import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import { Package, IndianRupee, AlertTriangle, Boxes, Loader2, ArrowUpRight, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

function Dashboard() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api'
        const response = await axios.get(`${baseUrl}/product/all`)
        setProducts(response.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalStock = products.reduce((acc, p) => acc + (p.countInStock || 0), 0)
    const totalValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.countInStock || 0)), 0)
    const outOfStock = products.filter(p => (p.countInStock || 0) <= 0).length

    return {
      totalProducts,
      totalStock,
      totalValue,
      outOfStock
    }
  }, [products])

  const chartData = useMemo(() => {
    return products.slice(0, 8).map(p => ({
      name: p.name.length > 12 ? p.name.slice(0, 12) + '...' : p.name,
      Stock: p.countInStock || 0,
      Value: (p.price || 0) * (p.countInStock || 0)
    }))
  }, [products])

  const lowStockProducts = useMemo(() => {
    return products
      .filter(p => (p.countInStock || 0) <= 5)
      .slice(0, 5)
  }, [products])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 mt-2 text-sm">Loading dashboard analytics...</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time store analytics & performance overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 shrink-0">
        {/* Card 1: Total Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-400">Total Products</p>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mt-2 truncate" title={stats.totalProducts}>
              {stats.totalProducts}
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-500 mt-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Database Items
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Inventory Value */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-400">Inventory Value</p>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mt-2 truncate" title={`₹${stats.totalValue.toLocaleString('en-IN')}`}>
              ₹{stats.totalValue.toLocaleString('en-IN')}
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500 mt-1.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> Total Asset Value
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Stock */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-400">Total Stock</p>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mt-2 truncate" title={stats.totalStock}>
              {stats.totalStock}
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-500 mt-1.5">
              <Boxes className="w-3.5 h-3.5" /> Units In Store
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50 text-purple-600 shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Out of Stock */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow min-w-0">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-400">Out of Stock</p>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mt-2 truncate" title={stats.outOfStock}>
              {stats.outOfStock}
            </h3>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-500 mt-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Needs Attention
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="flex-1 min-h-[320px] grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col min-h-0">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">Inventory Levels</h3>
            <p className="text-xs text-gray-400 mt-0.5">Stock quantities across featured products</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            {chartData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
                No inventory data to display.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)' }} 
                    labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  />
                  <Area type="monotone" dataKey="Stock" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStock)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">Low Stock Alerts</h3>
            <p className="text-xs text-gray-400 mt-0.5">Items with 5 or fewer items remaining</p>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-6 border border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                <p className="text-sm text-gray-400 font-medium">All items are sufficiently stocked!</p>
              </div>
            ) : (
              lowStockProducts.map(p => (
                <div key={p._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-150">
                        <Package className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-850 truncate">{p.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{p.brand || 'No Brand'}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-xl ${
                    p.countInStock <= 0 
                      ? 'bg-red-50 text-red-650 border border-red-100' 
                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {p.countInStock <= 0 ? 'Out' : `${p.countInStock} Left`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard