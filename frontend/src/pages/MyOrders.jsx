
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation, Clock, RefreshCw, Eye, ArrowRight } from "lucide-react";
import { orderTrackingService } from "../services/orderTrackingService";
import { getStoredUser } from "../services/api";
import StatusBadge from "../components/tracking/StatusBadge";
import "./MyOrders.css";

const API_BASE = "http://localhost:5001/api";

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
  const [activeTab, setActiveTab] = useState("active"); // 'active' (Member 3 endpoint) or 'all'

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (activeTab === "active") {
        // Member 3 assigned endpoint: GET /api/orders/my/active
        const data = await orderTrackingService.getMyActiveOrders();
        const list = Array.isArray(data.orders)
          ? data.orders
          : Array.isArray(data.data)
            ? data.data
            : [];
        setOrders(list);
      } else {
        // All orders endpoint for full history and cancellation
        const storedUser = getStoredUser();
        if (!storedUser?.user_id) {
          throw new Error("Please sign in to view your complete order history.");
        }
        const response = await fetch(`${API_BASE}/orders/user/${storedUser.user_id}`);
        const data = await response.json();

        if (!response.ok || data.status !== "success") {
          throw new Error(data.message || "Could not load all orders.");
        }

        const list = Array.isArray(data.orders)
          ? data.orders
          : Array.isArray(data.data)
            ? data.data
            : [];
        setOrders(list);
      }
    } catch (err) {
      console.error("[MyOrders] Fetch error:", err);
      setError(
        err.message ||
          "Unable to load orders. Please verify the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function cancelOrder(e, order) {
    e.stopPropagation();
    const orderId = order.order_id ?? order.id;

    if (!orderId) {
      setError("Order ID is missing, so this order cannot be cancelled.");
      return;
    }

    if (order.cart_type && order.cart_type !== "snacks_desserts") {
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

  function handleTrackOrder(e, orderId) {
    e.stopPropagation();
    navigate(`/orders/${orderId}/tracking`);
  }

  function handleQueueStatus(e, orderId) {
    e.stopPropagation();
    navigate(`/orders/${orderId}/queue`);
  }

  return (
    <main className="my-orders-page">
      <div className="my-orders-heading">
        <div>
          <p className="my-orders-eyebrow">YOUR SMARTBITE ACCOUNT</p>
          <h1>My Orders</h1>
          <p>Track your active and previous canteen orders and their live status.</p>
        </div>

        <button
          type="button"
          className="my-orders-refresh"
          onClick={fetchOrders}
          disabled={loading}
          aria-label="Refresh orders"
        >
          <RefreshCw size={15} className={loading ? "spin-icon" : ""} />
          <span>{loading ? "Loading..." : "Refresh orders"}</span>
        </button>
      </div>

      {/* Filter Tabs: Active Orders (Member 3) vs All Orders */}
      <div className="my-orders-tabs" role="tablist" aria-label="Order filters">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "active"}
          className={`tab-btn ${activeTab === "active" ? "active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          Active Orders (Live Tracking)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "all"}
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Orders History
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
          <RefreshCw size={28} className="spin-icon empty-spinner" />
          <p>Loading your orders...</p>
        </section>
      ) : orders.length === 0 && !error ? (
        <section className="my-orders-empty">
          <div className="my-orders-empty-icon">🍽️</div>
          <h2>{activeTab === "active" ? "No active orders right now" : "No orders yet"}</h2>
          <p>
            {activeTab === "active"
              ? "You do not have any orders currently being prepared in the kitchen."
              : "Your placed orders will appear here once you place an order."}
          </p>
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
              !["cancelled", "completed", "collected"].includes(
                String(status).toLowerCase()
              );

            const isQueueEligible = ["placed", "pending", "preparing"].includes(
              String(status).toLowerCase()
            );

            return (
              <article
                className="my-order-card interactive"
                key={orderId}
                onClick={() => navigate(`/orders/${orderId}/tracking`)}
                tabIndex={0}
                role="button"
                aria-label={`View tracking for Order #${orderId}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/orders/${orderId}/tracking`);
                  }
                }}
              >
                <div className="my-order-top">
                  <div>
                    <p className="my-order-number">ORDER #{orderId}</p>
                    <h2>
                      {cartType === "snacks_desserts"
                        ? "Snacks & Desserts"
                        : cartType === "meals_drinks"
                          ? "Meals & Drinks"
                          : "Canteen Order"}
                    </h2>
                  </div>

                  <StatusBadge status={status} size="medium" />
                </div>

                <div className="my-order-info">
                  <div>
                    <span>Order total</span>
                    <strong>
                      {money(order.total_amount ?? order.total)}
                    </strong>
                  </div>

                  <div>
                    <span>Order date</span>
                    <strong>
                      {order.created_at || order.order_date
                        ? new Date(
                            order.created_at || order.order_date
                          ).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Date unavailable"}
                    </strong>
                  </div>

                  <div>
                    <span>Kitchen status</span>
                    <strong>
                      {order.estimated_prep_minutes
                        ? `Est. prep: ~${order.estimated_prep_minutes} min`
                        : status}
                    </strong>
                  </div>
                </div>

                {/* Primary Card Actions: Track Order & Queue Status */}
                <div className="my-order-actions-bar">
                  <div className="my-order-action-links">
                    <button
                      type="button"
                      className="my-order-track-btn"
                      onClick={(e) => handleTrackOrder(e, orderId)}
                      aria-label={`Track order #${orderId}`}
                    >
                      <Navigation size={15} />
                      <span>Track Order</span>
                      <ArrowRight size={14} className="track-arrow" />
                    </button>

                    {isQueueEligible && (
                      <button
                        type="button"
                        className="my-order-queue-btn"
                        onClick={(e) => handleQueueStatus(e, orderId)}
                        aria-label={`View queue for order #${orderId}`}
                      >
                        <Clock size={15} />
                        <span>Queue Status</span>
                      </button>
                    )}
                  </div>

                  {canCancel && (
                    <div className="my-order-cancel-wrap">
                      <button
                        type="button"
                        className="my-order-cancel"
                        disabled={cancellingId !== null}
                        onClick={(e) => cancelOrder(e, order)}
                      >
                        {cancellingId === orderId
                          ? "Cancelling..."
                          : "Cancel order"}
                      </button>
                    </div>
                  )}
                </div>

                {cartType === "meals_drinks" && (
                  <p className="my-order-note">
                    Meals & Drinks orders cannot be cancelled once placed.
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
