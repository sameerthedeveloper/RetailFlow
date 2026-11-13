import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Users } from 'lucide-react'
import { api } from '../../services/api'
import { plural, rupees, shortDate } from '../../lib/format'
import { EmptyState, Notice, PageLoader } from '../../components/ui'
import { PageHeader } from './AdminLayout'

export default function Customers() {
  const { orders } = useOutletContext()
  const [state, setState] = useState({ customers: [], loading: true, error: '' })

  useEffect(() => {
    document.title = 'Customers | RetailFlow seller'
    api
      .listCustomers()
      .then((customers) => setState({ customers, loading: false, error: '' }))
      .catch((err) => setState({ customers: [], loading: false, error: err.message }))
  }, [])

  // Join each customer with what they have ordered from this seller.
  const rows = useMemo(() => {
    const totals = new Map()
    for (const order of orders) {
      const id = order.user?._id || order.user
      const entry = totals.get(id) || { count: 0, spent: 0, last: '' }
      entry.count += 1
      if (order.status !== 'Cancelled') entry.spent += order.totalPrice || 0
      if (order.createdAt > entry.last) entry.last = order.createdAt
      totals.set(id, entry)
    }
    return state.customers
      .map((customer) => ({ ...customer, ...(totals.get(customer._id) || { count: 0, spent: 0, last: '' }) }))
      .sort((a, b) => b.spent - a.spent)
  }, [state.customers, orders])

  if (state.loading) return <PageLoader label="Loading customers" />

  return (
    <>
      <PageHeader title="Customers" lead={rows.length ? `${plural(rows.length, 'shopper')} bought from you` : undefined} />
      {state.error && <div className="mb-5"><Notice>{state.error}</Notice></div>}

      {rows.length === 0 && !state.error ? (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <EmptyState icon={Users} title="No customers yet">
            Shoppers appear here after their first order with you.
          </EmptyState>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-[0.95rem]">
            <thead className="border-b border-slate-200 text-sm text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Customer</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Orders</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Spent</th>
                <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Last order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((customer) => (
                <tr key={customer._id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 font-bold text-slate-800">
                        {customer.name?.[0]?.toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">{customer.name}</p>
                        <a href={`mailto:${customer.email}`} className="block truncate text-sm text-slate-500 hover:text-blue-600 hover:underline">
                          {customer.email}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td className="nums px-4 py-3 text-right font-semibold text-slate-800">{customer.count}</td>
                  <td className="nums px-4 py-3 text-right font-semibold text-slate-800">{rupees(customer.spent)}</td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">{shortDate(customer.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
