import { ShoppingBag, Truck, Wallet } from 'lucide-react'
import { cart, limitFor, useCart } from '../../lib/cart'
import { categoryOf } from '../../lib/format'
import { Button, Modal, Price, ProductImage, QuantityStepper, StockNote } from '../../components/ui'

export default function ProductSheet({ product, onClose, onViewCart }) {
  const { quantityOf } = useCart()
  const quantity = product ? quantityOf(product._id) : 0
  const soldOut = product?.countInStock <= 0

  return (
    <Modal open={Boolean(product)} onClose={onClose} title="Product details" wide>
      {product && (
        <div className="grid gap-6 p-5 sm:grid-cols-2 sm:gap-8 sm:p-6">
          <ProductImage src={product.image} alt={product.name} className="aspect-square w-full rounded-2xl sm:aspect-[4/5]" />

          <div className="flex flex-col">
            <p className="text-sm font-medium text-slate-500">
              {[product.brand, categoryOf(product)].filter(Boolean).join(', ')}
            </p>
            <h3 className="mt-1 text-2xl font-extrabold text-slate-800 sm:text-3xl">{product.name}</h3>

            <div className="mt-4 flex items-center gap-4">
              <Price amount={product.price} className="text-3xl" />
              <StockNote count={product.countInStock} />
            </div>

            <p className="mt-5 max-w-prose text-slate-600">{product.description}</p>

            <ul className="mt-5 space-y-2 text-sm text-slate-500">
              <li className="flex items-center gap-2.5">
                <Wallet className="h-4 w-4 text-blue-600" aria-hidden="true" />
                Pay cash when it arrives
              </li>
              <li className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                Free delivery{product.user?.name ? `, shipped by ${product.user.name}` : ''}
              </li>
            </ul>

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
              {quantity > 0 ? (
                <>
                  <QuantityStepper quantity={quantity} max={limitFor(product)} onChange={(next) => cart.setQuantity(product, next)} />
                  <Button onClick={onViewCart} className="flex-1">
                    <ShoppingBag className="h-5 w-5" aria-hidden="true" />
                    View cart
                  </Button>
                </>
              ) : (
                <Button size="lg" disabled={soldOut} onClick={() => cart.setQuantity(product, 1)} className="flex-1">
                  {soldOut ? 'Sold out' : 'Add to cart'}
                </Button>
              )}
            </div>
            {quantity >= limitFor(product) && quantity > 0 && (
              <p className="mt-2 text-sm text-slate-500">That is the most you can order of this item.</p>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
