import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { ReceiptText, RefreshCw } from 'lucide-react'
import { api, ORDER_STATUSES } from '../../services/api'
import { orderNumber, plural, rupees, shortDate } from '../../lib/format'
import { Button, EmptyState, Notice, PageLoader, ProductImage, StatusPill, useToast } from '../../components/ui'
import { PageHeader } from './AdminLayout'

const TABS = ['All', ...ORDER_STATUSES]

export default function Orders() {
  const { orders, loading, error, reload } = useOutletContext()
  const toast = useToast()
  const [tab, setTab] = useState('All')
  const [saving, setSaving] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    document.title = 'Orders | RetailFlow seller'
  }, [])

  const counts = useMemo(() => {
    const map = { All: orders.length }
    ORDER_STATUSES.forEach((status) => (map[status] = orders.filter((o) => o.status === status).length))
    return map
  }, [orders])

  const visible = tab === 'All' ? orders : orders.filter((o) => o.status === tab)

  const setStatus = async (order, status) => {
    setSaving(order._id)
    try {
      await api.updateOrderStatus(order._id, status)
      await reload()
      toast(`Order ${orderNumber(order)} marked ${status.toLowerCase()}`)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setSaving(null)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    await reload()
    setRefreshing(false)
  }

  if (loading) return <PageLoader label="Loading orders" />

  return (
    <>
      <PageHeader title="Orders" lead={orders.length ? `${plural(counts.Pending, 'new order')} waiting` : undefined}>
        <Button variant="quiet" busy={refreshing} onClick={refresh}>
          {!refreshing && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
          Refresh
        </Button>
      </PageHeader>
      {error && <div className="mb-5"><Notice>{error}</Notice></div>}

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <EmptyState icon={ReceiptText} title="No orders yet">
            When a shopper checks out with one of your products, the order lands here.
          </EmptyState>
        </div>
      ) : (
        <>
          <div role="tablist" aria-label="Filter orders by status" className="mb-5 flex gap-1.5 overflow-x-auto pb-1">
            {TABS.map((name) => (
              <button
                key={name}
                role="tab"
                type="button"
                aria-selected={tab === name}
                onClick={() => setTab(name)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold ${tab === name ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:text-blue-600'}`}
              >
                {name} <span className="nums opacity-70">{counts[name]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-10 text-center text-slate-500">No {tab.toLowerCase()} orders right now.</p>}

          <ul className="space-y-4">
            {visible.map((order) => (
              <li key={order._id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="nums flex items-center gap-3 text-lg font-bold text-slate-800">
                      {orderNumber(order)}
                      <StatusPill status={order.status} />
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {shortDate(order.createdAt)}, {order.paymentMethod}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    Move to
                    <select
                      value={order.status}
                      disabled={saving === order._id}
                      onChange={(event) => setStatus(order, event.target.value)}
                      className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[0.95rem] font-medium text-slate-800 disabled:opacity-60"
                    >
                      {ORDER_STATUSES.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-4 grid gap-5 border-t border-slate-200 pt-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                  <ul className="space-y-2.5">
                    {order.orderItems.map((item) => (
                      <li key={item.product} className="flex items-center gap-3">
                        <ProductImage src={item.image} alt="" className="h-10 w-10 shrink-0 rounded-lg" />
                        <span className="min-w-0 flex-1 truncate text-slate-800">{item.name}</span>
                        <span className="nums text-sm text-slate-500">
                          {item.quantity} x {rupees(item.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-[0.95rem]">
                    <p className="font-semibold text-slate-800">{order.user?.name || 'Shopper'}</p>
                    {order.user?.email && <p className="truncate text-slate-500">{order.user.email}</p>}
                    <p className="mt-1.5 text-slate-500">
                      {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </p>
                    <p className="nums mt-2 text-lg font-bold text-slate-800">{rupees(order.totalPrice)} to collect</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
