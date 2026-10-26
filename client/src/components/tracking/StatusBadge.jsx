import React from 'react';
import { CheckCircle2, Clock, ChefHat, Check, XCircle } from 'lucide-react';
import './StatusBadge.css';

/**
 * Maps database status to UI label, colors, and outlined Lucide icon
 */
const STATUS_CONFIG = {
  Placed: {
    label: 'Order placed',
    className: 'badge-placed',
    icon: Clock,
  },
  Preparing: {
    label: 'Preparing your order',
    className: 'badge-preparing',
    icon: ChefHat,
  },
  Ready: {
    label: 'Ready for pickup',
    className: 'badge-ready',
    icon: CheckCircle2,
  },
  Collected: {
    label: 'Collected',
    className: 'badge-collected',
    icon: Check,
  },
  Cancelled: {
    label: 'Order cancelled',
    className: 'badge-cancelled',
    icon: XCircle,
  },
};

export default function StatusBadge({ status, size = 'medium' }) {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    className: 'badge-placed',
    icon: Clock,
  };

  const IconComponent = config.icon;

  return (
    <span className={`status-badge ${config.className} badge-${size}`} role="status">
      <IconComponent size={size === 'large' ? 16 : 14} className="badge-icon" />
      <span className="badge-text">{config.label}</span>
    </span>
  );
}
