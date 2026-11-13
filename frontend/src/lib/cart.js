// Cart lives in localStorage so it survives refreshes and sign-in.
import { useSyncExternalStore } from 'react'

const KEY = 'cart'
export const MAX_PER_ITEM = 6

const listeners = new Set()
let items = read()

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(next) {
  items = next
  localStorage.setItem(KEY, JSON.stringify(next))
  listeners.forEach((notify) => notify())
}

window.addEventListener('storage', (event) => {
  if (event.key === KEY) {
    items = read()
    listeners.forEach((notify) => notify())
  }
})

export const limitFor = (product) => Math.max(0, Math.min(product.countInStock ?? MAX_PER_ITEM, MAX_PER_ITEM))

export const cart = {
  // Set an absolute quantity; 0 removes the line.
  setQuantity(product, quantity) {
    const next = Math.min(quantity, limitFor(product))
    const rest = items.filter((item) => item._id !== product._id)
    if (next <= 0) return write(rest)
    const existing = items.find((item) => item._id === product._id)
    if (existing) return write(items.map((item) => (item._id === product._id ? { ...item, quantity: next } : item)))
    const { _id, name, price, image, brand, category, countInStock } = product
    write([...rest, { _id, name, price, image, brand, category, countInStock, quantity: next }])
  },
  remove: (productId) => write(items.filter((item) => item._id !== productId)),
  clear: () => write([]),
}

const subscribe = (notify) => {
  listeners.add(notify)
  return () => listeners.delete(notify)
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, () => items)
  return {
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    total: lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    quantityOf: (productId) => lines.find((line) => line._id === productId)?.quantity || 0,
  }
}
