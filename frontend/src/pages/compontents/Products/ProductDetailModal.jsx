import React, { useState, useEffect } from 'react'
import { X, ShoppingCart, ShoppingBag, Plus, Minus, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react'

function ProductDetailModal({ isOpen, onClose, product }) {
  const [quantity, setQuantity] = useState(0)

  const updateLocalQuantity = () => {
    if (!product) return
    try {
      const storedCart = localStorage.getItem('cart')
      if (storedCart) {
        const cart = JSON.parse(storedCart)
        if (Array.isArray(cart)) {
          const item = cart.find((item) => item._id === product._id)
          setQuantity(item ? (item.quantity || 1) : 0)
          return
        }
      }
    } catch (e) {
      console.error('Error reading quantity from cart:', e)
    }
    setQuantity(0)
  }

  useEffect(() => {
    updateLocalQuantity()
    window.addEventListener('cartUpdated', updateLocalQuantity)
    return () => window.removeEventListener('cartUpdated', updateLocalQuantity)
  }, [product?._id])

  if (!isOpen || !product) return null

  const { name, price, description, brand, category, countInStock, image, user } = product

  const updateCartQuantity = (delta) => {
    let cart = []
    try {
      const storedCart = localStorage.getItem('cart')
      if (storedCart) {
        cart = JSON.parse(storedCart)
        if (!Array.isArray(cart)) {
          cart = []
        }
      }
    } catch (error) {
      cart = []
    }

    const existingIndex = cart.findIndex((item) => item._id === product._id)
    if (existingIndex > -1) {
      const newQty = (cart[existingIndex].quantity || 1) + delta
      if (newQty <= 0) {
        cart.splice(existingIndex, 1)
      } else {
        const maxAllowed = Math.min(product.countInStock || 6, 6)
        cart[existingIndex].quantity = Math.min(maxAllowed, newQty)
      }
    } else if (delta > 0) {
      cart.push({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
        category: product.category,
        countInStock: product.countInStock,
        quantity: 1
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 ease-out border border-slate-100 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Product Image */}
        <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto bg-slate-50 flex items-center justify-center min-h-[300px]">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover object-center transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
              <ShoppingBag className="h-16 w-16 text-slate-300" />
            </div>
          )}

          {countInStock <= 0 ? (
            <div className="absolute top-4 left-4 rounded-xl bg-red-500/90 backdrop-blur-xs px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
              Out of Stock
            </div>
          ) : countInStock <= 5 ? (
            <div className="absolute top-4 left-4 rounded-xl bg-amber-500/90 backdrop-blur-xs px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm animate-pulse">
              Only {countInStock} Left in Stock
            </div>
          ) : (
            <div className="absolute top-4 left-4 rounded-xl bg-emerald-500/90 backdrop-blur-xs px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              In Stock
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Close trigger button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-650 transition cursor-pointer z-20 bg-white/80 border border-slate-100"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Categories and Brand Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {brand && (
                <span className="rounded-xl bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-600 border border-blue-100 shadow-xs">
                  {brand}
                </span>
              )}
              {category && (
                <span className="rounded-xl bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 border border-slate-200/60 shadow-xs">
                  {category}
                </span>
              )}
            </div>

            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
              {name}
            </h2>
            
            {user?.name && (
              <p className="text-[11px] font-semibold text-slate-400">
                Listed by Seller: <span className="text-slate-650 font-bold">{user.name}</span>
              </p>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-750 uppercase tracking-widest">About this item</h4>
            <p className="text-sm text-slate-550 leading-relaxed font-medium">
              {description}
            </p>
          </div>

          {/* Purchase Details */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 mt-auto">
            <div>
              <span className="text-xs text-slate-400 block font-semibold">Total Price (COD)</span>
              <span className="text-2xl md:text-3xl font-black text-slate-900">
                ₹{Number(price).toLocaleString('en-IN')}
              </span>
            </div>

            {quantity === 0 ? (
              <button
                type="button"
                disabled={countInStock <= 0}
                onClick={() => updateCartQuantity(1)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:scale-[1.02] active:scale-98 transition disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:scale-100 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Shopping Cart
              </button>
            ) : (
              <div className="flex-1 sm:flex-none flex items-center justify-between gap-4 border border-slate-200 rounded-2xl bg-slate-50/50 p-2 shadow-xs shrink-0 max-w-[200px]">
                <button
                  type="button"
                  onClick={() => updateCartQuantity(-1)}
                  className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-205 text-slate-500 active:scale-90 transition cursor-pointer flex items-center justify-center shrink-0 bg-transparent shadow-none"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-black text-slate-800 select-none">
                  {quantity} in Cart
                </span>
                <button
                  type="button"
                  onClick={() => updateCartQuantity(1)}
                  className="p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-250 text-slate-500 active:scale-90 transition cursor-pointer flex items-center justify-center shrink-0 bg-transparent shadow-none"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Secure Trust Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Genuine Product Assured</span>
            </div>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>24/7 Seller Support</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default ProductDetailModal