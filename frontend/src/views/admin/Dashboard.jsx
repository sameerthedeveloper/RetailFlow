import { useEffect, useMemo } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Boxes } from 'lucide-react'
import { orderNumber, plural, rupees, shortDate } from '../../lib/format'
import { EmptyState, Notice, PageLoader, ProductImage, StatusPill } from '../../components/ui'
import { PageHeader } from './AdminLayout'

const DAY = 24 * 60 * 60 * 1000
const dayKey = (date) => new Date(date).toDateString()

function Stat({ label, value, note, tone = 'text-slate-800' }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`nums mt-1.5 text-3xl font-bold ${tone}`}>{value}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </div>
  )
}

export default function Dashboard() {
  const { products, orders, loading, error, seller } = useOutletContext()

  useEffect(() => {
    document.title = 'RetailFlow | Admin Dashboard'
  }, [])

  const stats = useMemo(() => {
    const live = orders.filter((o) => o.status !== 'Cancelled')
    return {
      revenue: live.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
      liveCount: live.length,
      toFulfil: orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length,
      units: products.reduce((sum, p) => sum + (p.countInStock || 0), 0),
      stockValue: products.reduce((sum, p) => sum + (p.price || 0) * (p.countInStock || 0), 0),
      low: products.filter((p) => p.countInStock <= 5).sort((a, b) => a.countInStock - b.countInStock),
    }
  }, [products, orders])

  const week = useMemo(() => {
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today.getTime() - (6 - i) * DAY)
      const sales = orders
        .filter((o) => o.status !== 'Cancelled' && dayKey(o.createdAt) === dayKey(date))
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0)
      return { day: date.toLocaleDateString('en-IN', { weekday: 'short' }), sales }
    })
  }, [orders])

  if (loading) return <PageLoader label="Loading your counter" />

  const weekTotal = week.reduce((sum, d) => sum + d.sales, 0)

  return (
    <>
      <PageHeader title="Dashboard" lead={`Store overview for ${seller.username}`} />
      {error && <div className="mb-5"><Notice>{error}</Notice></div>}

      {products.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={Boxes}
            title="Your shelf is empty"
            action={
              <Link to="/admin/inventory" className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700">
                Go to inventory
              </Link>
            }
          >
            Add your first product and it shows up in the store straight away.
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat label="Sales" value={rupees(stats.revenue)} note={`from ${plural(stats.liveCount, 'order')}`} />
            <Stat
              label="Orders to fulfil"
              value={stats.toFulfil}
              note={stats.toFulfil ? 'waiting on you' : 'all caught up'}
              tone={stats.toFulfil ? 'text-amber-600' : 'text-slate-800'}
            />
            <Stat label="Units in stock" value={stats.units.toLocaleString('en-IN')} note={`worth ${rupees(stats.stockValue)}`} />
            <Stat
              label="Running low"
              value={stats.low.length}
              note={stats.low.length ? '5 units or fewer' : 'stock looks healthy'}
              tone={stats.low.length ? 'text-red-600' : 'text-slate-800'}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5" aria-labelledby="week-heading">
              <div className="flex items-baseline justify-between">
                <h2 id="week-heading" className="text-lg font-bold text-slate-800">
                  Sales, last 7 days
                </h2>
                <p className="nums text-lg font-bold text-slate-800">{rupees(weekTotal)}</p>
              </div>
              {weekTotal === 0 ? (
                <p className="grid h-56 place-items-center text-center text-[0.95rem] text-slate-500">
                  No sales this week yet. New orders will show up here.
                </p>
              ) : (
                <div className="mt-4 h-56" role="img" aria-label={`Bar chart of daily sales. Total ${rupees(weekTotal)} this week.`}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={week} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                      <YAxis
                        width={52}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#64748b', fontSize: 13 }}
                        tickFormatter={(v) => (v >= 1000 ? `₹${v / 1000}k` : `₹${v}`)}
                      />
                      <Tooltip
                        cursor={{ fill: '#eff6ff' }}
                        formatter={(value) => [rupees(value), 'Sales']}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 14 }}
                      />
                      <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5" aria-labelledby="low-heading">
              <div className="flex items-baseline justify-between">
                <h2 id="low-heading" className="text-lg font-bold text-slate-800">
                  Running low
                </h2>
                <Link to="/admin/inventory" className="text-sm font-semibold text-blue-600 underline underline-offset-4">
                  Restock
                </Link>
              </div>
              {stats.low.length === 0 ? (
                <p className="py-10 text-center text-[0.95rem] text-slate-500">Every product has more than 5 units.</p>
              ) : (
                <ul className="mt-3 divide-y divide-slate-100">
                  {stats.low.slice(0, 5).map((product) => (
                    <li key={product._id} className="flex items-center gap-3 py-2.5">
                      <ProductImage src={product.image} alt="" className="h-10 w-10 shrink-0 rounded-lg" />
                      <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{product.name}</span>
                      <span className={`nums text-sm font-bold ${product.countInStock <= 0 ? 'text-red-600' : 'text-amber-600'}`}>
                        {product.countInStock <= 0 ? 'Sold out' : `${product.countInStock} left`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm p-5" aria-labelledby="recent-heading">
            <div className="flex items-baseline justify-between">
              <h2 id="recent-heading" className="text-lg font-bold text-slate-800">
                Latest orders
              </h2>
              <Link to="/admin/orders" className="text-sm font-semibold text-blue-600 underline underline-offset-4">
                All orders
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="py-10 text-center text-[0.95rem] text-slate-500">No orders yet. They appear here the moment a shopper checks out.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <li key={order._id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                    <span className="nums w-20 font-bold text-slate-800">{orderNumber(order)}</span>
                    <span className="min-w-0 flex-1 truncate text-slate-800">{order.user?.name || 'Shopper'}</span>
                    <span className="text-sm text-slate-500">{shortDate(order.createdAt)}</span>
                    <StatusPill status={order.status} />
                    <span className="nums w-24 text-right font-semibold text-slate-800">{rupees(order.totalPrice)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  )
}
