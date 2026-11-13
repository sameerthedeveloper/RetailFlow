import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { categoryOf, matches, rupees } from '../../lib/format'
import { Modal, ProductImage } from '../../components/ui'

export default function SearchPalette({ open, onClose, products, onPick }) {
  const [text, setText] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setText('')
      // Wait for the dialog to mount before moving focus into it.
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const results = useMemo(() => (text.trim() ? products.filter((p) => matches(p, text)).slice(0, 6) : []), [products, text])

  const seeAll = (event) => {
    event.preventDefault()
    onClose()
    navigate(`/shop?q=${encodeURIComponent(text.trim())}`)
  }

  return (
    <Modal open={open} onClose={onClose} title="Search products">
      <form onSubmit={seeAll} className="p-4 sm:p-5">
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 focus-within:border-blue-500">
          <Search className="h-5 w-5 text-slate-500" aria-hidden="true" />
          <span className="sr-only">Search by name, brand or category</span>
          <input
            ref={inputRef}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Name, brand or category"
            className="h-12 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400"
          />
        </label>

        <div className="mt-3 min-h-40">
          {!text.trim() && <p className="px-1 py-6 text-center text-[0.95rem] text-slate-500">Start typing to find a product.</p>}
          {text.trim() && results.length === 0 && (
            <p className="px-1 py-6 text-center text-[0.95rem] text-slate-500">Nothing matches "{text.trim()}". Try a shorter word.</p>
          )}
          <ul>
            {results.map((product) => (
              <li key={product._id}>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onPick(product)
                  }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-blue-50"
                >
                  <ProductImage src={product.image} alt="" className="h-12 w-12 rounded-lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-800">{product.name}</span>
                    <span className="block truncate text-sm text-slate-500">{categoryOf(product)}</span>
                  </span>
                  <span className="nums font-bold text-slate-800">{rupees(product.price)}</span>
                </button>
              </li>
            ))}
          </ul>
          {results.length > 0 && (
            <button type="submit" className="mt-2 w-full rounded-xl py-2.5 text-[0.95rem] font-semibold text-blue-600 hover:bg-blue-50">
              See every result for "{text.trim()}"
            </button>
          )}
        </div>
      </form>
    </Modal>
  )
}
