import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { PackageOpen, Search, Store } from 'lucide-react'
import { categoryOf, plural } from '../../lib/format'
import { Button, EmptyState, Notice } from '../../components/ui'
import hp from '../../assets/hp.png'
import { ProductGrid, ProductGridSkeleton } from './ProductCard'

export default function Home() {
  const { products, loading, error, reload, openProduct } = useOutletContext()
  const navigate = useNavigate()
  const [text, setText] = useState('')

  useEffect(() => {
    document.title = 'RetailFlow | Shop local sellers'
  }, [])

  const categories = useMemo(() => {
    const counts = new Map()
    products.forEach((p) => counts.set(categoryOf(p), (counts.get(categoryOf(p)) || 0) + 1))
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [products])

  const shelf = useMemo(() => [...products].sort((a, b) => (b.countInStock > 0) - (a.countInStock > 0)).slice(0, 8), [products])

  const search = (event) => {
    event.preventDefault()
    navigate(text.trim() ? `/shop?q=${encodeURIComponent(text.trim())}` : '/shop')
  }

  return (
    <>
      <section className="overflow-hidden rounded-3xl bg-linear-to-r from-blue-50 to-slate-100 px-6 py-10 shadow-sm sm:px-10 sm:py-14 lg:px-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Best products.
              <br />
              Best prices.
              <br />
              <span className="text-blue-600">Best experience.</span>
            </h1>
            <p className="mt-4 max-w-md text-slate-500">
              Discover quality essentials from local sellers and pay in cash when your order arrives.
            </p>

            <form onSubmit={search} className="mt-8 flex max-w-md gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              <label className="flex flex-1 items-center gap-2.5 pl-3">
                <Search className="h-5 w-5 text-blue-600" aria-hidden="true" />
                <span className="sr-only">Search products</span>
                <input
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="What are you looking for?"
                  className="h-11 w-full bg-transparent text-slate-800 outline-none placeholder:text-slate-400"
                />
              </label>
              <Button type="submit">Search</Button>
            </form>

            {categories.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {categories.slice(0, 5).map(([name]) => (
                  <li key={name}>
                    <Link
                      to={`/shop?category=${encodeURIComponent(name)}`}
                      className="inline-flex rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      {name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="hidden items-center justify-center lg:flex">
            <img className="h-96 object-contain" src={hp} alt="" />
          </div>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="shelf-heading">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="shelf-heading" className="text-2xl font-extrabold text-slate-800 sm:text-3xl">
              On the shelf today
            </h2>
            {!loading && products.length > 0 && (
              <p className="mt-1 text-slate-500">
                {plural(products.length, 'product')} across {plural(categories.length, 'category', 'categories')}
              </p>
            )}
          </div>
          {products.length > shelf.length && (
            <Link to="/shop" className="shrink-0 font-semibold text-blue-600 underline underline-offset-4">
              See all {products.length}
            </Link>
          )}
        </div>

        {loading && <ProductGridSkeleton />}
        {error && (
          <div className="space-y-3">
            <Notice>{error}</Notice>
            <Button variant="quiet" onClick={reload}>
              Try again
            </Button>
          </div>
        )}
        {!loading && !error && products.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <EmptyState
              icon={PackageOpen}
              title="No products listed yet"
              action={
                <Link to="/admin" className="font-semibold text-blue-600 underline underline-offset-4">
                  Open a store and list the first one
                </Link>
              }
            >
              Sellers have not added stock so far. Check back soon.
            </EmptyState>
          </div>
        )}
        {shelf.length > 0 && <ProductGrid products={shelf} onOpen={openProduct} />}
      </section>

      <section className="mt-16 flex flex-col items-start gap-5 rounded-3xl bg-linear-to-r from-blue-50 to-slate-100 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Run a shop? Put it on the shelf.</h2>
          <p className="mt-1.5 max-w-lg text-slate-600">List your stock, watch orders come in and mark them shipped from one seller counter.</p>
        </div>
        <Link to="/admin/signup" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700">
          <Store className="h-5 w-5" aria-hidden="true" />
          Open a store
        </Link>
      </section>
    </>
  )
}
