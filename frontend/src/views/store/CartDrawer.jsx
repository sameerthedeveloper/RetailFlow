import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, CircleCheck, ShoppingBag, Trash2 } from 'lucide-react'
import { api } from '../../services/api'
import { cart, limitFor, useCart } from '../../lib/cart'
import { useSession } from '../../lib/session'
import { orderNumber, plural, rupees } from '../../lib/format'
import { Button, Drawer, EmptyState, Field, IconButton, Notice, ProductImage, QuantityStepper } from '../../components/ui'

const EMPTY_ADDRESS = { address: '', city: '', postalCode: '', country: 'India' }

function Summary({ count, total }) {
  return (
    <dl className="space-y-1.5 text-[0.95rem]">
      <div className="flex justify-between text-slate-500">
        <dt>{plural(count, 'item')}</dt>
        <dd className="nums">{rupees(total)}</dd>
      </div>
      <div className="flex justify-between text-slate-500">
        <dt>Delivery</dt>
        <dd className="font-semibold text-emerald-600">Free</dd>
      </div>
      <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-bold text-slate-800">
        <dt>To pay on delivery</dt>
        <dd className="nums">{rupees(total)}</dd>
      </div>
    </dl>
  )
}

export default function CartDrawer({ open, onClose, onOrderPlaced }) {
  const { lines, count, total } = useCart()
  const { user } = useSession('customer')
  const location = useLocation()
  const [step, setStep] = useState('cart') // cart -> address -> placed
  const [address, setAddress] = useState(EMPTY_ADDRESS)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [placed, setPlaced] = useState(null)

  useEffect(() => {
    if (open) {
      setStep('cart')
      setError('')
    }
  }, [open])

  const set = (key) => (event) => {
    setAddress((prev) => ({ ...prev, [key]: event.target.value }))
    setError('')
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const order = await api.createOrder({
        orderItems: lines.map(({ _id, name, quantity, price, image }) => ({ product: _id, name, quantity, price, image })),
        shippingAddress: address,
        paymentMethod: 'Cash on Delivery',
        totalPrice: total,
      })
      setPlaced({ number: orderNumber(order), total: order.totalPrice ?? total })
      cart.clear()
      setStep('placed')
      onOrderPlaced?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const title = { cart: 'Your cart', address: 'Delivery address', placed: 'Order placed' }[step]

  const footer =
    step === 'cart' && lines.length > 0 ? (
      <div className="space-y-4">
        <Summary count={count} total={total} />
        {user ? (
          <Button size="lg" className="w-full" onClick={() => setStep('address')}>
            Continue to delivery
          </Button>
        ) : (
          <Link
            to="/login"
            state={{ from: location.pathname }}
            onClick={onClose}
            className="flex h-13 w-full items-center justify-center rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700"
          >
            Sign in to check out
          </Link>
        )}
      </div>
    ) : step === 'address' ? (
      <div className="space-y-4">
        <Summary count={count} total={total} />
        {error && <Notice>{error}</Notice>}
        <Button type="submit" form="delivery-form" size="lg" className="w-full" busy={busy}>
          Place order, pay {rupees(total)} on delivery
        </Button>
      </div>
    ) : null

  return (
    <Drawer open={open} onClose={onClose} title={title} footer={footer}>
      {step === 'cart' &&
        (lines.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="Your cart is empty" action={<Button onClick={onClose}>Keep shopping</Button>}>
            Add something from the shop and it will wait here for you.
          </EmptyState>
        ) : (
          <ul className="divide-y divide-slate-100 px-5">
            {lines.map((line) => (
              <li key={line._id} className="flex gap-4 py-4">
                <ProductImage src={line.image} alt="" className="h-20 w-20 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold leading-snug text-slate-800">{line.name}</p>
                    <IconButton label={`Remove ${line.name}`} onClick={() => cart.remove(line._id)} className="-mr-2 -mt-2 text-slate-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </IconButton>
                  </div>
                  <p className="text-sm text-slate-500">{rupees(line.price)} each</p>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper
                      size="sm"
                      quantity={line.quantity}
                      max={limitFor(line)}
                      onChange={(next) => cart.setQuantity(line, next)}
                      label={`Quantity of ${line.name}`}
                    />
                    <span className="nums font-bold text-slate-800">{rupees(line.price * line.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ))}

      {step === 'address' && (
        <form id="delivery-form" onSubmit={placeOrder} className="space-y-4 p-5">
          <button type="button" onClick={() => setStep('cart')} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to cart
          </button>
          <Field label="Address" as="textarea" rows={3} value={address.address} onChange={set('address')} autoComplete="street-address" placeholder="House number, street, area" required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" value={address.city} onChange={set('city')} autoComplete="address-level2" required />
            <Field label="PIN code" value={address.postalCode} onChange={set('postalCode')} autoComplete="postal-code" inputMode="numeric" required />
          </div>
          <Field label="Country" value={address.country} onChange={set('country')} autoComplete="country-name" required />
          <Notice tone="ink">No payment now. Hand over the cash when your order arrives.</Notice>
        </form>
      )}

      {step === 'placed' && placed && (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <CircleCheck className="h-14 w-14 text-emerald-600" aria-hidden="true" />
          <h3 className="mt-4 text-2xl font-extrabold text-slate-800">Order {placed.number} is in</h3>
          <p className="mt-2 max-w-xs text-slate-500">
            The seller has it now. Keep {rupees(placed.total)} ready for the delivery.
          </p>
          <div className="mt-7 flex w-full max-w-xs flex-col gap-2">
            <Link to="/orders" onClick={onClose} className="flex h-11 items-center justify-center rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700">
              Track this order
            </Link>
            <Button variant="ghost" onClick={onClose}>
              Keep shopping
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  )
}
