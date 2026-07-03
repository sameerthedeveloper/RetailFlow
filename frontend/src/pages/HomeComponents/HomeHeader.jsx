import React from 'react'
import { Search, User, ShoppingCart } from 'lucide-react'
import logo from '../../assets/logo.png'

function HomeHeader({ user, isAccountMenuOpen, onToggleAccount, onLogout, onSearchToggle, activePage, onPageChange }) {
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
          <button
            onClick={() => onPageChange?.('categories')}
            className={`cursor-pointer transition-colors ${activePage === 'categories' ? 'font-semibold text-blue-600' : 'hover:text-slate-800'}`}
          >
            Categories
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
            className="rounded-full p-2 hover:bg-slate-100"

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
                onClick={onLogout}
                className="mt-3 flex w-full items-center justify-center rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          )}

          <button aria-label="Cart" className="relative rounded-full p-2 hover:bg-slate-100">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-blue-600" />
          </button>
        </div>
      </header>
    </div>
  )
}

export default HomeHeader
