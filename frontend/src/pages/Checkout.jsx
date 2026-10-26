
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import "./Checkout.css";

const API_BASE = "http://localhost:5001/api";

// Temporary testing ID. Use an ID that exists in your Users table.
const TEST_USER_ID = 1;

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function Checkout() {
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [items] = useState(() => {
    try {
      const saved = sessionStorage.getItem("smartbite-cart");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [cartType] = useState(
    () => sessionStorage.getItem("smartbite-cart-type") || "meals_drinks"
  );

  const [name, setName] = useState("");
  const [pickupLocation, setPickupLocation] = useState(
    "Campus canteen counter"
  );
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          (Number(item.price) || 0) * (Number(item.quantity) || 0),
        0
      ),
    [items]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (items.length === 0) {
      setError("Your cart is empty. Please add items before checkout.");
      return;
    }

    if (!name.trim() || !pickupLocation.trim()) {
      setError("Please enter your name and pickup location.");
      return;
    }

    const orderItems = items.map((item) => ({
      item_id: Number(item.item_id ?? item.id),
      quantity: Number(item.quantity),
    }));

    if (
      orderItems.some(
        (item) =>
          !Number.isInteger(item.item_id) ||
          item.item_id < 1 ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1
      )
    ) {
      setError("One or more cart items have invalid IDs or quantities.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the order.
      const orderResponse = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: TEST_USER_ID,
          cart_type: cartType,
          items: orderItems,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok || orderData.status !== "success") {
        throw new Error(
          orderData.message ||
            orderData.errors?.join(", ") ||
            "Could not create your order."
        );
      }

      const order = orderData.order;

      if (!order?.order_id) {
        throw new Error("The server did not return a valid order ID.");
      }

      const orderDetails = {
        ...order,
        customer_name: name.trim(),
        pickup_location: pickupLocation.trim(),
        special_instructions: instructions.trim(),
      };

      sessionStorage.setItem(
        "smartbite-pending-order",
        JSON.stringify(orderDetails)
      );

      // 2. Process normal simulated payment.
      const paymentResponse = await fetch(`${API_BASE}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.order_id,
          payment_method: paymentMethod,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok || paymentData.status !== "success") {
        throw new Error(
          `Order #${order.order_id} was created, but payment failed: ${
            paymentData.message || "Please try again."
          }`
        );
      }

      if (paymentData.payment?.payment_status !== "Success") {
        throw new Error(
          `Order #${order.order_id} was created, but payment was not successful.`
        );
      }

      // 3. Save order confirmation details.
      sessionStorage.setItem(
        "smartbite-order-confirmation",
        JSON.stringify({
          ...orderDetails,
          payment: paymentData.payment,
        })
      );

      // 4. Clear the selected cart after successful payment.
      clearCart(cartType);

      sessionStorage.removeItem("smartbite-cart");
      sessionStorage.removeItem("smartbite-cart-type");
      sessionStorage.removeItem("smartbite-pending-order");

      setSuccess("Order and simulated payment completed successfully.");

      // 5. Navigate to order confirmation.
      navigate("/order-confirmation");
    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please check your server and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="checkout-page">
      <div className="checkout-heading">
        <p className="checkout-eyebrow">ALMOST THERE</p>
        <h1>Checkout</h1>
        <p>Review your order and choose your payment method.</p>
      </div>

      {items.length === 0 ? (
        <section className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add items before proceeding to checkout.</p>
          <button type="button" onClick={() => navigate("/menu")}>
            Back to menu
          </button>
        </section>
      ) : (
        <form className="checkout-layout" onSubmit={handleSubmit}>
          <div className="checkout-main">
            <section className="checkout-card">
              <h2>Pickup details</h2>
              <p className="checkout-muted">
                Your order will be collected from the campus canteen.
              </p>

              <label htmlFor="pickup-name">Name</label>
              <input
                id="pickup-name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />

              <label htmlFor="pickup-location">Pickup location</label>
              <input
                id="pickup-location"
                type="text"
                placeholder="Campus canteen counter"
                value={pickupLocation}
                onChange={(event) => setPickupLocation(event.target.value)}
                required
              />

              <label htmlFor="instructions">
                Special instructions <span>(optional)</span>
              </label>
              <textarea
                id="instructions"
                rows="3"
                maxLength="500"
                placeholder="Any notes for your order?"
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </section>

            <section className="checkout-card">
              <h2>Payment method</h2>
              <p className="checkout-muted">
                Select how you want to pay. This is a simulation only.
              </p>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === "UPI"}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <span>
                  <strong>UPI</strong>
                  <small>Simulated UPI payment</small>
                </span>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="payment"
                  value="CASH"
                  checked={paymentMethod === "CASH"}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <span>
                  <strong>Cash at counter</strong>
                  <small>Simulated cash payment option</small>
                </span>
              </label>
            </section>
          </div>

          <aside className="checkout-summary">
            <h2>Order summary</h2>

            <p className="checkout-muted">
              {items.length} {items.length === 1 ? "product" : "products"}
            </p>

            <div className="checkout-summary-items">
              {items.map((item, index) => (
                <div
                  className="checkout-product"
                  key={item.item_id ?? item.id ?? index}
                >
                  <div>
                    <strong>
                      {item.name || item.item_name || "Menu item"}
                    </strong>
                    <small>
                      Qty {item.quantity} × {money(item.price)}
                    </small>
                  </div>

                  <span>
                    {money(
                      (Number(item.price) || 0) *
                        (Number(item.quantity) || 0)
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout-total-line">
              <span>Estimated subtotal</span>
              <span>{money(subtotal)}</span>
            </div>

            <div className="checkout-total-line">
              <span>Pickup fee</span>
              <span>{money(0)}</span>
            </div>

            <div className="checkout-grand-total">
              <span>Estimated total</span>
              <strong>{money(subtotal)}</strong>
            </div>

            {error && (
              <p className="checkout-message" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="checkout-message" role="status">
                {success}
              </p>
            )}

            <button
              className="checkout-place-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Processing..." : "Place Order & Pay"}
            </button>

            <button
              className="checkout-back-button"
              type="button"
              disabled={loading}
              onClick={() => navigate("/cart")}
            >
              Back to cart
            </button>

            <p className="checkout-disclaimer">
              Simulated payment only. No real money is charged.
            </p>
          </aside>
        </form>
      )}
    </main>
  );
}

export default Checkout;
