import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Phone, Mail, UtensilsCrossed } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-root">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Col 1: Brand & Description */}
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <div className="footer-brand-icon">
                <UtensilsCrossed size={18} />
              </div>
              <span className="footer-brand-name">SmartBite</span>
            </div>
            <p className="footer-description">
              The modern college canteen food-ordering platform. Skip the counter rush, track your order progress in real-time, and pick up your meals hassle-free.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/menu">Canteen Menu</Link></li>
              <li><Link to="/my-orders">My Orders</Link></li>
              <li><a href="#help">Campus Dining Guidelines</a></li>
            </ul>
          </div>

          {/* Col 3: Canteen Hours & Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Canteen Hours & Help</h4>
            <div className="footer-contact-item">
              <Clock size={16} className="contact-icon" />
              <span>8:00 AM – 7:30 PM (Mon to Sat)</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={16} className="contact-icon" />
              <span>+91 98765 43210</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} className="contact-icon" />
              <span>support@smartbite.college.edu</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} SmartBite Campus Dining. All rights reserved.</p>
          <p className="footer-subtext">Member 3: Order Tracking & Queue Status Module</p>
        </div>
      </div>
    </footer>
  );
}
