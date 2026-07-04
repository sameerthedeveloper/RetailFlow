import React, { useState, useEffect } from 'react'
import { Search, User, ShoppingCart, ShoppingBag } from 'lucide-react'
import logo from '../../assets/logo.png'

function HomeHeader({ user, isAccountMenuOpen, onToggleAccount, onLogout, onSearchToggle, activePage, onPageChange, onCartToggle, onOrdersToggle }) {
  const [cartCount, setCartCount] = useState(0)

  const updateCartCount = () => {
    try {
      const stored = localStorage.getItem('cart')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          const total = parsed.reduce((sum, item) => sum + (item.quantity || 1), 0)
          setCartCount(total)
          return
        }
      }
    } catch (e) {}
    setCartCount(0)
  }

  useEffect(() => {
    updateCartCount()
    window.addEventListener('cartUpdated', updateCartCount)
    return () => window.removeEventListener('cartUpdated', updateCartCount)
  }, [])

  return (
    <div id="top-head-bg" className="sticky top-2.5 z-50 bg-white/70 backdrop-blur-md mb-5">
      <header className="relative z-100 mx-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/85 px-3 py-3 shadow backdrop-blur-md sm:mx-4 sm:rounded-full sm:px-4 lg:mx-10 lg:px-8">
        <div className="flex items-center gap-2">
          <img src={logo} alt="RetailFlow" className="h-12 rounded-full object-cover sm:h-15" />
        </div>

        <nav className="hidden items-center gap-8 text-sm text-slate-500 md:flex">
          <button
            onClick={() => onPageChange?.('home')}
            className={`cursor-pointer transition-colors ${activePage === 'home' ? 'font-semibold text-blue-600' : 'hover:text-slate-800'}`}
          >
            Home
          </button>
          <button
            onClick={() => onPageChange?.('shop')}
            className={`cursor-pointer transition-colors ${activePage === 'shop' ? 'font-semibold text-blue-600' : 'hover:text-slate-800'}`}
          >
            Shop
          </button>
        </nav>

        <div className="relative flex items-center gap-3 text-slate-600">
          <button
            type="button"
            aria-label="Search"
            onClick={onSearchToggle}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 sm:gap-3 sm:px-4"
          >
            <Search className="h-4 w-4 text-blue-600" />
            <span className="hidden text-sm text-slate-700 sm:inline">Search</span>
            <span className="hidden rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 sm:inline">⌘K</span>
          </button>

          {user?.username && <span className="hidden text-sm font-medium text-slate-700 lg:inline"></span>}

          <button
            aria-label="Account"
            aria-expanded={isAccountMenuOpen}
            onClick={onToggleAccount}
            className="rounded-full p-2 hover:bg-slate-100 cursor-pointer"
          >
            <User className="h-5 w-5" />
          </button>

          {isAccountMenuOpen && (
            <div className="absolute right-0 top-12 z-50 w-[calc(100vw-1.5rem)] max-w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl sm:w-64">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile</p>
                  <p className="truncate text-sm font-semibold text-slate-800">{user?.username || 'User'}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onOrdersToggle?.();
                  onToggleAccount();
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                My Orders
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="mt-3 flex w-full items-center justify-center rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}

          <button
            onClick={onCartToggle}
            aria-label="Cart"
            className="relative rounded-full p-2 hover:bg-slate-100 cursor-pointer transition active:scale-95"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-extrabold text-white ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>
    </div>
  )
}

export default HomeHeader
