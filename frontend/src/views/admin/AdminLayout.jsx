import { Suspense, useCallback, useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ExternalLink, LayoutDashboard, LogOut, Package, Settings, ShoppingBag, User, Users } from 'lucide-react'
import { api } from '../../services/api'
import { useSession } from '../../lib/session'
import { PageLoader, Wordmark } from '../../components/ui'

const NAV = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/inventory', icon: Package, label: 'Inventory' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout() {
  const { user, signOut } = useSession('admin')
  const navigate = useNavigate()
  const [data, setData] = useState({ products: [], orders: [], loading: true, error: '' })

  // Every seller screen reads the same products and orders, so load them once here.
  const reload = useCallback(async () => {
    try {
      const [products, orders] = await Promise.all([api.listProducts({ sellerOnly: true }), api.sellerOrders()])
      setData({ products, orders, loading: false, error: '' })
    } catch (err) {
      setData((prev) => ({ ...prev, loading: false, error: err.message }))
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const waiting = data.orders.filter((o) => o.status === 'Pending').length

  const leave = async () => {
    await signOut()
    navigate('/admin/login')
  }

  const navClass = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
      isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' : 'text-slate-700 hover:bg-slate-50'
    }`

  return (
    <div className="flex min-h-screen bg-[#f4f6fb] lg:h-screen lg:gap-3 lg:overflow-hidden lg:p-3">
      <aside className="hidden h-full w-60 shrink-0 flex-col rounded-3xl border border-gray-200 bg-white px-4 py-6 shadow lg:flex">
        <div className="mb-8 px-2">
          <Wordmark className="h-12" />
        </div>

        <nav aria-label="Seller" className="flex-1 space-y-2 overflow-y-auto">
          {NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end} className={navClass}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
              {label === 'Orders' && waiting > 0 && (
                <span className="nums ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700" aria-label={`${waiting} new`}>
                  {waiting}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4">
          <Link to="/" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <ExternalLink className="h-4 w-4 text-blue-600" aria-hidden="true" />
            View storefront
          </Link>
          <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
            <User className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block truncate font-semibold text-slate-700">{user.username}</span>
              <span className="block truncate text-xs text-slate-500">{user.email}</span>
            </span>
          </div>
          <button type="button" onClick={leave} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-500 hover:text-white">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:h-full">
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
          <Wordmark className="h-9" />
          <button type="button" onClick={leave} className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500">
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </header>

        <main className="flex-1 bg-white px-4 pb-28 pt-6 sm:px-8 lg:overflow-y-auto lg:rounded-3xl lg:border lg:border-gray-200 lg:p-8 lg:shadow">
          <Suspense fallback={<PageLoader />}>
            <Outlet context={{ ...data, reload, seller: user }} />
          </Suspense>
        </main>

        <nav aria-label="Seller" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-gray-200 bg-white lg:hidden">
          {NAV.map(({ to, end, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

export function PageHeader({ title, lead, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        {lead && <p className="mt-1 text-slate-500">{lead}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  )
}
