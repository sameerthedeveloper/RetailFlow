import React from 'react'
import { ShoppingCart, ShoppingBag } from 'lucide-react'

function ProductCard({ product }) {
  const { name, price, description, brand, category, countInStock, image } = product

  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Image Wrapper */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        {image ? (
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover object-center transition-transform duration-550 ease-out group-hover:scale-106"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
            <ShoppingBag className="h-10 w-10 text-slate-350" />
          </div>
        )}

        {/* Stock Badge Overlay */}
        {countInStock <= 0 ? (
          <div className="absolute top-4 left-4 rounded-xl bg-red-500/90 backdrop-blur-xs px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            Out of Stock
          </div>
        ) : countInStock <= 5 ? (
          <div className="absolute top-4 left-4 rounded-xl bg-amber-500/90 backdrop-blur-xs px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            Only {countInStock} Left
          </div>
        ) : null}

        {/* Brand Badge */}
        {brand && (
          <div className="absolute bottom-4 left-4 rounded-xl bg-white/80 backdrop-blur-xs px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-100 shadow-xs">
            {brand}
          </div>
        )}
      </div>

      {/* Info Wrapper */}
      <div className="flex flex-1 flex-col p-5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {category || 'General'}
        </span>
        
        <h3 className="mt-1 text-base font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {description}
        </p>

        <div className="mt-auto pt-5 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 block">Price</span>
            <span className="text-xl font-black text-slate-900">
              ₹{Number(price).toLocaleString('en-IN')}
            </span>
          </div>

          <button
            type="button"
            disabled={countInStock <= 0}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/10 transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:scale-100 cursor-pointer"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
