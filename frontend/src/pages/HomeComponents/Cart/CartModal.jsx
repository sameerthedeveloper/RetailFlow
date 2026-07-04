import React, { useEffect, useState } from 'react'
import { X, ShoppingBag, Trash2, Plus, Minus, CreditCard, ArrowRight } from 'lucide-react'
import CheckoutModal from './CheckoutModal'

function CartModal({ isOpen, onClose }) {
  const [cartItems, setCartItems] = useState([])
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const loadCart = () => {
    try {
      const storedCart = localStorage.getItem('cart')
      if (storedCart) {
        const parsed = JSON.parse(storedCart)
        if (Array.isArray(parsed)) {
          setCartItems(parsed)
          return
        }
      }
    } catch (e) {
      console.error(e)
    }
    setCartItems([])
  }

  useEffect(() => {
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [])

  const updateQuantity = (itemId, delta) => {
    const updated = cartItems.map(item => {
      if (item._id === itemId) {
        const newQty = (item.quantity || 1) + delta
        // Cap the maximum quantity to the available stock or a hard limit of 6 items
        const maxAllowed = Math.min(item.countInStock || 6, 6)
        return { ...item, quantity: Math.max(1, Math.min(maxAllowed, newQty)) }
      }
      return item
    })
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (itemId) => {
    const updated = cartItems.filter(item => item._id !== itemId)
    setCartItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`fixed m-3  border rounded-3xl right-0 top-0 bottom-0 z-50 flex  w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out border-l border-slate-100 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              Your Cart
              {totalItems > 0 && (
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-slate-350" />
              </div>
              <p className="text-base font-semibold text-slate-700">Your cart is empty</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">Items you add to your shopping bag will appear here.</p>
              <button
                onClick={onClose}
                className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
              >
                Continue Shopping &rarr;
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 p-3 border border-slate-100 rounded-2xl hover:bg-slate-55 transition duration-150"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-6 h-6 text-slate-350" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    {item.brand || item.category || 'General'}
                  </span>
                  <h4 className="text-sm font-bold text-slate-800 truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    {/* Price */}
                    <span className="text-sm font-extrabold text-slate-900">
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm shrink-0">
                      <button
                        onClick={() => updateQuantity(item._id, -1)}
                        className="p-1 px-2 hover:bg-slate-50 text-slate-500 active:scale-90 transition cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-700 min-w-[20px] text-center select-none">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, 1)}
                        className="p-1 px-2 hover:bg-slate-50 text-slate-500 active:scale-90 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item._id)}
                  className="rounded-full p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-4 shrink-0">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Shipping</span>
                <span className="text-emerald-600 font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-dashed border-slate-200">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Checkout Now
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700 py-2 transition cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        totalPrice={totalPrice}
        onOrderSuccess={() => {
          setIsCheckoutOpen(false)
          onClose()
        }}
      />
    </>
  )
}

export default CartModal
