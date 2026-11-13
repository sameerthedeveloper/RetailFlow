import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api, backend } from '../services/api'
import { useSession } from '../lib/session'
import { Button, Field, Notice, PageLoader, Wordmark } from '../components/ui'
import loginBg from '../assets/login.png'
import signupBg from '../assets/signup.png'

const COPY = {
  customer: {
    login: { title: 'Welcome back', lead: 'Sign in to pick up your cart where you left it.', submit: 'Login' },
    signup: { title: 'Create your account', lead: 'Order from every seller with one account.', submit: 'Sign up' },
    home: '/',
    paths: { login: '/login', signup: '/signup' },
    switchRole: { to: '/admin/login', label: 'Selling on RetailFlow? Go to the seller counter' },
  },
  admin: {
    login: { title: 'Sign in to your counter', lead: 'Stock, orders and customers in one place.', submit: 'Sign in' },
    signup: { title: 'Open your store', lead: 'List products today. Orders arrive as cash on delivery.', submit: 'Open store' },
    home: '/admin',
    paths: { login: '/admin/login', signup: '/admin/signup' },
    switchRole: { to: '/login', label: 'Here to shop? Go to shopper sign-in' },
  },
}

export default function AuthPage({ role, mode }) {
  const copy = COPY[role]
  const text = copy[mode]
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, setUser } = useSession(role)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const destination = location.state?.from || copy.home

  useEffect(() => {
    document.title = `${text.title} | RetailFlow`
  }, [text.title])

  if (loading) return <PageLoader label="Checking your session" />
  if (user) return <Navigate to={destination} replace />

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      const profile = isSignup ? await api.signup(role, form) : await api.login(role, form)
      setUser(profile)
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const fillDemo = async () => {
    const { DEMO_SELLER } = await import('../services/backends/local.js')
    setForm({ name: '', email: DEMO_SELLER.email, password: DEMO_SELLER.password })
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat sm:justify-start"
      style={{ backgroundImage: `url(${isSignup ? signupBg : loginBg})` }}
    >
      <main className="m-4 w-full max-w-[460px] rounded-3xl border border-gray-200 bg-white/95 px-6 py-9 shadow-2xl backdrop-blur-md sm:ml-10 sm:px-12 md:ml-16 lg:ml-24">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" aria-label="RetailFlow home">
            <Wordmark className="h-12" />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Store
          </Link>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-gray-800">{text.title}</h1>
        <p className="mt-2 text-sm text-gray-500">{text.lead}</p>

        <form onSubmit={submit} className="mt-7 space-y-5">
          {isSignup && (
            <Field
              label={role === 'admin' ? 'Store name' : 'Your name'}
              value={form.name}
              onChange={set('name')}
              autoComplete={role === 'admin' ? 'organization' : 'name'}
              placeholder={role === 'admin' ? 'Corner Store' : 'Enter your name'}
              required
            />
          )}
          <Field label="Email address" type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" required />
          <Field
            label="Password"
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            minLength={6}
            placeholder={isSignup ? 'Create a password' : 'Enter your password'}
            hint={isSignup ? 'At least 6 characters.' : undefined}
            required
          />
          {error && <Notice>{error}</Notice>}
          <Button type="submit" busy={busy} className="w-full">
            {text.submit}
          </Button>
        </form>

        {backend === 'local' && role === 'admin' && !isSignup && (
          <button type="button" onClick={fillDemo} className="mt-4 text-sm font-semibold text-blue-600 hover:underline">
            Fill in the demo seller account
          </button>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link to={isSignup ? copy.paths.login : copy.paths.signup} state={location.state} className="font-semibold text-blue-600 hover:underline">
            {isSignup ? 'Sign in' : role === 'admin' ? 'Open a store' : 'Sign up'}
          </Link>
        </p>
        <p className="mt-3 text-center text-sm">
          <Link to={copy.switchRole.to} className="text-slate-500 hover:text-blue-600">
            {copy.switchRole.label}
          </Link>
        </p>
      </main>
    </div>
  )
}
