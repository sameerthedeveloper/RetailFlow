// Firebase Auth + Firestore backend, used for the hosted demo.
// Mirrors the REST API's shapes so the UI cannot tell the difference.
//
// Customers and sellers sign in on two separate Firebase app instances, so one
// browser can hold a shopper session and a seller session at the same time
// (the same way the REST backend keeps `token` and `adminToken` apart).
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  runTransaction,
} from 'firebase/firestore'

const env = import.meta.env
const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
}

const sessions = {}
const session = (role) => {
  if (!sessions[role]) {
    const app = role === 'admin' ? initializeApp(config, 'seller') : initializeApp(config)
    sessions[role] = { auth: getAuth(app), db: getFirestore(app) }
  }
  return sessions[role]
}

const profileCollection = (role) => (role === 'admin' ? 'admins' : 'users')
const withId = (snap) => ({ _id: snap.id, ...snap.data() })
const newestFirst = (a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')

const AUTH_MESSAGES = {
  'auth/invalid-credential': 'That email and password do not match.',
  'auth/wrong-password': 'That email and password do not match.',
  'auth/user-not-found': 'No account found for that email.',
  'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
  'auth/weak-password': 'Use a password with at least 6 characters.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Wait a minute and try again.',
  'auth/network-request-failed': 'No connection. Check your internet and try again.',
  'permission-denied': 'You do not have permission to do that.',
}
const friendly = (err) => new Error(AUTH_MESSAGES[err.code] || err.message || 'Something went wrong.')
const guard = (fn) => async (...args) => {
  try {
    return await fn(...args)
  } catch (err) {
    throw err.code ? friendly(err) : err
  }
}

const signedIn = async (role) => {
  const { auth, db } = session(role)
  await auth.authStateReady()
  if (!auth.currentUser) {
    throw new Error(role === 'admin' ? 'Sign in to your seller account first.' : 'Sign in to continue.')
  }
  return { uid: auth.currentUser.uid, auth, db }
}

const currentUser = async (role) => {
  const { auth, db } = session(role)
  await auth.authStateReady()
  if (!auth.currentUser) return null
  const snap = await getDoc(doc(db, profileCollection(role), auth.currentUser.uid))
  if (!snap.exists()) return null
  const { name, email, createdAt } = snap.data()
  return { _id: snap.id, username: name, email, createdAt }
}

const signup = async (role, { name, email, password }) => {
  const { auth, db } = session(role)
  let credential
  try {
    credential = await createUserWithEmailAndPassword(auth, email, password)
  } catch (err) {
    // One email may hold both a shopper and a seller profile.
    if (err.code !== 'auth/email-already-in-use') throw err
    credential = await signInWithEmailAndPassword(auth, email, password).catch(() => {
      throw err
    })
    const existing = await getDoc(doc(db, profileCollection(role), credential.user.uid))
    if (existing.exists()) throw err
  }
  await setDoc(doc(db, profileCollection(role), credential.user.uid), {
    name,
    email,
    createdAt: new Date().toISOString(),
  })
  return currentUser(role)
}

const login = async (role, { email, password }) => {
  const { auth } = session(role)
  await signInWithEmailAndPassword(auth, email, password)
  const profile = await currentUser(role)
  if (!profile) {
    await signOut(auth)
    throw new Error(
      role === 'admin'
        ? 'This email has no seller account yet. Create one first.'
        : 'This email has no shopper account yet. Create one first.',
    )
  }
  return profile
}

const changePassword = async (role, current, next) => {
  const { auth } = await signedIn(role)
  const credential = EmailAuthProvider.credential(auth.currentUser.email, current)
  await reauthenticateWithCredential(auth.currentUser, credential)
  await updatePassword(auth.currentUser, next)
}

const listProducts = async ({ sellerOnly = false } = {}) => {
  if (sellerOnly) {
    const { uid, db } = await signedIn('admin')
    const snap = await getDocs(query(collection(db, 'products'), where('sellerId', '==', uid)))
    return snap.docs.map(withId).sort(newestFirst)
  }
  const snap = await getDocs(collection(session('customer').db, 'products'))
  return snap.docs.map(withId).sort(newestFirst)
}

const EDITABLE = ['name', 'brand', 'category', 'price', 'countInStock', 'image', 'description']

const saveProduct = async ({ _id, ...input }) => {
  const fields = Object.fromEntries(EDITABLE.map((key) => [key, input[key]]))
  const { uid, db } = await signedIn('admin')
  const now = new Date().toISOString()
  if (_id) {
    await updateDoc(doc(db, 'products', _id), { ...fields, updatedAt: now })
    return withId(await getDoc(doc(db, 'products', _id)))
  }
  const seller = await currentUser('admin')
  const ref = doc(collection(db, 'products'))
  const product = {
    ...fields,
    sellerId: uid,
    user: { _id: uid, name: seller.username },
    createdAt: now,
    updatedAt: now,
  }
  await setDoc(ref, product)
  return { _id: ref.id, ...product }
}

const deleteProduct = async (id) => {
  const { db } = await signedIn('admin')
  await deleteDoc(doc(db, 'products', id))
}

// Stock check, stock decrement and order write happen in one transaction,
// so two shoppers cannot buy the same last unit.
const createOrder = async ({ orderItems, shippingAddress, paymentMethod, totalPrice }) => {
  const { uid, db } = await signedIn('customer')
  const buyer = await currentUser('customer')
  const orderRef = doc(collection(db, 'orders'))

  return runTransaction(db, async (tx) => {
    const sellerIds = new Set()
    const stock = []
    for (const item of orderItems) {
      const ref = doc(db, 'products', item.product)
      const snap = await tx.get(ref)
      if (!snap.exists()) throw new Error(`"${item.name}" is no longer for sale. Remove it to continue.`)
      const product = snap.data()
      if (product.countInStock < item.quantity) {
        throw new Error(`Only ${product.countInStock} of "${product.name}" left. Lower the quantity to continue.`)
      }
      sellerIds.add(product.sellerId)
      stock.push({ ref, countInStock: product.countInStock - item.quantity })
    }
    stock.forEach(({ ref, countInStock }) => tx.update(ref, { countInStock }))

    const order = {
      user: { _id: uid, name: buyer.username, email: buyer.email, createdAt: buyer.createdAt || null },
      sellerIds: [...sellerIds],
      orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }
    tx.set(orderRef, order)
    return { _id: orderRef.id, ...order }
  })
}

const myOrders = async () => {
  const { uid, db } = await signedIn('customer')
  const snap = await getDocs(query(collection(db, 'orders'), where('user._id', '==', uid)))
  return snap.docs.map(withId).sort(newestFirst)
}

const sellerOrders = async () => {
  const { uid, db } = await signedIn('admin')
  const snap = await getDocs(query(collection(db, 'orders'), where('sellerIds', 'array-contains', uid)))
  return snap.docs.map(withId).sort(newestFirst)
}

const updateOrderStatus = async (orderId, status) => {
  const { db } = await signedIn('admin')
  await updateDoc(doc(db, 'orders', orderId), { status })
}

const listCustomers = async () => {
  const seen = new Map()
  for (const order of await sellerOrders()) {
    if (order.user && !seen.has(order.user._id)) seen.set(order.user._id, order.user)
  }
  return [...seen.values()]
}

const backendApi = {
  signup,
  login,
  logout: (role) => signOut(session(role).auth),
  currentUser,
  changePassword,
  listProducts,
  saveProduct,
  deleteProduct,
  createOrder,
  myOrders,
  sellerOrders,
  updateOrderStatus,
  listCustomers,
}

export default Object.fromEntries(Object.entries(backendApi).map(([name, fn]) => [name, guard(fn)]))
