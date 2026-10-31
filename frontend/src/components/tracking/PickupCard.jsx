import React from 'react';
import { Sparkles, CheckCircle2, Clock, Info } from 'lucide-react';
import './PickupCard.css';

export default function PickupCard({ status, pickupData }) {
  // 1. Cancelled Status: No pickup flow
  if (status === 'Cancelled') {
    return null;
  }

  // 2. Ready Status: High-visibility pickup code and counter instructions
  if (status === 'Ready') {
    const pickupCode = pickupData?.pickup_code || '—';
    const instructions = pickupData?.instructions || 'Please collect your order from Counter 2.';

    return (
      <div className="pickup-card ready-card" role="region" aria-label="Order pickup instructions">
        <div className="pickup-header">
          <div className="pickup-badge-pill">
            <Sparkles size={16} />
            <span>Ready for Counter Collection</span>
          </div>
          <h3 className="pickup-main-title">Your order is ready!</h3>
          <p className="pickup-subtitle">
            Please present this code to the counter staff to pick up your tray.
          </p>
        </div>

        {/* Highlighted Pickup Code Box */}
        <div className="pickup-code-box">
          <span className="code-label">Pickup Code</span>
          <div className="code-value" aria-label={`Pickup code is ${pickupCode}`}>
            {pickupCode}
          </div>
        </div>

        {/* Counter Instructions */}
        <div className="pickup-instructions-box">
          <Info size={18} className="instructions-icon" />
          <p className="instructions-text">{instructions}</p>
        </div>
      </div>
    );
  }

  // 3. Collected Status: Completed pickup acknowledgement
  if (status === 'Collected') {
    return (
      <div className="pickup-card collected-card" role="region" aria-label="Collected order confirmation">
        <div className="collected-icon-wrapper">
          <CheckCircle2 size={24} />
        </div>
        <div className="collected-text-content">
          <h4 className="collected-title">Order Collected</h4>
          <p className="collected-message">
            This order has already been picked up. We hope you enjoy your meal!
          </p>
        </div>
      </div>
    );
  }

  // 4. Placed or Preparing Status: Neutral pending pickup notice
  return (
    <div className="pickup-card pending-card" role="region" aria-label="Pending pickup notice">
      <div className="pending-icon-wrapper">
        <Clock size={20} />
      </div>
      <div className="pending-content">
        <h4 className="pending-title">Pickup Code Pending</h4>
        <p className="pending-message">
          Your unique 4-digit pickup code and counter collection instructions will be unlocked right here as soon as the kitchen marks your order as ready.
        </p>
      </div>
    </div>
  );
}
