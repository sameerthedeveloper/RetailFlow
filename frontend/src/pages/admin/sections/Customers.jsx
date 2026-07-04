import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Users, Mail, Calendar, RefreshCw, Loader2, User } from 'lucide-react'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchCustomers = async (isSilent = false) => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    try {
      if (!isSilent) setLoading(true)
      else setRefreshing(true)

      const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api'
      const response = await axios.get(`${baseUrl}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setCustomers(response.data)
      setError('')
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('Failed to load customers list.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white h-full">
        <Loader2 className="w-8 h-8 text-blue-650 animate-spin" />
        <p className="text-slate-550 text-sm mt-3 font-medium">Loading customers directory...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Customers Database</h1>
          <p className="text-xs text-slate-405 font-semibold mt-1">Users who have placed orders for your products</p>
        </div>
        <button
          onClick={() => fetchCustomers(true)}
          disabled={refreshing}
          className="flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Customers List Card Table */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl overflow-hidden flex flex-col shadow-xs min-h-0">
        <div className="flex-1 overflow-y-auto pr-1">
          {customers.length === 0 ? (
            <div className="py-24 text-center text-slate-400">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-slate-700">No buyers found</p>
              <p className="text-xs text-slate-500 mt-1">Customers purchasing your inventory will appear in this list.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Name</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-slate-50/40 transition">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-bold text-sm shrink-0">
                          {customer.name?.charAt(0) || <User className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{customer.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                        <Calendar className="w-4 h-4 text-slate-350 shrink-0" />
                        {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

export default Customers
