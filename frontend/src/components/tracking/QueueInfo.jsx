import React from 'react';
import { Clock, Users, AlertCircle, CheckCircle, Info } from 'lucide-react';
import './QueueInfo.css';

/**
 * Formats an ISO date string to user's local time (e.g. 10:45 AM)
 */
function formatLocalTime(isoString) {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return null;
  }
}

export default function QueueInfo({
  status,
  queuePosition,
  estimatedReadyAt,
  remainingMinutes,
  estimateAvailable = true,
  message,
  variant = 'panel', // 'panel' (espresso dark) or 'card' (light card for queue page)
}) {
  const formattedTime = formatLocalTime(estimatedReadyAt);

  // Status specific messages
  const defaultMessages = {
    Placed: 'Your order is in the queue.',
    Preparing: 'The canteen is preparing your order.',
    Ready: 'Your order is ready. Please collect it from the counter.',
    Collected: 'Your order has been collected.',
    Cancelled: 'This order has been cancelled.',
  };

  const displayMessage = message || defaultMessages[status] || 'Live canteen queue update';

  // 1. Cancelled Order State
  if (status === 'Cancelled') {
    return (
      <div className={`queue-info-root variant-${variant} state-cancelled`}>
        <div className="queue-status-message">
          <AlertCircle size={18} className="status-msg-icon text-cancelled" />
          <span>{displayMessage}</span>
        </div>
      </div>
    );
  }

  // 2. Ready or Collected Order State
  if (status === 'Ready' || status === 'Collected') {
    return (
      <div className={`queue-info-root variant-${variant} state-ready`}>
        <div className="queue-status-message">
          <CheckCircle size={18} className="status-msg-icon text-ready" />
          <span>{displayMessage}</span>
        </div>
      </div>
    );
  }

  // 3. Active Order (Placed / Preparing) with Estimate Unavailable
  if (!estimateAvailable) {
    return (
      <div className={`queue-info-root variant-${variant} state-unavailable`}>
        <div className="queue-status-message">
          <Info size={18} className="status-msg-icon" />
          <span>Pickup estimate unavailable</span>
        </div>
        <p className="queue-disclaimer">
          The kitchen has received your order and is processing it shortly.
        </p>
      </div>
    );
  }

  // 4. Active Order with Estimate & Queue Details
  return (
    <div className={`queue-info-root variant-${variant}`} role="region" aria-label="Estimated pickup and queue status">
      {/* Status message header */}
      <div className="queue-status-message">
        <Clock size={16} className="status-msg-icon" />
        <span>{displayMessage}</span>
      </div>

      {/* Metrics Row */}
      <div className="queue-metrics-grid">
        {/* Estimated Ready Time */}
        <div className="metric-box">
          <span className="metric-label">Estimated Ready Time</span>
          <div className="metric-value">
            {formattedTime || 'Unavailable'}
          </div>
        </div>

        {/* Remaining Waiting Duration */}
        {remainingMinutes !== null && remainingMinutes !== undefined && (
          <div className="metric-box">
            <span className="metric-label">Estimated Wait</span>
            <div className="metric-value">
              ~{remainingMinutes} min{remainingMinutes === 1 ? '' : 's'}
            </div>
          </div>
        )}

        {/* Queue Position (Only shown if verified positive integer from backend) */}
        {typeof queuePosition === 'number' && queuePosition > 0 && (
          <div className="metric-box">
            <span className="metric-label">Queue Position</span>
            <div className="metric-value metric-position">
              <Users size={18} className="position-icon" />
              <span>#{queuePosition} in line</span>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="queue-disclaimer">
        <Info size={13} className="disclaimer-icon" />
        <span>Calculated estimate based on active canteen workload, not an exact guarantee.</span>
      </div>
    </div>
  );
}
