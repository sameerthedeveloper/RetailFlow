import { useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { api, backend } from '../../services/api'
import { useSession } from '../../lib/session'
import { Button, Field, Notice, useToast } from '../../components/ui'
import { PageHeader } from './AdminLayout'

const BLANK = { current: '', next: '', confirm: '' }

export default function Settings() {
  const { seller } = useOutletContext()
  const { signOut } = useSession('admin')
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState(BLANK)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // The REST backend has no password endpoint yet, so do not offer the form there.
  const canChangePassword = backend !== 'mern'

  useEffect(() => {
    document.title = 'Settings | RetailFlow seller'
  }, [])

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
    setError('')
  }

  const submit = async (event) => {
    event.preventDefault()
    if (form.next !== form.confirm) return setError('The two new passwords do not match. Type them again.')
    setBusy(true)
    try {
      await api.changePassword('admin', form.current, form.next)
      setForm(BLANK)
      toast('Password changed')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" />

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6" aria-labelledby="store-heading">
        <h2 id="store-heading" className="text-lg font-bold text-slate-800">
          Store
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Store name</dt>
            <dd className="font-semibold text-slate-800">{seller.username}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Sign-in email</dt>
            <dd className="truncate font-semibold text-slate-800">{seller.email}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6" aria-labelledby="password-heading">
        <h2 id="password-heading" className="text-lg font-bold text-slate-800">
          Password
        </h2>
        {canChangePassword ? (
          <form onSubmit={submit} className="mt-4 space-y-4">
            <Field label="Current password" type="password" value={form.current} onChange={set('current')} autoComplete="current-password" required />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" type="password" minLength={6} value={form.next} onChange={set('next')} autoComplete="new-password" hint="At least 6 characters." required />
              <Field label="New password again" type="password" minLength={6} value={form.confirm} onChange={set('confirm')} autoComplete="new-password" required />
            </div>
            {error && <Notice>{error}</Notice>}
            <Button type="submit" busy={busy}>
              Change password
            </Button>
          </form>
        ) : (
          <p className="mt-2 text-slate-500">Changing your password from here is not available yet.</p>
        )}
      </section>

      <section className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white shadow-sm p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Sign out</h2>
          <p className="text-slate-500">Your products stay listed while you are away.</p>
        </div>
        <Button
          variant="quiet"
          onClick={async () => {
            await signOut()
            navigate('/admin/login')
          }}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </Button>
      </section>
    </div>
  )
}
