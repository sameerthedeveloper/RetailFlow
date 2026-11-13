import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Search, ShoppingBag, ShoppingCart, Store, UserRound } from 'lucide-react'
import { api, backend } from '../../services/api'
import { useCart } from '../../lib/cart'
import { useSession } from '../../lib/session'
import { Wordmark } from '../../components/ui'
import CartDrawer from './CartDrawer'
import ProductSheet from './ProductSheet'
import SearchPalette from './SearchPalette'

const navLink = ({ isActive }) => `transition-colors ${isActive ? 'font-semibold text-blue-600' : 'text-slate-500 hover:text-slate-800'}`

function AccountMenu() {
  const { user, loading, signOut } = useSession('customer')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const close = (event) => {
      if (event.key === 'Escape' || (event.type === 'pointerdown' && !ref.current?.contains(event.target))) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  if (loading) return <span className="skeleton h-9 w-9 rounded-full" />
  if (!user) {
    return (
      <Link to="/login" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
        <UserRound className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.username}`}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full p-2 transition hover:bg-slate-100"
      >
        <UserRound className="h-5 w-5" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{user.username}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
          <Link
            role="menuitem"
            to="/orders"
            onClick={() => setOpen(false)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ShoppingBag className="h-4 w-4 text-blue-600" aria-hidden="true" />
            My orders
          </Link>
          <button
            role="menuitem"
            type="button"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            onClick={async () => {
              setOpen(false)
              await signOut()
              navigate('/')
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

export default function StoreLayout() {
  const { count } = useCart()
  const [catalog, setCatalog] = useState({ products: [], loading: true, error: '' })
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [viewing, setViewing] = useState(null)

  const reload = useCallback(async () => {
    try {
      const products = await api.listProducts()
      setCatalog({ products, loading: false, error: '' })
    } catch (err) {
      setCatalog({ products: [], loading: false, error: err.message })
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    const onKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Always show the freshest stock for the product being viewed.
  const viewed = viewing && (catalog.products.find((p) => p._id === viewing._id) || viewing)

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>

      <div className="sticky top-2.5 z-30 mb-5 px-3 sm:px-4 lg:px-10">
        <header className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/85 px-3 py-2.5 shadow backdrop-blur-md sm:gap-4 sm:rounded-full sm:px-5 lg:px-8">
          <Link to="/" aria-label="RetailFlow home" className="mr-2 shrink-0">
            <Wordmark className="h-10 sm:h-12" />
          </Link>

          <nav aria-label="Store" className="mx-auto hidden items-center gap-8 text-sm md:flex">
            <NavLink to="/" end className={navLink}>Home</NavLink>
            <NavLink to="/shop" className={navLink}>Shop</NavLink>
            <NavLink to="/orders" className={navLink}>My orders</NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-1.5 text-slate-600 sm:gap-3 md:ml-0">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-2 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 sm:gap-3 sm:px-4"
            >
              <Search className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <span className="hidden text-sm text-slate-700 sm:inline">Search</span>
              <span className="sr-only sm:hidden">Search</span>
              <kbd className="hidden rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 font-sans text-xs font-medium text-blue-600 sm:inline">Ctrl K</kbd>
            </button>

            <AccountMenu />

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
              className="relative rounded-full p-2 transition hover:bg-slate-100 active:scale-95"
            >
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {count > 0 && (
                <span className="nums absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[11px] font-extrabold text-white ring-2 ring-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </header>

        <nav aria-label="Store" className="mt-2 flex justify-center gap-6 rounded-full border border-gray-200 bg-white/85 px-4 py-2 text-sm shadow-sm backdrop-blur-md md:hidden">
          <NavLink to="/" end className={navLink}>Home</NavLink>
          <NavLink to="/shop" className={navLink}>Shop</NavLink>
          <NavLink to="/orders" className={navLink}>My orders</NavLink>
        </nav>
      </div>

      <main id="main" className="w-full flex-1 px-4 pb-16 pt-2 sm:px-6 lg:px-10">
        <Outlet context={{ ...catalog, reload, openProduct: setViewing, openCart: () => setCartOpen(true) }} />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="flex flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p>
            RetailFlow. Cash on delivery on every order.
            {backend === 'local' && ' Preview mode: data is saved in this browser only.'}
          </p>
          <Link to="/admin" className="inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline">
            <Store className="h-4 w-4" aria-hidden="true" />
            Sell on RetailFlow
          </Link>
        </div>
      </footer>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} products={catalog.products} onPick={setViewing} />
      <ProductSheet product={viewed} onClose={() => setViewing(null)} onViewCart={() => { setViewing(null); setCartOpen(true) }} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onOrderPlaced={reload} />
    </div>
  )
}
