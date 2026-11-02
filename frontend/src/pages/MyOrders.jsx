import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MyOrders.css";

const API_BASE = "http://localhost:5001/api";

/** Statuses that may still have meaningful queue / wait estimates */
const QUEUE_ELIGIBLE_STATUSES = new Set([
  "pending",
  "placed",
  "preparing",
]);

const TERMINAL_STATUSES = new Set([
  "cancelled",
  "collected",
  "completed",
]);

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

function formatReadyTime(isoOrDate) {
  if (!isoOrDate) return null;
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function queuePositionLabel(position, ordersAhead) {
  if (position == null || Number.isNaN(Number(position))) return null;
  const pos = Number(position);
  if (pos <= 0) return null;
  const suffix =
    pos % 10 === 1 && pos % 100 !== 11
      ? "st"
      : pos % 10 === 2 && pos % 100 !== 12
        ? "nd"
        : pos % 10 === 3 && pos % 100 !== 13
          ? "rd"
          : "th";
  if (typeof ordersAhead === "number" && ordersAhead >= 0) {
    if (ordersAhead === 0) return `${pos}${suffix} in queue (no orders ahead)`;
    if (ordersAhead === 1) return `${pos}${suffix} in queue (1 order ahead)`;
    return `${pos}${suffix} in queue (${ordersAhead} orders ahead)`;
  }
  return `${pos}${suffix} in queue`;
}

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState("");
  const [queueLoading, setQueueLoading] = useState(false);

  const queueFetchIdRef = useRef(0);
  const pollTimerRef = useRef(null);

  const enrichOrdersWithQueue = useCallback(async (orderList, token) => {
    if (!Array.isArray(orderList) || orderList.length === 0) return orderList;

    const fetchId = ++queueFetchIdRef.current;
    setQueueLoading(true);

    const enriched = await Promise.all(
      orderList.map(async (order) => {
        const orderId = order.order_id ?? order.id;
        const statusKey = String(order.status || "").toLowerCase();

        if (TERMINAL_STATUSES.has(statusKey) || !orderId) {
          return {
            ...order,
            queue_position: null,
            estimated_prep_minutes: null,
            estimated_ready_at: null,
            remaining_minutes: null,
            queue_message: null,
            estimate_available: false,
            queue_error: null,
          };
        }

        if (
          !QUEUE_ELIGIBLE_STATUSES.has(statusKey) &&
          statusKey !== "ready"
        ) {
          return {
            ...order,
            queue_position: null,
            estimated_prep_minutes: order.estimated_prep_minutes ?? null,
            estimated_ready_at: order.estimated_ready_at ?? null,
            remaining_minutes: null,
            queue_message: null,
            estimate_available: false,
            queue_error: null,
          };
        }

        try {
          const response = await fetch(
            `${API_BASE}/orders/${orderId}/queue`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.status === 401) {
            throw Object.assign(new Error("Unauthorized"), { status: 401 });
          }

          if (!response.ok) {
            return {
              ...order,
              queue_error: "Preparation estimate unavailable",
              estimate_available: false,
            };
          }

          const queueData = await response.json();

          return {
            ...order,
            status: queueData.status || order.status,
            queue_position:
              queueData.queue_position != null
                ? queueData.queue_position
                : null,
            estimated_prep_minutes:
              queueData.estimated_prep_minutes != null
                ? queueData.estimated_prep_minutes
                : null,
            estimated_ready_at: queueData.estimated_ready_at || null,
            remaining_minutes:
              queueData.remaining_minutes != null
                ? queueData.remaining_minutes
                : null,
            orders_ahead:
              queueData.orders_ahead != null ? queueData.orders_ahead : null,
            queue_message: queueData.message || null,
            estimate_available: Boolean(queueData.estimate_available),
            estimate_is_guaranteed: Boolean(queueData.estimate_is_guaranteed),
            queue_error: null,
          };
        } catch (err) {
          if (err && err.status === 401) throw err;
          return {
            ...order,
            queue_error: "Preparation estimate unavailable",
            estimate_available: false,
          };
        }
      })
    );

    if (fetchId !== queueFetchIdRef.current) {
      return null;
    }

    setQueueLoading(false);
    return enriched;
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok || data.status !== "success") {
        throw new Error(data.message || "Could not load your orders.");
      }

      const list = Array.isArray(data.orders)
        ? data.orders
        : Array.isArray(data.data)
          ? data.data
          : [];

      setOrders(list);
      setLoading(false);

      try {
        const enriched = await enrichOrdersWithQueue(list, token);
        if (enriched) {
          setOrders(enriched);
        }
      } catch (queueErr) {
        if (queueErr && queueErr.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        setQueueLoading(false);
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to load orders. Check that the backend is running."
      );
      setLoading(false);
      setQueueLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();

    pollTimerRef.current = setInterval(() => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setOrders((current) => {
        const hasActive = current.some((o) =>
          QUEUE_ELIGIBLE_STATUSES.has(String(o.status || "").toLowerCase())
        );
        if (!hasActive) return current;

        enrichOrdersWithQueue(current, token)
          .then((enriched) => {
            if (enriched) setOrders(enriched);
          })
          .catch(() => {});

        return current;
      });
    }, 45000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
      queueFetchIdRef.current += 1;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cancelOrder(order) {
    const orderId = order.order_id ?? order.id;
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

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
      const response = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: "Cancelled by customer",
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

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

  function renderTrackingSection(order) {
    const statusKey = String(order.status || "").toLowerCase();
    const isTerminal = TERMINAL_STATUSES.has(statusKey);
    const isReady = statusKey === "ready";
    const isActive = QUEUE_ELIGIBLE_STATUSES.has(statusKey);

    if (isTerminal) {
      return (
        <div className="my-order-tracking">
          <p className="my-order-tracking-title">Order Tracking</p>
          <div className="my-order-tracking-grid">
            <div>
              <span>Status</span>
              <strong>{order.status || "—"}</strong>
            </div>
            <div>
              <span>Queue</span>
              <strong>
                {statusKey === "cancelled"
                  ? "Order cancelled — not in queue"
                  : "Order completed — not in queue"}
              </strong>
            </div>
          </div>
          {order.queue_message && (
            <p className="my-order-tracking-message">{order.queue_message}</p>
          )}
        </div>
      );
    }

    if (isReady) {
      const readyLabel = formatReadyTime(order.estimated_ready_at);
      return (
        <div className="my-order-tracking my-order-tracking-ready">
          <p className="my-order-tracking-title">Order Tracking</p>
          <p className="my-order-tracking-ready-banner">
            Your order is ready for pickup
          </p>
          <div className="my-order-tracking-grid">
            <div>
              <span>Status</span>
              <strong>{order.status || "Ready"}</strong>
            </div>
            {readyLabel && (
              <div>
                <span>Ready since</span>
                <strong>{readyLabel}</strong>
              </div>
            )}
          </div>
          {order.queue_message && (
            <p className="my-order-tracking-message">{order.queue_message}</p>
          )}
        </div>
      );
    }

    const positionText = queuePositionLabel(
      order.queue_position,
      order.orders_ahead
    );
    const prepMinutes = order.estimated_prep_minutes;
    const readyLabel = formatReadyTime(order.estimated_ready_at);
    const remaining = order.remaining_minutes;
    const estimateOk =
      order.estimate_available &&
      !order.queue_error &&
      (prepMinutes != null || positionText || readyLabel);

    return (
      <div className="my-order-tracking">
        <p className="my-order-tracking-title">
          Order Tracking
          {queueLoading && isActive ? (
            <span className="my-order-tracking-refreshing"> · updating…</span>
          ) : null}
        </p>
        <div className="my-order-tracking-grid">
          <div>
            <span>Status</span>
            <strong>{order.status || "—"}</strong>
          </div>

          <div>
            <span>Queue Position</span>
            <strong>
              {positionText ||
                (order.queue_error
                  ? "Unavailable"
                  : isActive
                    ? "Calculating…"
                    : "—")}
            </strong>
          </div>

          <div>
            <span>Estimated Preparation</span>
            <strong>
              {typeof prepMinutes === "number" && !Number.isNaN(prepMinutes)
                ? `${prepMinutes} minute${prepMinutes === 1 ? "" : "s"}`
                : order.queue_error || !estimateOk
                  ? "Preparation estimate unavailable"
                  : "—"}
            </strong>
          </div>

          <div>
            <span>Expected Ready Time</span>
            <strong>
              {readyLabel ||
                (order.queue_error
                  ? "Preparation estimate unavailable"
                  : "—")}
            </strong>
          </div>

          {typeof remaining === "number" && !Number.isNaN(remaining) && (
            <div>
              <span>Time Remaining</span>
              <strong>
                {remaining <= 0
                  ? "Any moment now"
                  : `Approximately ${remaining} minute${remaining === 1 ? "" : "s"}`}
              </strong>
            </div>
          )}
        </div>
        {order.queue_message && (
          <p className="my-order-tracking-message">{order.queue_message}</p>
        )}
        {order.queue_error && !order.queue_message && (
          <p className="my-order-tracking-message">{order.queue_error}</p>
        )}
      </div>
    );
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
              !["cancelled", "completed", "collected"].includes(
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

                {renderTrackingSection(order)}

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
