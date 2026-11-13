import { useEffect, useMemo } from 'react'
import { useOutletContext, useSearchParams } from 'react-router-dom'
import { SearchX, X } from 'lucide-react'
import { categoryOf, matches, plural, rupees } from '../../lib/format'
import { Button, EmptyState, Notice } from '../../components/ui'
import { ProductGrid, ProductGridSkeleton } from './ProductCard'

const SORTS = {
  newest: { label: 'Newest first', sort: null },
  'price-asc': { label: 'Price, low to high', sort: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price, high to low', sort: (a, b) => b.price - a.price },
  name: { label: 'Name, A to Z', sort: (a, b) => a.name.localeCompare(b.name) },
}

export default function Shop() {
  const { products, loading, error, reload, openProduct } = useOutletContext()
  // Filters live in the URL so a filtered shelf can be shared or bookmarked.
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const sort = SORTS[params.get('sort')] ? params.get('sort') : 'newest'
  const inStock = params.get('stock') === '1'
  const ceiling = useMemo(() => Math.max(0, ...products.map((p) => p.price || 0)), [products])
  const maxPrice = Math.min(Number(params.get('max')) || ceiling, ceiling)

  useEffect(() => {
    document.title = 'RetailFlow | Shop'
  }, [])

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const categories = useMemo(() => {
    const counts = new Map()
    products.forEach((p) => counts.set(categoryOf(p), (counts.get(categoryOf(p)) || 0) + 1))
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [products])

  const visible = useMemo(() => {
    const list = products.filter(
      (p) =>
        matches(p, q) &&
        (!category || categoryOf(p).toLowerCase() === category.toLowerCase()) &&
        (p.price || 0) <= maxPrice &&
        (!inStock || p.countInStock > 0),
    )
    return SORTS[sort].sort ? [...list].sort(SORTS[sort].sort) : list
  }, [products, q, category, maxPrice, inStock, sort])

  const filtered = Boolean(q || category || inStock || maxPrice < ceiling)
  const row = (active) =>
    `flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[0.95rem] ${active ? 'bg-blue-600 font-semibold text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`

  const filters = (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-slate-800">Category</legend>
        <ul className="space-y-0.5">
          <li>
            <button type="button" aria-pressed={!category} onClick={() => update('category', '')} className={row(!category)}>
              Everything <span className="nums text-sm opacity-70">{products.length}</span>
            </button>
          </li>
          {categories.map(([name, count]) => {
            const active = category.toLowerCase() === name.toLowerCase()
            return (
              <li key={name}>
                <button type="button" aria-pressed={active} onClick={() => update('category', active ? '' : name)} className={row(active)}>
                  {name} <span className="nums text-sm opacity-70">{count}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </fieldset>

      <div>
        <label htmlFor="max-price" className="mb-2 flex items-baseline justify-between text-sm font-bold text-slate-800">
          Price up to <span className="nums text-base">{rupees(maxPrice)}</span>
        </label>
        <input
          id="max-price"
          type="range"
          min={0}
          max={ceiling || 1}
          step={Math.max(1, Math.round(ceiling / 50))}
          value={maxPrice}
          onChange={(event) => update('max', Number(event.target.value) >= ceiling ? '' : event.target.value)}
          className="w-full accent-blue-600"
        />
      </div>

      <label className="flex items-center gap-2.5 text-[0.95rem] font-medium text-slate-800">
        <input type="checkbox" checked={inStock} onChange={(event) => update('stock', event.target.checked ? '1' : '')} className="h-4.5 w-4.5 accent-blue-600" />
        Hide sold-out items
      </label>
    </div>
  )

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white shadow-sm p-4">{filters}</div>
      </aside>

      <div>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 sm:text-4xl">{q ? `Results for "${q}"` : category || 'Shop everything'}</h1>
            {!loading && <p className="mt-1 text-slate-500">{plural(visible.length, 'product')}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            Sort
            <select
              value={sort}
              onChange={(event) => update('sort', event.target.value === 'newest' ? '' : event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-[0.95rem] font-medium text-slate-800"
            >
              {Object.entries(SORTS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <details className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden">
          <summary className="px-4 py-3 font-semibold text-slate-800">Filters{filtered ? ' (on)' : ''}</summary>
          <div className="border-t border-slate-200 p-4">{filters}</div>
        </details>

        {filtered && (
          <button type="button" onClick={() => setParams({}, { replace: true })} className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-200">
            <X className="h-4 w-4" aria-hidden="true" />
            Clear filters
          </button>
        )}

        {loading && <ProductGridSkeleton />}
        {error && (
          <div className="space-y-3">
            <Notice>{error}</Notice>
            <Button variant="quiet" onClick={reload}>
              Try again
            </Button>
          </div>
        )}
        {!loading && !error && visible.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <EmptyState
              icon={SearchX}
              title={filtered ? 'Nothing matches these filters' : 'No products listed yet'}
              action={filtered && <Button onClick={() => setParams({}, { replace: true })}>Clear filters</Button>}
            >
              {filtered ? 'Widen the price range or pick another category.' : 'Sellers have not added stock so far. Check back soon.'}
            </EmptyState>
          </div>
        )}
        {visible.length > 0 && <ProductGrid products={visible} onOpen={openProduct} />}
      </div>
    </div>
  )
}
