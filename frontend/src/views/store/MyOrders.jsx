import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Package } from 'lucide-react'
import { api } from '../../services/api'
import { orderNumber, plural, rupees, shortDate } from '../../lib/format'
import { Button, EmptyState, Notice, PageLoader, ProductImage, StatusPill } from '../../components/ui'

const JOURNEY = ['Pending', 'Processing', 'Shipped', 'Delivered']
const JOURNEY_LABELS = { Pending: 'Placed', Processing: 'Packing', Shipped: 'On the way', Delivered: 'Delivered' }

// An order really does move through these stages in order, so show it as steps.
function Journey({ status }) {
  const reached = JOURNEY.indexOf(status)
  return (
    <ol className="grid grid-cols-4" aria-label={`Order progress: ${JOURNEY_LABELS[status]}`}>
      {JOURNEY.map((stage, index) => {
        const done = index <= reached
        return (
          <li key={stage} className="relative flex flex-col items-center text-center" aria-current={index === reached ? 'step' : undefined}>
            {index > 0 && <span className={`absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2 ${done ? 'bg-blue-600' : 'bg-slate-200'}`} aria-hidden="true" />}
            <span className={`relative grid h-6 w-6 place-items-center rounded-full ${done ? 'bg-blue-600 text-white' : 'border-2 border-slate-200 bg-white'}`}>
              {done && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
            <span className={`mt-2 text-xs sm:text-sm ${done ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>{JOURNEY_LABELS[stage]}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default function MyOrders() {
  const [state, setState] = useState({ orders: [], loading: true, error: '' })

  const load = async () => {
    setState((prev) => ({ ...prev, loading: true, error: '' }))
    try {
      setState({ orders: await api.myOrders(), loading: false, error: '' })
    } catch (err) {
      setState({ orders: [], loading: false, error: err.message })
    }
  }

  useEffect(() => {
    document.title = 'RetailFlow | My orders'
    load()
  }, [])

  if (state.loading) return <PageLoader label="Loading your orders" />

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">My orders</h1>

      {state.error && (
        <div className="mt-6 space-y-3">
          <Notice>{state.error}</Notice>
          <Button variant="quiet" onClick={load}>
            Try again
          </Button>
        </div>
      )}

      {!state.error && state.orders.length === 0 && (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={Package}
            title="No orders yet"
            action={
              <Link to="/shop" className="inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700">
                Browse the shop
              </Link>
            }
          >
            When you place an order you can follow it here until it reaches you.
          </EmptyState>
        </div>
      )}

      <ul className="mt-6 space-y-5">
        {state.orders.map((order) => (
          <li key={order._id} className="rounded-3xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="nums text-xl font-bold text-slate-800">Order {orderNumber(order)}</h2>
                <p className="text-sm text-slate-500">
                  Placed {shortDate(order.createdAt)}, {plural(order.orderItems.reduce((n, i) => n + i.quantity, 0), 'item')}
                </p>
              </div>
              {order.status === 'Cancelled' && <StatusPill status="Cancelled" />}
            </div>

            <div className="mt-5">
              {order.status === 'Cancelled' ? (
                <Notice>The seller cancelled this order. Nothing is due.</Notice>
              ) : (
                <Journey status={order.status} />
              )}
            </div>

            <ul className="mt-5 divide-y divide-slate-100 border-t border-slate-200">
              {order.orderItems.map((item) => (
                <li key={item.product} className="flex items-center gap-3 py-3">
                  <ProductImage src={item.image} alt="" className="h-12 w-12 shrink-0 rounded-lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-slate-800">{item.name}</span>
                    <span className="text-sm text-slate-500">
                      {item.quantity} x {rupees(item.price)}
                    </span>
                  </span>
                  <span className="nums font-semibold text-slate-800">{rupees(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-end justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="max-w-xs text-sm text-slate-500">
                Delivering to {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
              </p>
              <p className="text-right">
                <span className="block text-sm text-slate-500">{order.status === 'Delivered' ? 'Paid in cash' : 'Cash due on delivery'}</span>
                <span className="nums text-xl font-bold text-slate-800">{rupees(order.totalPrice)}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
