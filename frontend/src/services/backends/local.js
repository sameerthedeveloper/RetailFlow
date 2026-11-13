// Zero-config preview backend: everything lives in this browser's localStorage.
// Same shapes and rules as the real backends, so the UI runs unchanged.
import { sampleCatalog } from '../sampleCatalog.js'

const DB_KEY = 'retailflow-demo-db'
const sessionKey = (role) => (role === 'admin' ? 'adminToken' : 'token')
const table = (role) => (role === 'admin' ? 'admins' : 'users')

export const DEMO_SELLER = { name: 'Corner Store', email: 'seller@retailflow.demo', password: 'demo1234' }

const id = () => Math.random().toString(16).slice(2, 10) + Date.now().toString(16)
const now = () => new Date().toISOString()

const digest = async (text) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

const save = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db))

// Several screens ask for data at once on first visit; seed only once.
let seeding = null

const load = async () => {
  const stored = localStorage.getItem(DB_KEY)
  if (stored) return JSON.parse(stored)
  seeding ||= seed()
  return seeding
}

const seed = async () => {
  const seller = {
    _id: id(),
    name: DEMO_SELLER.name,
    email: DEMO_SELLER.email,
    password: await digest(DEMO_SELLER.password),
    createdAt: now(),
  }
  const db = {
    users: [],
    admins: [seller],
    orders: [],
    products: sampleCatalog.map((p) => ({
      ...p,
      _id: id(),
      user: { _id: seller._id, name: seller.name },
      createdAt: now(),
    })),
  }
  save(db)
  return db
}

const profile = (row) => row && { _id: row._id, username: row.name, email: row.email, createdAt: row.createdAt }

const currentUser = async (role) => {
  const db = await load()
  return profile(db[table(role)].find((u) => u._id === localStorage.getItem(sessionKey(role)))) || null
}

const mustBe = async (role) => {
  const user = await currentUser(role)
  if (!user) throw new Error(role === 'admin' ? 'Sign in to your seller account first.' : 'Sign in to continue.')
  return user
}

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt)
const sellsIn = (order, products) => order.orderItems.some((item) => products.has(item.product))

const sellerOrders = async () => {
  const seller = await mustBe('admin')
  const db = await load()
  const mine = new Set(db.products.filter((p) => p.user._id === seller._id).map((p) => p._id))
  // Keep orders whose products were since deleted visible to the seller who sold them.
  return db.orders
    .filter((o) => sellsIn(o, mine) || o.sellerIds?.includes(seller._id))
    .sort(newestFirst)
}

export default {
  async signup(role, { name, email, password }) {
    const db = await load()
    if (db[table(role)].some((u) => u.email === email)) {
      throw new Error('An account with this email already exists. Sign in instead.')
    }
    const row = { _id: id(), name, email, password: await digest(password), createdAt: now() }
    db[table(role)].push(row)
    save(db)
    localStorage.setItem(sessionKey(role), row._id)
    return profile(row)
  },

  async login(role, { email, password }) {
    const db = await load()
    const row = db[table(role)].find((u) => u.email === email)
    if (!row) throw new Error('No account found for that email.')
    if (row.password !== (await digest(password))) throw new Error('That email and password do not match.')
    localStorage.setItem(sessionKey(role), row._id)
    return profile(row)
  },

  async logout(role) {
    localStorage.removeItem(sessionKey(role))
  },

  currentUser,

  async changePassword(role, current, next) {
    const user = await mustBe(role)
    const db = await load()
    const row = db[table(role)].find((u) => u._id === user._id)
    if (row.password !== (await digest(current))) throw new Error('Your current password is not right.')
    row.password = await digest(next)
    save(db)
  },

  async listProducts({ sellerOnly = false } = {}) {
    const db = await load()
    if (!sellerOnly) return db.products
    const seller = await mustBe('admin')
    return db.products.filter((p) => p.user._id === seller._id)
  },

  async saveProduct({ _id, ...fields }) {
    const seller = await mustBe('admin')
    const db = await load()
    if (_id) {
      const product = db.products.find((p) => p._id === _id)
      if (!product) throw new Error('This product no longer exists.')
      if (product.user._id !== seller._id) throw new Error('You can only edit your own products.')
      Object.assign(product, fields, { user: product.user, updatedAt: now() })
      save(db)
      return product
    }
    const product = { ...fields, _id: id(), user: { _id: seller._id, name: seller.username }, createdAt: now() }
    db.products.unshift(product)
    save(db)
    return product
  },

  async deleteProduct(productId) {
    const seller = await mustBe('admin')
    const db = await load()
    const product = db.products.find((p) => p._id === productId)
    if (product && product.user._id !== seller._id) throw new Error('You can only delete your own products.')
    db.products = db.products.filter((p) => p._id !== productId)
    save(db)
  },

  async createOrder({ orderItems, shippingAddress, paymentMethod, totalPrice }) {
    const buyer = await mustBe('customer')
    const db = await load()
    const sellerIds = new Set()
    for (const item of orderItems) {
      const product = db.products.find((p) => p._id === item.product)
      if (!product) throw new Error(`"${item.name}" is no longer for sale. Remove it to continue.`)
      if (product.countInStock < item.quantity) {
        throw new Error(`Only ${product.countInStock} of "${product.name}" left. Lower the quantity to continue.`)
      }
      sellerIds.add(product.user._id)
    }
    for (const item of orderItems) {
      db.products.find((p) => p._id === item.product).countInStock -= item.quantity
    }
    const order = {
      _id: id(),
      user: { _id: buyer._id, name: buyer.username, email: buyer.email, createdAt: buyer.createdAt },
      sellerIds: [...sellerIds],
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'Pending',
      createdAt: now(),
    }
    db.orders.push(order)
    save(db)
    return order
  },

  async myOrders() {
    const buyer = await mustBe('customer')
    const db = await load()
    return db.orders.filter((o) => o.user._id === buyer._id).sort(newestFirst)
  },

  sellerOrders,

  async updateOrderStatus(orderId, status) {
    const visible = await sellerOrders()
    if (!visible.some((o) => o._id === orderId)) throw new Error('You can only update orders for your own products.')
    const db = await load()
    db.orders.find((o) => o._id === orderId).status = status
    save(db)
  },

  async listCustomers() {
    const seen = new Map()
    for (const order of await sellerOrders()) {
      if (!seen.has(order.user._id)) seen.set(order.user._id, order.user)
    }
    return [...seen.values()]
  },
}
