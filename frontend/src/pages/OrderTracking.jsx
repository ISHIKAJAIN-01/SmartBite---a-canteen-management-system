import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertTriangle, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { orderTrackingService } from '../services/orderTrackingService';
import StatusBadge from '../components/tracking/StatusBadge';
import OrderStepper from '../components/tracking/OrderStepper';
import QueueInfo from '../components/tracking/QueueInfo';
import PickupCard from '../components/tracking/PickupCard';
import './OrderTracking.css';

/**
 * Format currency in Indian Rupees (₹)
 */
function formatRupee(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format datetime to user-friendly local date and time string
 */
function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleString([], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '—';
  }
}

export default function OrderTracking() {
  const { orderId } = useParams();

  const [trackingData, setTrackingData] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Polling timer reference
  const pollingTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchTrackingDetails = useCallback(async (isBackground = false) => {
    if (!orderId) return;

    if (isBackground) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      // Parallel fetch tracking details and queue calculation
      const [trackingRes, queueRes] = await Promise.all([
        orderTrackingService.getOrderTracking(orderId),
        orderTrackingService.getOrderQueue(orderId).catch(() => null),
      ]);

      if (!isMountedRef.current) return;

      setTrackingData(trackingRes);
      setQueueData(queueRes);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error('[OrderTracking] Fetch error:', err);
      // Only set blocking error on initial load or non-background fetches
      if (!isBackground) {
        setError(err);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [orderId]);

  // Initial load and periodic polling setup (every 12 seconds)
  useEffect(() => {
    isMountedRef.current = true;
    fetchTrackingDetails(false);

    pollingTimerRef.current = setInterval(() => {
      fetchTrackingDetails(true);
    }, 12000); // 12 seconds poll interval

    // Cleanup timers and prevent obsolete state updates on unmount
    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [fetchTrackingDetails]);

  // Handle Manual Refresh
  const handleManualRefresh = () => {
    fetchTrackingDetails(true);
  };

  // 1. Loading State (Skeleton layout)
  if (isLoading) {
    return (
      <div className="tracking-page-container">
        <div className="tracking-wrapper">
          <div className="skeleton skeleton-breadcrumb" />
          <div className="skeleton skeleton-heading" />
          <div className="card-base tracking-card-skeleton">
            <div className="skeleton skeleton-badge" />
            <div className="skeleton skeleton-panel" />
            <div className="skeleton skeleton-stepper" />
            <div className="skeleton skeleton-items" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error States
  if (error) {
    const isForbidden = error.status === 403;
    const isNotFound = error.status === 404;

    return (
      <div className="tracking-page-container">
        <div className="tracking-wrapper">
          <Link to="/my-orders" className="link-subtle back-nav-link">
            <ArrowLeft size={16} />
            <span>Back to My Orders</span>
          </Link>

          <div className="card-base error-state-card" role="alert">
            {isForbidden ? (
              <>
                <div className="error-icon-wrapper forbidden-icon">
                  <ShieldAlert size={36} />
                </div>
                <h2 className="error-title">Unauthorized Order Access</h2>
                <p className="error-message">
                  Order #{orderId} belongs to another student account. For student privacy and security, order details and pickup codes are restricted to the order owner.
                </p>
                <div className="error-actions">
                  <Link to="/my-orders" className="btn-primary">
                    View My Active Orders
                  </Link>
                </div>
              </>
            ) : isNotFound ? (
              <>
                <div className="error-icon-wrapper notfound-icon">
                  <AlertTriangle size={36} />
                </div>
                <h2 className="error-title">Order #{orderId} Not Found</h2>
                <p className="error-message">
                  We could not locate this order in the canteen system. It may have expired or been removed.
                </p>
                <div className="error-actions">
                  <Link to="/my-orders" className="btn-primary">
                    Return to My Orders
                  </Link>
                  <Link to="/menu" className="btn-secondary">
                    Browse Menu
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="error-icon-wrapper server-error-icon">
                  <AlertTriangle size={36} />
                </div>
                <h2 className="error-title">Connection Issue</h2>
                <p className="error-message">
                  {error.message || 'Unable to retrieve order tracking information at this time.'}
                </p>
                <div className="error-actions">
                  <button onClick={handleManualRefresh} className="btn-primary">
                    <RefreshCw size={16} />
                    <span>Try Again</span>
                  </button>
                  <Link to="/my-orders" className="btn-secondary">
                    Back to My Orders
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData || !trackingData.order) {
    return null;
  }

  const { order, items, pickup } = trackingData;

  return (
    <div className="tracking-page-container">
      <div className="tracking-wrapper">
        {/* Top Breadcrumb & Live Refresh indicator */}
        <div className="tracking-top-bar">
          <Link to="/my-orders" className="link-subtle back-nav-link">
            <ArrowLeft size={16} />
            <span>My Orders</span>
          </Link>

          <div className="live-update-indicator">
            <button
              onClick={handleManualRefresh}
              className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
              title="Refresh order details"
              aria-label="Refresh order status"
            >
              <RefreshCw size={13} />
              <span>{isRefreshing ? 'Updating...' : 'Live auto-refresh'}</span>
            </button>
            {lastUpdated && (
              <span className="last-sync-time">
                Synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Page Heading */}
        <div className="tracking-heading-section">
          <h1 className="tracking-page-title">Track your order</h1>
          <p className="tracking-page-subtitle">
            Live status, kitchen queue estimate, and pickup details
          </p>
        </div>

        {/* Main Centered Tracking Card */}
        <div className="card-base main-tracking-card">
          {/* Header Row: Order Number & Status Badge */}
          <div className="order-meta-header">
            <div>
              <span className="order-number-tag">Order #{order.order_id}</span>
              <p className="order-placed-timestamp">
                Placed on {formatDateTime(order.order_date)}
              </p>
            </div>
            <StatusBadge status={order.status} size="large" />
          </div>

          {/* Prominent Estimated Pickup Time Panel */}
          <div className="pickup-panel-container">
            <QueueInfo
              variant="panel"
              status={order.status}
              estimatedReadyAt={order.estimated_ready_at}
              remainingMinutes={queueData?.remaining_minutes}
              estimateAvailable={queueData ? queueData.estimate_available : Boolean(order.estimated_ready_at)}
              message={queueData?.message}
            />
          </div>

          {/* Order Progress Stepper */}
          <div className="tracking-section-stepper">
            <h3 className="section-subheading">Order Progression</h3>
            <OrderStepper
              status={order.status}
              cancellationReason={order.cancellation_reason}
            />
          </div>

          {/* Pickup Instructions / Pickup Code Card */}
          <div className="tracking-section-pickup">
            <PickupCard status={order.status} pickupData={pickup} />
          </div>

          {/* Quick link to Queue Status view */}
          {['Placed', 'Preparing'].includes(order.status) && (
            <div className="queue-quick-banner">
              <div className="banner-text">
                <Clock size={16} />
                <span>Want to see where your order sits in the kitchen preparation queue?</span>
              </div>
              <Link to={`/orders/${order.order_id}/queue`} className="btn-secondary banner-btn">
                <span>View Queue Status</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Ordered Items Summary */}
          <div className="tracking-section-items">
            <div className="items-header">
              <h3 className="section-subheading">
                Ordered Items ({items.reduce((acc, curr) => acc + curr.quantity, 0)})
              </h3>
            </div>

            <div className="items-list">
              {items.map((item) => (
                <div key={item.order_item_id} className="order-item-row">
                  <div className="item-quantity-pill">{item.quantity}×</div>
                  <div className="item-details">
                    <span className="item-title">{item.item_name}</span>
                    <span className="item-unit-price">
                      {formatRupee(item.unit_price)} each
                    </span>
                  </div>
                  <div className="item-subtotal">
                    {formatRupee(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Special Instructions if present */}
            {order.special_instructions && (
              <div className="order-instructions-box">
                <span className="instructions-title">Note for Canteen:</span>
                <span className="instructions-content">"{order.special_instructions}"</span>
              </div>
            )}

            {/* Total Order Amount */}
            <div className="order-total-row">
              <span className="total-label">Total Amount Paid</span>
              <span className="total-amount">{formatRupee(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
