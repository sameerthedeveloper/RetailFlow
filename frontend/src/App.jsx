import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Login from './pages/Login'
import SignUp from './pages/Signup'
import Home from './pages/Home'
import AdminPanel from './pages/admin/AdminPanel'
import AdminLogin from './pages/admin/AdminLogin'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <PageTransition><Login /></PageTransition>
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <PageTransition><SignUp /></PageTransition>
            </PublicRoute>
          }
        />
        <Route
          path="/admin/login"
          element={
            <PublicRoute tokenKey="adminToken" redirectTo="/admin">
              <PageTransition><AdminLogin /></PageTransition>
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PageTransition><Home /></PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute tokenKey="adminToken" redirectTo="/admin/login">
              <PageTransition><AdminPanel /></PageTransition>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App
