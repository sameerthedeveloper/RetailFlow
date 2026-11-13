// One data API for the whole app, three interchangeable backends:
//   mern     -> Express + MongoDB REST API (the project's own backend)
//   firebase -> Firebase Auth + Firestore (hosted demo, no server to run)
//   local    -> this browser's localStorage (zero-config preview)
//
// Pick with VITE_BACKEND, or leave it unset to auto-detect from the env.

const env = import.meta.env

export const backend =
  env.VITE_BACKEND ||
  (env.VITE_FIREBASE_API_KEY ? 'firebase' : env.VITE_BASE_URL || env.PROD ? 'mern' : 'local')

const loaders = {
  mern: () => import('./backends/mern.js'),
  firebase: () => import('./backends/firebase.js'),
  local: () => import('./backends/local.js'),
}

const impl = (loaders[backend] || loaders.local)().then((m) => m.default)

const call = (name) => async (...args) => (await impl)[name](...args)

// role is 'customer' or 'admin' wherever it appears.
export const api = {
  signup: call('signup'), // (role, { name, email, password }) -> profile
  login: call('login'), // (role, { email, password }) -> profile
  logout: call('logout'), // (role)
  currentUser: call('currentUser'), // (role) -> { _id, username, email } | null
  changePassword: call('changePassword'), // (role, current, next)

  listProducts: call('listProducts'), // ({ sellerOnly }) -> product[]
  saveProduct: call('saveProduct'), // (product) -> product   (has _id => edit)
  deleteProduct: call('deleteProduct'), // (id)

  createOrder: call('createOrder'), // ({ orderItems, shippingAddress, paymentMethod, totalPrice }) -> order
  myOrders: call('myOrders'), // () -> order[]
  sellerOrders: call('sellerOrders'), // () -> order[]
  updateOrderStatus: call('updateOrderStatus'), // (orderId, status)
  listCustomers: call('listCustomers'), // () -> { _id, name, email, createdAt }[]
}

export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
