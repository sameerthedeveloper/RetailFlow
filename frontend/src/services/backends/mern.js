// REST client for the Express + MongoDB backend (see /backend).
import axios from 'axios'

const http = axios.create({
  // Production is served from the same domain as the API (see vercel.json),
  // so requests need no CORS preflight.
  baseURL: import.meta.env.VITE_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8001/api'),
})

const tokenKey = (role) => (role === 'admin' ? 'adminToken' : 'token')
const authPath = (role) => (role === 'admin' ? '/auth/admin' : '/auth')
const bearer = (role) => {
  const token = localStorage.getItem(tokenKey(role))
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Every failure surfaces as a plain Error carrying the server's message.
const run = async (request) => {
  try {
    return (await request).data
  } catch (err) {
    const message = err.response?.data?.message
    throw new Error(message || 'Could not reach the server. Check your connection and try again.', { cause: err })
  }
}

const currentUser = async (role) => {
  if (!localStorage.getItem(tokenKey(role))) return null
  try {
    const { data } = await http.get(`${authPath(role)}/currentuser`, { headers: bearer(role) })
    return data
  } catch {
    localStorage.removeItem(tokenKey(role))
    return null
  }
}

const enter = (path) => async (role, form) => {
  const { token } = await run(http.post(`${authPath(role)}/${path}`, form))
  localStorage.setItem(tokenKey(role), token)
  return currentUser(role)
}

export default {
  signup: enter('signup'),
  login: enter('login'),
  logout: async (role) => localStorage.removeItem(tokenKey(role)),
  currentUser,
  changePassword: async () => {
    throw new Error('Changing the password is not available on this server yet.')
  },

  listProducts: ({ sellerOnly = false } = {}) =>
    run(
      http.get('/product/all', {
        params: sellerOnly ? { sellerOnly: true } : {},
        headers: sellerOnly ? bearer('admin') : {},
      }),
    ),
  saveProduct: ({ _id, ...fields }) =>
    run(
      _id
        ? http.put('/product/edit', { ...fields, id: _id }, { headers: bearer('admin') })
        : http.post('/product/add', fields, { headers: bearer('admin') }),
    ),
  deleteProduct: (id) => run(http.delete('/product/delete', { params: { id }, headers: bearer('admin') })),

  createOrder: async (payload) =>
    (await run(http.post('/order/new', payload, { headers: bearer('customer') }))).order,
  myOrders: () => run(http.get('/order/myorders', { headers: bearer('customer') })),
  sellerOrders: () => run(http.get('/order/all', { headers: bearer('admin') })),
  updateOrderStatus: (orderId, status) =>
    run(http.put('/order/status', { orderId, status }, { headers: bearer('admin') })),
  listCustomers: () => run(http.get('/auth/users', { headers: bearer('admin') })),
}
