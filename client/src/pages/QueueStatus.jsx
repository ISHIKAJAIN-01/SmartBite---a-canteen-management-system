import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, RefreshCw, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { orderTrackingService } from '../services/orderTrackingService';
import StatusBadge from '../components/tracking/StatusBadge';
import QueueInfo from '../components/tracking/QueueInfo';
import './QueueStatus.css';

export default function QueueStatus() {
  const { orderId } = useParams();

  const [queueData, setQueueData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const pollingTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  const fetchQueue = useCallback(async (isBackground = false) => {
    if (!orderId) return;

    if (isBackground) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      const data = await orderTrackingService.getOrderQueue(orderId);
      if (!isMountedRef.current) return;

      setQueueData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (!isMountedRef.current) return;
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

  useEffect(() => {
    isMountedRef.current = true;
    fetchQueue(false);

    pollingTimerRef.current = setInterval(() => {
      fetchQueue(true);
    }, 12000);

    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current);
      }
    };
  }, [fetchQueue]);

  if (isLoading) {
    return (
      <div className="queue-page-container">
        <div className="queue-page-wrapper">
          <div className="skeleton skeleton-breadcrumb" />
          <div className="skeleton skeleton-heading" />
          <div className="card-base queue-card-skeleton">
            <div className="skeleton skeleton-panel" />
            <div className="skeleton skeleton-items" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="queue-page-container">
        <div className="queue-page-wrapper">
          <Link to={`/orders/${orderId}/tracking`} className="link-subtle back-nav-link">
            <ArrowLeft size={16} />
            <span>Return to Order Tracking</span>
          </Link>

          <div className="card-base queue-error-card" role="alert">
            <AlertCircle size={36} className="queue-error-icon" />
            <h2 className="error-title">Unable to Load Queue Status</h2>
            <p className="error-message">
              {error.message || 'Could not retrieve real-time kitchen queue metrics.'}
            </p>
            <div className="error-actions">
              <button onClick={() => fetchQueue(false)} className="btn-primary">
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
              <Link to={`/orders/${orderId}/tracking`} className="btn-secondary">
                Back to Tracking
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!queueData) return null;

  return (
    <div className="queue-page-container">
      <div className="queue-page-wrapper">
        {/* Navigation Breadcrumbs */}
        <div className="queue-top-nav">
          <div className="breadcrumbs">
            <Link to="/my-orders" className="breadcrumb-item">My Orders</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to={`/orders/${orderId}/tracking`} className="breadcrumb-item">Order #{orderId}</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Queue Status</span>
          </div>

          <button
            onClick={() => fetchQueue(true)}
            className={`refresh-pill ${isRefreshing ? 'refreshing' : ''}`}
            aria-label="Refresh queue metrics"
          >
            <RefreshCw size={12} />
            <span>{isRefreshing ? 'Refreshing...' : 'Live auto-refresh'}</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="queue-header-section">
          <h1 className="queue-title">Kitchen Queue Status</h1>
          <p className="queue-subtitle">
            Order #{queueData.order_id} • Status and kitchen workload breakdown
          </p>
        </div>

        {/* Main Queue Card */}
        <div className="card-base main-queue-card">
          <div className="queue-order-summary">
            <div>
              <span className="queue-order-tag">Order #{queueData.order_id}</span>
              <p className="queue-sync-note">
                {lastUpdated ? `Live synced at ${lastUpdated.toLocaleTimeString()}` : ''}
              </p>
            </div>
            <StatusBadge status={queueData.status} size="large" />
          </div>

          {/* Queue Info Component (Light Card Variant) */}
          <QueueInfo
            variant="card"
            status={queueData.status}
            queuePosition={queueData.queue_position}
            estimatedReadyAt={queueData.estimated_ready_at}
            remainingMinutes={queueData.remaining_minutes}
            estimateAvailable={queueData.estimate_available}
            message={queueData.message}
          />

          {/* Detailed Queue Explanation Box */}
          <div className="queue-explanation-box">
            <h4 className="explanation-title">How Canteen Queue Estimates Work</h4>
            <ul className="explanation-list">
              <li>
                <strong>Active Workload:</strong> Estimates are calculated directly from orders currently being prepared in the kitchen, excluding cancelled or already collected orders.
              </li>
              <li>
                <strong>Item Prep Time:</strong> Preparation durations are computed from the specific menu items in your basket and their cooking times.
              </li>
              <li>
                <strong>Kitchen Batching:</strong> Orders for similar items (e.g. sandwiches or beverages) may be prepared concurrently at separate kitchen stations.
              </li>
            </ul>
          </div>

          {/* Action Navigation Buttons */}
          <div className="queue-actions-row">
            <Link to={`/orders/${queueData.order_id}/tracking`} className="btn-primary">
              <ArrowLeft size={16} />
              <span>Back to Order Tracking</span>
            </Link>
            <Link to="/my-orders" className="btn-secondary">
              <span>View All My Orders</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
