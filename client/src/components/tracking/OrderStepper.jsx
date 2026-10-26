import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import './OrderStepper.css';

const STAGES = [
  { key: 'Placed', label: 'Placed', subtext: 'Order received' },
  { key: 'Preparing', label: 'Preparing', subtext: 'In the kitchen' },
  { key: 'Ready', label: 'Ready for pickup', subtext: 'Waiting at counter' },
  { key: 'Collected', label: 'Collected', subtext: 'Completed' },
];

export default function OrderStepper({ status, cancellationReason }) {
  // If cancelled, show dedicated cancellation card instead of normal progression
  if (status === 'Cancelled') {
    return (
      <div className="stepper-cancelled-card" role="region" aria-label="Order cancellation notice">
        <div className="cancelled-header">
          <div className="cancelled-icon-wrapper">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="cancelled-title">Order Cancelled</h3>
            <p className="cancelled-description">
              This order has been cancelled and cannot proceed to pickup.
            </p>
          </div>
        </div>
        {cancellationReason && (
          <div className="cancellation-reason-box">
            <span className="reason-label">Reason provided:</span>
            <span className="reason-text">"{cancellationReason}"</span>
          </div>
        )}
      </div>
    );
  }

  // Determine stage index (0 to 3)
  // Placed: index 0 is current
  // Preparing: index 0 complete, index 1 current
  // Ready: index 0,1 complete, index 2 current
  // Collected: index 0,1,2,3 complete
  let currentStageIndex = 0;
  if (status === 'Preparing') currentStageIndex = 1;
  else if (status === 'Ready') currentStageIndex = 2;
  else if (status === 'Collected') currentStageIndex = 3;

  return (
    <div className="order-stepper-root" role="region" aria-label="Order progress">
      <ol className="stepper-track">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex || (status === 'Collected' && idx === 3);
          const isCurrent = idx === currentStageIndex && status !== 'Collected';
          const isFuture = idx > currentStageIndex;

          let stepClass = 'step-future';
          if (isCompleted) stepClass = 'step-completed';
          else if (isCurrent) stepClass = 'step-current';

          return (
            <li key={stage.key} className={`stepper-item ${stepClass}`}>
              {/* Connector line (before each step except first) */}
              {idx > 0 && (
                <div
                  className={`stepper-connector ${
                    idx <= currentStageIndex || status === 'Collected' ? 'connector-completed' : 'connector-future'
                  }`}
                  aria-hidden="true"
                />
              )}

              <div className="stepper-node-wrapper">
                <div className="stepper-node" aria-current={isCurrent ? 'step' : undefined}>
                  {isCompleted ? (
                    <Check size={16} strokeWidth={2.8} className="node-check-icon" />
                  ) : (
                    <span className="node-number">{idx + 1}</span>
                  )}
                </div>

                <div className="stepper-label-wrapper">
                  <span className="stepper-label">{stage.label}</span>
                  <span className="stepper-subtext">{stage.subtext}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
