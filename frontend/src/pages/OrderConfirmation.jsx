
import { useNavigate } from "react-router-dom";
import "./OrderConfirmation.css";

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function OrderConfirmation() {
  const navigate = useNavigate();

  let order = null;

  try {
    const saved = sessionStorage.getItem(
      "smartbite-order-confirmation"
    );
    order = saved ? JSON.parse(saved) : null;
  } catch {
    order = null;
  }

  if (!order) {
    return (
      <main className="confirmation-page">
        <section className="confirmation-card">
          <div className="confirmation-icon">ℹ️</div>
          <h1>No order details found</h1>
          <p>Please check My Orders or return to the menu.</p>

          <button
            type="button"
            className="confirmation-primary"
            onClick={() => navigate("/menu")}
          >
            Back to menu
          </button>

          <button
            type="button"
            className="confirmation-secondary"
            onClick={() => navigate("/my-orders")}
          >
            My Orders
          </button>
        </section>
      </main>
    );
  }

  const orderId = order.order_id ?? order.id ?? "—";
  const paymentStatus =
    order.payment?.payment_status || "Unknown";

  return (
    <main className="confirmation-page">
      <section className="confirmation-card">
        <div className="confirmation-icon" aria-hidden="true">
          ✓
        </div>

        <p className="confirmation-eyebrow">
          SMARTBITE · CAMPUS CANTEEN
        </p>

        <h1>Order placed!</h1>

        <p className="confirmation-description">
          Thank you, {order.customer_name || "Customer"}. Your order
          details are saved below.
        </p>

        <div className="confirmation-order-number">
          <span>Order number</span>
          <strong>#{orderId}</strong>
        </div>

        <div className="confirmation-details">
          <div>
            <span>Order status</span>
            <strong>{order.status || "Pending"}</strong>
          </div>

          <div>
            <span>Payment method</span>
            <strong>
              {order.payment?.payment_method || "—"}
            </strong>
          </div>

          <div>
            <span>Payment status</span>
            <strong>{paymentStatus}</strong>
          </div>

          <div>
            <span>Pickup location</span>
            <strong>
              {order.pickup_location || "Campus canteen counter"}
            </strong>
          </div>

          <div>
            <span>Order total</span>
            <strong>
              {money(order.total_amount ?? order.total)}
            </strong>
          </div>
        </div>

        {order.special_instructions && (
          <div className="confirmation-instructions">
            <strong>Special instructions</strong>
            <p>{order.special_instructions}</p>
          </div>
        )}

        <p className="confirmation-note">
          Payment is simulated for this project. No real money was charged.
        </p>

        <div className="confirmation-actions">
          <button
            type="button"
            className="confirmation-primary"
            onClick={() => navigate("/menu")}
          >
            Back to menu
          </button>

          <button
            type="button"
            className="confirmation-secondary"
            onClick={() => navigate("/my-orders")}
          >
            My Orders
          </button>
        </div>
      </section>
    </main>
  );
}

export default OrderConfirmation;
