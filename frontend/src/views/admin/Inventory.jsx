import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Boxes, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { api } from '../../services/api'
import { sampleCatalog } from '../../services/sampleCatalog'
import { categoryOf, plural, rupees } from '../../lib/format'
import { Button, EmptyState, Field, IconButton, Modal, Notice, PageLoader, ProductImage, StockNote, useToast } from '../../components/ui'
import { PageHeader } from './AdminLayout'

const BLANK = { name: '', brand: '', category: '', price: '', countInStock: '', image: '', description: '' }

function ProductForm({ product, categories, onClose, onSaved }) {
  const editing = Boolean(product?._id)
  const [form, setForm] = useState(() => ({ ...BLANK, ...product }))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      const saved = await api.saveProduct({ ...form, price: Number(form.price), countInStock: Number(form.countInStock) })
      onSaved(saved, editing)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5 p-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:p-6">
      <div>
        <ProductImage src={form.image} alt="Product photo preview" className="aspect-square w-full rounded-2xl" />
        <p className="mt-2 text-sm text-slate-500">Shoppers see this photo first.</p>
      </div>

      <div className="space-y-4">
        <Field label="Product name" value={form.name} onChange={set('name')} required />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Brand" value={form.brand} onChange={set('brand')} required />
          <Field label="Category" value={form.category} onChange={set('category')} list="category-options" placeholder="Electronics" required />
          <datalist id="category-options">
            {categories.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price in ₹" type="number" min="1" step="1" inputMode="numeric" value={form.price} onChange={set('price')} required />
          <Field label="Units in stock" type="number" min={editing ? 0 : 1} step="1" inputMode="numeric" value={form.countInStock} onChange={set('countInStock')} required />
        </div>
        <Field label="Photo link" type="url" value={form.image} onChange={set('image')} placeholder="https://" hint="Paste the web address of a product photo." required />
        <Field label="Description" as="textarea" rows={3} value={form.description} onChange={set('description')} hint="Size, material, what is in the box." required />

        {error && <Notice>{error}</Notice>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" busy={busy}>
            {editing ? 'Save changes' : 'Add product'}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default function Inventory() {
  const { products, loading, error, reload } = useOutletContext()
  const toast = useToast()
  const [text, setText] = useState('')
  const [editing, setEditing] = useState(null) // null | {} (new) | product
  const [removing, setRemoving] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    document.title = 'Inventory | RetailFlow seller'
  }, [])

  const categories = useMemo(() => [...new Set(products.map(categoryOf))].sort(), [products])
  const visible = useMemo(() => {
    const needle = text.trim().toLowerCase()
    return needle ? products.filter((p) => [p.name, p.brand, p.category].some((f) => f?.toLowerCase().includes(needle))) : products
  }, [products, text])

  const loadSamples = async () => {
    setBusy(true)
    try {
      for (const product of sampleCatalog.filter((p) => p.countInStock > 0)) await api.saveProduct(product)
      await reload()
      toast('Sample products added')
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    setBusy(true)
    try {
      await api.deleteProduct(removing._id)
      await reload()
      toast('Product deleted')
      setRemoving(null)
    } catch (err) {
      toast(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <PageLoader label="Loading inventory" />

  return (
    <>
      <PageHeader title="Inventory" lead={products.length ? `${plural(products.length, 'product')} on your shelf` : undefined}>
        <Button onClick={() => setEditing({})}>
          <Plus className="h-5 w-5" aria-hidden="true" />
          Add product
        </Button>
      </PageHeader>
      {error && <div className="mb-5"><Notice>{error}</Notice></div>}

      {products.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <EmptyState
            icon={Boxes}
            title="Nothing on your shelf yet"
            action={
              <div className="flex flex-col gap-2">
                <Button onClick={() => setEditing({})}>Add product</Button>
                <Button variant="ghost" busy={busy} onClick={loadSamples}>
                  Add sample products instead
                </Button>
              </div>
            }
          >
            Add a product yourself, or load a sample catalogue to see how the store works.
          </EmptyState>
        </div>
      ) : (
        <>
          <label className="mb-4 flex h-11 max-w-sm items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 focus-within:border-blue-500">
            <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span className="sr-only">Filter products</span>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Filter by name, brand or category" className="w-full bg-transparent text-[0.95rem] outline-none placeholder:text-slate-400" />
          </label>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-[0.95rem]">
              <thead className="border-b border-slate-200 text-sm text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Product</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold md:table-cell">Category</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Price</th>
                  <th scope="col" className="hidden px-4 py-3 font-semibold sm:table-cell">Stock</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={product.image} alt="" className="h-11 w-11 shrink-0 rounded-lg" />
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">{product.name}</p>
                          <p className="truncate text-sm text-slate-500">
                            {product.brand}
                            <span className="sm:hidden">, {product.countInStock} in stock</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 md:table-cell">{categoryOf(product)}</td>
                    <td className="nums px-4 py-3 text-right font-semibold text-slate-800">{rupees(product.price)}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="nums mr-2 font-semibold text-slate-800">{product.countInStock}</span>
                      {product.countInStock <= 5 && <StockNote count={product.countInStock} />}
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex justify-end">
                        <IconButton label={`Edit ${product.name}`} onClick={() => setEditing(product)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                        <IconButton label={`Delete ${product.name}`} onClick={() => setRemoving(product)} className="hover:text-red-600">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length === 0 && <p className="px-4 py-10 text-center text-slate-500">No product matches "{text.trim()}".</p>}
          </div>
        </>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?._id ? 'Edit product' : 'Add product'} wide>
        {editing !== null && (
          <ProductForm
            key={editing._id || 'new'}
            product={editing}
            categories={categories}
            onClose={() => setEditing(null)}
            onSaved={async (_saved, wasEdit) => {
              setEditing(null)
              await reload()
              toast(wasEdit ? 'Changes saved' : 'Product added')
            }}
          />
        )}
      </Modal>

      <Modal open={Boolean(removing)} onClose={() => setRemoving(null)} title="Delete product">
        {removing && (
          <div className="p-5 sm:p-6">
            <p className="text-slate-800">
              Delete <strong>{removing.name}</strong>? Shoppers will no longer see it. Past orders keep their record.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRemoving(null)}>
                Keep product
              </Button>
              <Button variant="danger" busy={busy} onClick={remove}>
                Delete product
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
