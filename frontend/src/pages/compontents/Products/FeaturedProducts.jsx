import React, { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import ProductCard from '../ProductCard'
import ProductDetailModal from './ProductDetailModal'

export default function FeaturedProduncts({ products }) {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const handleProductClick = (product) => {
    setSelectedProduct(product)
    setIsDetailOpen(true)
  }

  return (
    <section className="mt-16">
      <div className="flex flex-col gap-1 mb-8">
        <h2 className="text-2xl font-bold text-slate-800 sm:text-3xl tracking-tight">Featured Products</h2>
        <p className="text-sm text-slate-500">Explore our curated selection of premium arrivals</p>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center text-slate-450 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <ShoppingBag className="w-12 h-12 text-slate-350 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-700">No products available</p>
          <p className="text-xs text-slate-500 mt-1">Check back later or register products via Admin Panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product._id || product.name}
              product={product}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>
      )}

      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        product={selectedProduct}
      />
    </section>
  )
}