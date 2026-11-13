export const rupees = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

export const shortDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

export const orderNumber = (order) => `#${String(order._id).slice(-6).toUpperCase()}`

export const plural = (count, word, many = `${word}s`) => `${count} ${count === 1 ? word : many}`

export const categoryOf = (product) => (product.category || 'General').trim()

// Free-text product search used by the shop filters and the search dialog.
export const matches = (product, text) => {
  const needle = text.trim().toLowerCase()
  if (!needle) return true
  return [product.name, product.brand, product.category, product.description].some((field) => field?.toLowerCase().includes(needle))
}
