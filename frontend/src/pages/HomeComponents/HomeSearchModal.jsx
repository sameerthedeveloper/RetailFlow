import React from 'react'
import { Search, ChevronRight } from 'lucide-react'

function HomeSearchModal({ isOpen, searchQuery, setSearchQuery, items, onClose }) {
  if (!isOpen) return null

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <div className="fixed inset-0 z-60 bg-white/35 backdrop-blur-3xl backdrop-saturate-150" onClick={onClose} />

      <div className="fixed inset-x-0 top-0 z-70 px-2 py-4 sm:px-4 sm:py-8">
        <div className="mx-auto mt-4 w-full max-w-[calc(100vw-1rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-300/50 ring-1 ring-white/80 backdrop-blur-xl sm:mt-8 sm:max-w-3xl sm:rounded-4xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50/90 px-5 py-4 sm:px-6">
            <Search className="h-5 w-5 text-blue-600" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products, pages, categories"
              className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
            />
            <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500">esc</span>
          </div>

          <div className="min-h-72 px-2 py-6 sm:px-4 sm:py-10">
            {searchQuery ? (
              <div className="space-y-1">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={onClose}
                      className="flex w-full flex-col items-start justify-between gap-3 rounded-2xl px-4 py-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 ring-2 ring-white shadow-sm overflow-hidden shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            <item.icon className="h-6 w-6" />
                          )}
                        </div>

                        <div className="min-w-0 text-left">
                          <p className="truncate text-base font-semibold text-slate-900">{item.title}</p>
                          <p className="truncate text-sm text-slate-500">{item.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-between gap-4 text-left sm:w-auto sm:justify-end sm:text-right">
                        <div className="min-w-0">
                          <p className="text-base text-slate-800">{item.category}</p>
                          <div className="mt-1 flex items-center justify-end gap-2 text-sm text-slate-500">
                            <span>{item.status}</span>
                          </div>
                        </div>

                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-400">No results found.</p>
                )}
              </div>
            ) : (
              <div className="flex min-h-64 items-center justify-center">
                <p className="text-lg text-slate-400">No recent searches</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end border-t border-slate-200 px-5 py-4 text-sm text-slate-400 sm:px-6">
            <span>Search by</span>
            <span className="ml-2 font-semibold text-blue-600">RetailFlow</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default HomeSearchModal
