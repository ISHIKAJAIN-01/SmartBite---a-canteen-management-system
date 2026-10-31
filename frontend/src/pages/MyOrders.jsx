
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";

const API_BASE = "http://localhost:5001/api";
const TEST_USER_ID = 1;

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState("");

  async function fetchOrders() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/orders/user/${TEST_USER_ID}`
      );
      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Could not load your orders.");
      }

      const list = Array.isArray(data.orders)
        ? data.orders
        : Array.isArray(data.data)
          ? data.data
          : [];

      setOrders(list);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load orders. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  async function cancelOrder(order) {
    const orderId = order.order_id ?? order.id;

    if (!orderId) {
      setError("Order ID is missing, so this order cannot be cancelled.");
      return;
    }

    if (order.cart_type !== "snacks_desserts") {
      setError("Meals and Drinks orders cannot be cancelled.");
      return;
    }

    if (
      !window.confirm(
        `Cancel order #${orderId}? This action may not be reversible.`
      )
    ) {
      return;
    }

    setCancellingId(orderId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/orders/${orderId}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reason: "Cancelled by customer",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Could not cancel this order.");
      }

      setMessage(`Order #${orderId} cancelled successfully.`);
      await fetchOrders();
    } catch (err) {
      setError(err.message || "Unable to cancel the order.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="my-orders-page">
      <div className="my-orders-heading">
        <div>
          <p className="my-orders-eyebrow">YOUR SMARTBITE ACCOUNT</p>
          <h1>My Orders</h1>
          <p>Track your previous canteen orders and their status.</p>
        </div>

        <button
          type="button"
          className="my-orders-refresh"
          onClick={fetchOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh orders"}
        </button>
      </div>

      {message && (
        <p className="my-orders-message" role="status">
          {message}
        </p>
      )}

      {error && (
        <div className="my-orders-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={fetchOrders}>
            Try again
          </button>
        </div>
      )}

      {loading ? (
        <section className="my-orders-empty">
          <p>Loading your orders...</p>
        </section>
      ) : orders.length === 0 && !error ? (
        <section className="my-orders-empty">
          <div className="my-orders-empty-icon">🍽️</div>
          <h2>No orders yet</h2>
          <p>Your placed orders will appear here.</p>
          <button
            type="button"
            className="my-orders-primary"
            onClick={() => navigate("/menu")}
          >
            Explore menu
          </button>
        </section>
      ) : (
        <section className="my-orders-list">
          {orders.map((order, index) => {
            const orderId = order.order_id ?? order.id ?? index;
            const status = order.status || "Pending";
            const cartType = order.cart_type;

            const canCancel =
              cartType === "snacks_desserts" &&
              !["cancelled", "completed"].includes(
                String(status).toLowerCase()
              );

            return (
              <article className="my-order-card" key={orderId}>
                <div className="my-order-top">
                  <div>
                    <p className="my-order-number">ORDER #{orderId}</p>
                    <h2>
                      {cartType === "snacks_desserts"
                        ? "Snacks & Desserts"
                        : "Meals & Drinks"}
                    </h2>
                  </div>

                  <span
                    className={`my-order-status status-${String(status)
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    {status}
                  </span>
                </div>

                <div className="my-order-info">
                  <div>
                    <span>Order total</span>
                    <strong>
                      {money(order.total_amount ?? order.total)}
                    </strong>
                  </div>

                  <div>
                    <span>Payment</span>
                    <strong>
                      {order.payment_status ||
                        order.payment?.payment_status ||
                        "Check details"}
                    </strong>
                  </div>

                  <div>
                    <span>Order date</span>
                    <strong>
                      {order.created_at || order.order_date
                        ? new Date(
                            order.created_at || order.order_date
                          ).toLocaleString("en-IN")
                        : "Date unavailable"}
                    </strong>
                  </div>
                </div>

                {canCancel && (
                  <div className="my-order-actions">
                    <button
                      type="button"
                      className="my-order-cancel"
                      disabled={cancellingId !== null}
                      onClick={() => cancelOrder(order)}
                    >
                      {cancellingId === orderId
                        ? "Cancelling..."
                        : "Cancel order"}
                    </button>
                  </div>
                )}

                {cartType === "meals_drinks" && (
                  <p className="my-order-note">
                    Meals & Drinks orders cannot be cancelled.
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default MyOrders;
