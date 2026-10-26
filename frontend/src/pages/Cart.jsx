import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'

function CartSection({
  title,
  description,
  items,
  cartType,
  updateQuantity,
  removeFromCart,
}) {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <section className="mb-8 rounded-2xl border border-[#E5D9C9] bg-white p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-[#382117]">{title}</h2>
        <p className="mt-1 text-sm text-[#706052]">{description}</p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl bg-[#F8F1E8] p-5 text-sm text-[#706052]">
          No items in this cart yet.
        </p>
      ) : (
        <div className="divide-y divide-[#E5D9C9]">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#F2E6D1] text-3xl">
                  {item.emoji || '🍽️'}
                </div>

                <div>
                  <h3 className="font-semibold text-[#382117]">
                    {item.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#706052]">
                    ₹{item.price} each
                  </p>
                  <p className="mt-1 font-semibold text-[#382117]">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-[#E5D9C9]">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1, cartType)
                    }
                    aria-label={`Decrease ${item.name} quantity`}
                    className="p-2 text-[#382117] hover:bg-[#F8F1E8]"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="min-w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1, cartType)
                    }
                    aria-label={`Increase ${item.name} quantity`}
                    className="p-2 text-[#382117] hover:bg-[#F8F1E8]"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id, cartType)}
                  aria-label={`Remove ${item.name}`}
                  className="rounded-lg p-2 text-[#968575] hover:bg-[#F8F1E8] hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex justify-between border-t border-[#E5D9C9] pt-4">
        <span className="font-medium text-[#706052]">Subtotal</span>
        <span className="text-lg font-bold text-[#382117]">₹{total}</span>
      </div>
    </section>
  )
}

function Cart() {
  const {
    preparedCart,
    readyToServeCart,
    removeFromCart,
    updateQuantity,
  } = useCart()

  const preparedTotal = preparedCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const readyToServeTotal = readyToServeCart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const totalItems = [...preparedCart, ...readyToServeCart].reduce(
    (sum, item) => sum + item.quantity,
    0
  )

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12 md:px-8">
      <div className="mb-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#968575]">
          Your Order
        </p>
        <h1 className="text-4xl font-semibold text-[#382117] md:text-5xl">
          Your Cart
        </h1>
        <p className="mt-3 text-[#706052]">
          Review your items before continuing to checkout.
        </p>
      </div>

      <CartSection
        title="Will Be Prepared"
        description="Items prepared by the canteen after ordering."
        items={preparedCart}
        cartType="prepared"
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      <CartSection
        title="Ready to Serve"
        description="Packaged items ready for pickup."
        items={readyToServeCart}
        cartType="readyToServe"
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      <section className="rounded-2xl border border-[#E5D9C9] bg-[#F8F1E8] p-6">
        <div className="flex items-center justify-between text-sm text-[#706052]">
          <span>Total items</span>
          <span>{totalItems}</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-sm text-[#706052]">
          <span>Will Be Prepared subtotal</span>
          <span>₹{preparedTotal}</span>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm text-[#706052]">
          <span>Ready to Serve subtotal</span>
          <span>₹{readyToServeTotal}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[#E5D9C9] pt-4">
          <span className="text-lg font-semibold text-[#382117]">
            Grand total
          </span>
          <span className="text-2xl font-bold text-[#382117]">
            ₹{preparedTotal + readyToServeTotal}
          </span>
        </div>

        <Link
          to="/menu"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#382117] px-5 py-3 font-semibold text-[#382117] transition hover:bg-[#EADCC3]"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </Link>

        <button
          type="button"
          disabled={totalItems === 0}
          onClick={() => {
            alert('Checkout page will be connected in the next step.')
          }}
          className="mt-3 w-full rounded-xl bg-[#382117] px-5 py-3 font-semibold text-white transition hover:bg-[#503325] disabled:cursor-not-allowed disabled:bg-[#968575]"
        >
          Proceed to Checkout
        </button>
      </section>
    </main>
  )
}

export default Cart
