import React, { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import ProductCard from '../ProductCard'
import { Search, SlidersHorizontal, ArrowUpDown, FilterX, Loader2, ShoppingBag } from 'lucide-react'

function Shop() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState(150000)
  const [sortBy, setSortBy] = useState('featured')

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api'
        const response = await axios.get(`${baseUrl}/product/all`)
        setProducts(response.data)
      } catch (error) {
        console.error('Error loading shop products:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Dynamically compute list of categories and counts
  const categoriesData = useMemo(() => {
    const counts = {}
    products.forEach(p => {
      const cat = (p.category || 'general').toLowerCase()
      counts[cat] = (counts[cat] || 0) + 1
    })
    return counts
  }, [products])

  const categories = useMemo(() => {
    return ['all', ...Object.keys(categoriesData)]
  }, [categoriesData])

  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 150000
    return Math.max(...products.map(p => p.price || 0))
  }, [products])

  // Set default range once products are loaded
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange(maxProductPrice)
    }
  }, [products, maxProductPrice])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Search query filter
    if (searchQuery.trim() !== '') {
      result = result.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => (p.category || 'general').toLowerCase() === selectedCategory)
    }

    // Price range filter
    result = result.filter(p => (p.price || 0) <= priceRange)

    // Sort order
    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name))
    }

    return result
  }, [products, searchQuery, selectedCategory, priceRange, sortBy])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setPriceRange(maxProductPrice)
    setSortBy('featured')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 mt-3 text-sm">Loading items from catalog...</p>
      </div>
    )
  }

  return (
    <div className="flex mt-5 flex-col md:flex-row gap-8 items-start mt-6">
      {/* Sidebar Filters */}
      <aside className="w-full  md:w-68 shrink-0 md:sticky md:top-24 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-6 self-start">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-650" />
            Filters
          </h3>
          {(searchQuery || selectedCategory !== 'all' || priceRange < maxProductPrice || sortBy !== 'featured') && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* Search */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Products</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-405" />
            <input
              type="text"
              placeholder="Search by name, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 hover:bg-slate-50 transition"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</label>
          <div className="flex flex-col gap-1.5">
            {categories.map(cat => {
              const isActive = selectedCategory === cat
              const count = cat === 'all' ? products.length : categoriesData[cat] || 0

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between text-left px-3.5 py-2 text-sm rounded-2xl border transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 border-blue-650 text-white font-semibold shadow-md shadow-blue-500/10'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <span className="capitalize">{cat === 'all' ? 'All Products' : cat}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-550'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Price Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Max Price</label>
            <span className="text-sm font-black text-slate-850">₹{priceRange.toLocaleString('en-IN')}</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxProductPrice}
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>₹0</span>
            <span>₹{maxProductPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Sort Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Sort By</label>
          <div className="relative">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-405 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none text-slate-700 cursor-pointer"
            >
              <option value="featured">Featured / Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Product Display Area */}
      <section className="flex-1 w-full space-y-6">
        {/* Results Info */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <p className="text-sm text-slate-500 font-semibold">
            Showing <span className="text-slate-800 font-black">{filteredProducts.length}</span> of{' '}
            <span className="text-slate-800 font-bold">{products.length}</span> products
          </p>
        </div>

        {/* Catalog Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-450 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <ShoppingBag className="w-12 h-12 text-slate-350 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No matching products found</p>
            <p className="text-xs text-slate-500 mt-1">Try relaxing your search terms or expanding your price limit.</p>
            <button
              onClick={handleClearFilters}
              className="mt-6 inline-flex items-center justify-center bg-blue-600 text-white font-semibold text-sm px-6 py-2.5 rounded-2xl hover:bg-blue-700 transition shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Shop