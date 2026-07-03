import React from 'react'
import { Smartphone, ShoppingBag, Link, Footprints, Apple } from 'lucide-react'

const categories = [
  { label: 'Electronics', icon: Smartphone, bg: 'bg-amber-100' },
  { label: 'Fashion', icon: ShoppingBag, bg: 'bg-violet-100' },
  { label: 'Accessories', icon: Link, bg: 'bg-rose-100' },
  { label: 'Footwear', icon: Footprints, bg: 'bg-slate-100' },
  { label: 'Groceries', icon: Apple, bg: 'bg-blue-100' },
]

function HomeCategories() {
  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between px-2">
        <h2 className="text-lg font-semibold text-slate-900">Shop by Categories</h2>
        <a href="#" className="text-sm text-slate-400">View all</a>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((item) => (
          <button
            key={item.label}
            className="flex flex-col items-center justify-center rounded-2xl bg-white p-4 text-sm shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg}`}>
              <item.icon className="h-6 w-6 text-slate-700" />
            </div>
            <span className="font-medium text-slate-700">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default HomeCategories
