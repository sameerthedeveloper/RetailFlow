import { ShoppingCart } from 'lucide-react'
import { cart, limitFor, useCart } from '../../lib/cart'
import { categoryOf } from '../../lib/format'
import { Price, ProductImage, QuantityStepper } from '../../components/ui'

const GRID = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

export default function ProductCard({ product, onOpen }) {
  const { quantityOf } = useCart()
  const quantity = quantityOf(product._id)
  const soldOut = product.countInStock <= 0
  const low = !soldOut && product.countInStock <= 5

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <ProductImage
          src={product.image}
          alt=""
          className={`h-full w-full transition-transform duration-500 ease-out group-hover:scale-105 ${soldOut ? 'opacity-60 grayscale' : ''}`}
        />
        {(soldOut || low) && (
          <span className={`absolute left-4 top-4 rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-sm ${soldOut ? 'bg-red-500/90' : 'bg-amber-500/90'}`}>
            {soldOut ? 'Out of stock' : `Only ${product.countInStock} left`}
          </span>
        )}
        {product.brand && (
          <span className="absolute bottom-4 left-4 rounded-xl border border-slate-100 bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 backdrop-blur-xs">
            {product.brand}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-400">{categoryOf(product)}</span>
          {product.user?.name && (
            <span className="max-w-[9rem] truncate rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500">
              By {product.user.name}
            </span>
          )}
        </div>

        <h3 className="mt-1.5 text-base font-bold text-slate-800 transition-colors group-hover:text-blue-600">
          {/* The whole card opens the product; the cart control sits above this link. */}
          <button type="button" onClick={() => onOpen(product)} className="line-clamp-1 text-left after:absolute after:inset-0 after:rounded-3xl">
            {product.name}
          </button>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <div>
            <span className="block text-xs text-slate-400">Price</span>
            <Price amount={product.price} />
          </div>

          <div className="relative z-10 shrink-0">
            {quantity > 0 ? (
              <QuantityStepper
                quantity={quantity}
                max={limitFor(product)}
                onChange={(next) => cart.setQuantity(product, next)}
                label={`Quantity of ${product.name}`}
              />
            ) : (
              <button
                type="button"
                disabled={soldOut}
                aria-label={`Add ${product.name} to cart`}
                onClick={() => cart.setQuantity(product, 1)}
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/10 transition-all duration-200 hover:scale-105 hover:bg-blue-700 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
              >
                <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function ProductGrid({ products, onOpen }) {
  return (
    <div className={GRID}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} onOpen={onOpen} />
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className={GRID} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
          <div className="skeleton aspect-square w-full rounded-none" />
          <div className="space-y-2.5 p-5">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3.5 w-full" />
            <div className="skeleton h-6 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
