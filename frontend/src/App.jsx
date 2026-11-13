import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SessionProvider, useSession } from './lib/session'
import { PageLoader, ToastProvider } from './components/ui'
import AuthPage from './views/AuthPage'
import StoreLayout from './views/store/StoreLayout'
import Home from './views/store/Home'
import Shop from './views/store/Shop'
import MyOrders from './views/store/MyOrders'
const AdminLayout = lazy(() => import('./views/admin/AdminLayout'))
const Dashboard = lazy(() => import('./views/admin/Dashboard'))
const Inventory = lazy(() => import('./views/admin/Inventory'))
const Orders = lazy(() => import('./views/admin/Orders'))
const Customers = lazy(() => import('./views/admin/Customers'))
const Settings = lazy(() => import('./views/admin/Settings'))

// Signed-out visitors go to the right sign-in page and come back afterwards.
function RequireUser({ role, children }) {
  const { user, loading } = useSession(role)
  const location = useLocation()
  if (loading) return <PageLoader label="Checking your session" />
  if (!user) return <Navigate to={role === 'admin' ? '/admin/login' : '/login'} replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <ToastProvider>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="orders" element={<RequireUser role="customer"><MyOrders /></RequireUser>} />
            </Route>

            <Route path="login" element={<AuthPage key="customer-login" role="customer" mode="login" />} />
            <Route path="signup" element={<AuthPage key="customer-signup" role="customer" mode="signup" />} />
            <Route path="admin/login" element={<AuthPage key="admin-login" role="admin" mode="login" />} />
            <Route path="admin/signup" element={<AuthPage key="admin-signup" role="admin" mode="signup" />} />

            <Route path="admin" element={<RequireUser role="admin"><Suspense fallback={<PageLoader label="Opening your counter" />}><AdminLayout /></Suspense></RequireUser>}>
              <Route index element={<Dashboard />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </SessionProvider>
    </BrowserRouter>
  )
}
