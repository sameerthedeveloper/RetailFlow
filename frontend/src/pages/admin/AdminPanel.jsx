import React, { useState } from 'react'
import {
  LayoutDashboard, ShoppingBag, Package, Users, TrendingUp,
  BarChart3, Megaphone, Percent, Settings, LogOut, ChevronDown,
  Bell, Headphones, Watch, Footprints, Backpack, Glasses
} from 'lucide-react'
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import logo from './assets/logo.png'
import Dashboard from './AdminSections/Dashboard';
import Products from './AdminSections/Products';
import Orders from './AdminSections/Orders';



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
  // customers: <Customers />,
  // settings: <Settings />
};


function AdminPanel() {
const [activePage, setActivePage] = useState('dashboard')

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

        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500 hover:text-white mt-4 transition-all duration-100 cursor-pointer">
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