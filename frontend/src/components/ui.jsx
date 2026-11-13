import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Info, Loader2, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { rupees } from '../lib/format'
import logo from '../assets/logo.png'

const cx = (...parts) => parts.filter(Boolean).join(' ')

/* ---------- Brand ---------- */

export function Wordmark({ className = 'h-11' }) {
  return <img src={logo} alt="RetailFlow" className={cx('w-auto object-contain', className)} />
}

/* ---------- Buttons ---------- */

const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none',
  quiet: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:text-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 disabled:text-slate-400',
  danger: 'bg-red-500 text-white hover:bg-red-600 disabled:bg-slate-100 disabled:text-slate-400',
}
const BUTTON_SIZES = {
  sm: 'h-9 px-3.5 text-sm rounded-lg',
  md: 'h-11 px-5 text-[0.95rem] rounded-xl',
  lg: 'h-13 px-7 text-base rounded-xl',
}

export function Button({ variant = 'primary', size = 'md', busy = false, className = '', children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || busy}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed',
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export function IconButton({ label, className = '', children, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cx('inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 disabled:text-slate-500', className)}
    >
      {children}
    </button>
  )
}

/* ---------- Form fields ---------- */

const INPUT =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30'

export function Field({ label, hint, error, as: Tag = 'input', className = '', children, ...props }) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <Tag id={id} {...props} aria-invalid={Boolean(error)} className={cx(INPUT, error && 'border-red-400')}>
        {children}
      </Tag>
      {(error || hint) && <p className={cx('mt-1.5 text-sm', error ? 'text-red-600' : 'text-slate-500')}>{error || hint}</p>}
    </div>
  )
}

export function Notice({ tone = 'alarm', children }) {
  const tones = { alarm: 'bg-red-50 text-red-600', leaf: 'bg-emerald-50 text-emerald-600', ink: 'bg-blue-50 text-blue-700' }
  return (
    <p role={tone === 'alarm' ? 'alert' : 'status'} className={cx('flex items-start gap-2 rounded-xl px-3.5 py-3 text-sm font-medium', tones[tone])}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

/* ---------- Retail bits ---------- */

export function Price({ amount, className = 'text-xl' }) {
  return <span className={cx('nums font-black text-slate-900', className)}>{rupees(amount)}</span>
}

export function QuantityStepper({ quantity, max, onChange, size = 'md', label = 'Quantity' }) {
  const box = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
      <button type="button" aria-label="Remove one" onClick={() => onChange(quantity - 1)} className={cx(box, 'grid place-items-center rounded-l-xl text-slate-500 hover:bg-slate-100')}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span aria-live="polite" className="nums min-w-7 text-center text-sm font-bold">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Add one"
        disabled={quantity >= max}
        onClick={() => onChange(quantity + 1)}
        className={cx(box, 'grid place-items-center rounded-r-xl text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300')}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}

const STATUS_TONES = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Processing: 'bg-blue-50 text-blue-600 border-blue-200',
  Shipped: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  Delivered: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  Cancelled: 'bg-red-50 text-red-600 border-red-200',
}

export function StatusPill({ status }) {
  return <span className={cx('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold', STATUS_TONES[status] || STATUS_TONES.Pending)}>{status}</span>
}

export function StockNote({ count }) {
  if (count <= 0) return <span className="text-sm font-semibold text-red-600">Sold out</span>
  if (count <= 5) return <span className="text-sm font-semibold text-amber-600">Only {count} left</span>
  return <span className="text-sm font-medium text-emerald-600">In stock</span>
}

export function ProductImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={cx('grid place-items-center bg-slate-50 text-slate-300', className)} role="img" aria-label={alt}>
        <ShoppingBag className="h-8 w-8" aria-hidden="true" />
      </div>
    )
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cx('bg-slate-50 object-cover', className)} />
}

/* ---------- States ---------- */

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-50 text-slate-400">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {children && <p className="mt-1.5 text-[0.95rem] text-slate-500">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageLoader({ label = 'Loading' }) {
  return (
    <div role="status" className="grid min-h-[50vh] place-items-center text-slate-500">
      <span className="flex items-center gap-2.5 text-sm font-medium">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" aria-hidden="true" />
        {label}
      </span>
    </div>
  )
}

/* ---------- Overlays ---------- */

function useOverlay(open, onClose) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const onKey = (event) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [open, onClose])
  return ref
}

const SCRIM = 'fixed inset-0 z-40 bg-slate-900/60'

export function Drawer({ open, onClose, title, children, footer }) {
  const ref = useOverlay(open, onClose)
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className={SCRIM} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            ref={ref}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl outline-none"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.24, ease: 'easeOut' }}
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <h2 className="text-xl font-bold text-slate-800">{title}</h2>
              <IconButton label="Close" onClick={onClose}>
                <X className="h-5 w-5" aria-hidden="true" />
              </IconButton>
            </header>
            <div className="flex-1 overflow-y-auto">{children}</div>
            {footer && <footer className="border-t border-slate-200 bg-slate-50 px-5 py-4">{footer}</footer>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export function Modal({ open, onClose, title, children, wide = false }) {
  const ref = useOverlay(open, onClose)
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className={SCRIM} onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
            <motion.div
              ref={ref}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-label={title}
              className={cx(
                'pointer-events-auto flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none sm:rounded-3xl',
                wide ? 'sm:max-w-4xl' : 'sm:max-w-xl',
              )}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5 sm:px-6">
                <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                <IconButton label="Close" onClick={onClose}>
                  <X className="h-5 w-5" aria-hidden="true" />
                </IconButton>
              </header>
              <div className="overflow-y-auto">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ---------- Toasts ---------- */

const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, tone = 'ok') => {
    const id = crypto.randomUUID()
    setToasts((list) => [...list.slice(-2), { id, message, tone }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3600)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className={cx(
                'pointer-events-auto flex max-w-md items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-2xl',
                t.tone === 'error' ? 'bg-red-500' : 'bg-slate-900',
              )}
            >
              {t.tone === 'error' ? <Info className="h-4 w-4 shrink-0" aria-hidden="true" /> : <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
