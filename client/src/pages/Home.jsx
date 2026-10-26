import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-wrapper">
        {/* Hero Section */}
        <div className="card-base home-hero-card">
          <div className="hero-pill">
            <Sparkles size={14} />
            <span>SmartBite Campus Dining</span>
          </div>
          <h1 className="hero-title">
            Smart Food Ordering & Live Queue Tracking
          </h1>
          <p className="hero-description">
            Never wait in long canteen queues again. Order your favorite campus meals, monitor preparation milestones in real time, and pick up when your code is called.
          </p>
          <div className="hero-actions">
            <Link to="/my-orders" className="btn-primary hero-btn">
              <span>View My Active Orders</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/orders/101/tracking" className="btn-secondary hero-btn">
              <span>Live Order Tracking Demo (#101)</span>
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="features-grid">
          <div className="card-base feature-card">
            <div className="feature-icon-circle">
              <Clock size={24} />
            </div>
            <h3 className="feature-title">Live Kitchen Queue Tracking</h3>
            <p className="feature-desc">
              Accurate FIFO position calculation based on real orders ahead of you and item preparation times.
            </p>
            <Link to="/orders/101/queue" className="link-subtle feature-link">
              <span>Explore Queue Status</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-base feature-card">
            <div className="feature-icon-circle">
              <UtensilsCrossed size={24} />
            </div>
            <h3 className="feature-title">Order Progress Stepper</h3>
            <p className="feature-desc">
              Follow every stage from Placed to Preparing, Ready for pickup, and Collected with responsive visual feedback.
            </p>
            <Link to="/orders/101/tracking" className="link-subtle feature-link">
              <span>See Order Progression</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-base feature-card">
            <div className="feature-icon-circle">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-title">Secure Pickup Verification</h3>
            <p className="feature-desc">
              Authenticated pickup codes and counter guidance retrieved securely from the database when ready.
            </p>
            <Link to="/orders/102/tracking" className="link-subtle feature-link">
              <span>Test Ready Pickup (#102)</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
