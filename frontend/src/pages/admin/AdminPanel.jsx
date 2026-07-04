import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ShoppingBag, Package, Users, TrendingUp,
  BarChart3, Megaphone, Percent, Settings, LogOut, ChevronDown,
  Bell, Headphones, Watch, Footprints, Backpack, Glasses, User, Mail
} from 'lucide-react'
import logo from './assets/logo.png'
import Dashboard from './sections/Dashboard';
import Products from './sections/Products';
import Orders from './sections/Orders';
import Customers from './sections/Customers';
import SettingsPage from './sections/Settings';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'orders', icon: ShoppingBag, label: 'Orders' },
  { key: 'products', icon: Package, label: 'Inventory' },
  { key: 'customers', icon: Users, label: 'Customers' },
  { key: 'settings', icon: Settings, label: 'Settings' },
]

const pages = {
  dashboard: <Dashboard />,
  products: <Products />,
  orders: <Orders />,
  customers: <Customers />,
  settings: <SettingsPage />
};

function AdminPanel() {
  const [activePage, setActivePage] = useState('dashboard')
  const [admin, setAdmin] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const pageTitleMap = {
      dashboard: 'Admin Dashboard',
      products: 'Manage Inventory',
      orders: 'Customer Orders',
      customers: 'Customers List',
      settings: 'Admin Settings'
    }
    const pageName = pageTitleMap[activePage] || 'Admin Panel'
    document.title = `RetailFlow | ${pageName}`
  }, [activePage])

  useEffect(() => {
    const fetchAdmin = async () => {
      const token = localStorage.getItem('adminToken')
      if (token) {
        try {
          const baseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:8001/api'
          const response = await axios.get(`${baseUrl}/auth/admin/currentuser`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          setAdmin(response.data)
        } catch (err) {
          console.error('Error fetching admin user:', err)
        }
      }
    }
    fetchAdmin()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen w-screen bg-[#f4f6fb] font-[system-ui] p-3 gap-3 overflow-hidden">
      <aside className="w-60 shrink-0 bg-white border border-gray-200 rounded-3xl shadow text-slate-300 flex flex-col py-6 px-4 h-full">
        <div className="flex items-center gap-2 px-2 mb-8">
          <img src={logo} alt="RetailFlow" />
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto">
          {navItems.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition cursor-pointer ${
                activePage === key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30 hover:bg-blue-600'
                  : 'text-black hover:text-black hover:bg-white hover:border hover:border-gray-300 hover:shadow-md'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {admin && (
          <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2.5 px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Seller Profile
            </div>
            
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 bg-slate-50 border border-slate-100">
              <User className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="font-semibold truncate text-slate-700">{admin.username || 'Seller'}</span>
            </div>
            
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-600 bg-slate-50/50 border border-transparent">
              <Mail className="w-4 h-4 text-slate-450 shrink-0" />
              <span className="truncate text-xs text-slate-500">{admin.email}</span>
            </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500 hover:text-white mt-4 transition-all duration-100 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8 border bg-white rounded-3xl border-gray-200 shadow h-full overflow-hidden flex flex-col">
        {pages[activePage]}
      </main>
    </div>
  )
}

export default AdminPanel