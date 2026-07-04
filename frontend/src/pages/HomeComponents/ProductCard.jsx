import React, { useState, useEffect } from 'react'
import { ShoppingCart, ShoppingBag, Plus, Minus } from 'lucide-react'

function ProductCard({ product }) {
  const { name, price, description, brand, category, countInStock, image, user } = product;
  const [quantity, setQuantity] = useState(0)

  const updateLocalQuantity = () => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        const cart = JSON.parse(storedCart);
        if (Array.isArray(cart)) {
          const item = cart.find((item) => item._id === product._id);
          setQuantity(item ? (item.quantity || 1) : 0);
          return;
        }
      }
    } catch (e) {
      console.error('Error reading quantity from cart:', e);
    }
    setQuantity(0);
  }

  useEffect(() => {
    updateLocalQuantity();
    window.addEventListener('cartUpdated', updateLocalQuantity);
    return () => window.removeEventListener('cartUpdated', updateLocalQuantity);
  }, [product._id]);

  const updateCartQuantity = (delta) => {
    let cart = [];
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        cart = JSON.parse(storedCart);
        if (!Array.isArray(cart)) {
          cart = [];
        }
      }
    } catch (error) {
      cart = [];
    }

    const existingIndex = cart.findIndex((item) => item._id === product._id);
    if (existingIndex > -1) {
      const newQty = (cart[existingIndex].quantity || 1) + delta;
      if (newQty <= 0) {
        cart.splice(existingIndex, 1);
      } else {
        const maxAllowed = Math.min(product.countInStock || 6, 6);
        cart[existingIndex].quantity = Math.min(maxAllowed, newQty);
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
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="group relative flex flex-col h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      
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

        {countInStock <= 0 ? (
          <div className="absolute top-4 left-4 rounded-xl bg-red-500/90 backdrop-blur-xs px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            Out of Stock
          </div>
        ) : countInStock <= 5 ? (
          <div className="absolute top-4 left-4 rounded-xl bg-amber-500/90 backdrop-blur-xs px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            Only {countInStock} Left
          </div>
        ) : null}

        {brand && (
          <div className="absolute bottom-4 left-4 rounded-xl bg-white/80 backdrop-blur-xs px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-100 shadow-xs">
            {brand}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {category || 'General'}
          </span>
          {user?.name && (
            <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full font-medium truncate max-w-[120px]" title={`Listed by ${user.name}`}>
              By {user.name}
            </span>
          )}
        </div>

        <h3 className="mt-1.5 text-base font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
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

          {quantity === 0 ? (
            <button
              type="button"
              disabled={countInStock <= 0}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/10 transition-all duration-200 hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:scale-100 cursor-pointer"
              onClick={() => updateCartQuantity(1)}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex h-11 items-center border border-slate-200 rounded-2xl bg-slate-50/50 shadow-sm overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => updateCartQuantity(-1)}
                className="h-full px-3 hover:bg-slate-100 text-slate-500 active:scale-90 transition cursor-pointer flex items-center justify-center"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-1 text-sm font-black text-slate-800 min-w-[24px] text-center select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => updateCartQuantity(1)}
                className="h-full px-3 hover:bg-slate-100 text-slate-500 active:scale-90 transition cursor-pointer flex items-center justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductCard
