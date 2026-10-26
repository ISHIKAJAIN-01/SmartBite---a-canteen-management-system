import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { UtensilsCrossed, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react';
import { getStoredUser, setAuthSession } from '../../services/api';
import { orderTrackingService } from '../../services/orderTrackingService';
import './Navbar.css';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoUsers, setDemoUsers] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getStoredUser() || {
    user_id: 1,
    name: 'Aarav Sharma',
    role: 'student',
  });

  // Load demo users on mount to enable student switcher
  useEffect(() => {
    orderTrackingService.getDemoUsers()
      .then(res => {
        if (res.users && res.users.length > 0) {
          setDemoUsers(res.users);
          // If no token exists, set default student Aarav
          if (!localStorage.getItem('smartbite_token')) {
            const defaultUser = res.users[0];
            setAuthSession(defaultUser.token, defaultUser);
            setCurrentUser(defaultUser);
          }
        }
      })
      .catch(() => {
        // Fallback demo user
        const fallback = { user_id: 1, name: 'Aarav Sharma', role: 'student' };
        setCurrentUser(fallback);
      });
  }, []);

  const handleSelectUser = (user) => {
    setAuthSession(user.token, user);
    setCurrentUser(user);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    // Reload page to refresh active queries for new user identity
    window.location.reload();
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Left: Brand / Logo */}
        <Link to="/" className="navbar-brand" aria-label="SmartBite Home">
          <div className="brand-icon-wrapper">
            <UtensilsCrossed size={22} className="brand-icon" />
          </div>
          <div className="brand-text">
            <span className="brand-title">SmartBite</span>
            <span className="brand-subtitle">Campus dining</span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <nav className="navbar-nav desktop-nav" aria-label="Main navigation">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/menu"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            Menu
          </NavLink>
          <NavLink
            to="/my-orders"
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            My Orders
          </NavLink>
        </nav>

        {/* Right: Controls & Student Account Switcher */}
        <div className="navbar-controls desktop-controls">
          <button className="icon-button" aria-label="Shopping Cart">
            <ShoppingBag size={20} />
            <span className="cart-badge">2</span>
          </button>

          {/* Account selector dropdown */}
          <div className="user-dropdown-wrapper">
            <button
              className="user-button"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              aria-expanded={userDropdownOpen}
              aria-haspopup="true"
              aria-label="User account switcher"
            >
              <div className="avatar-circle">
                <User size={16} />
              </div>
              <span className="user-name">{currentUser.name?.split(' ')[0] || 'Student'}</span>
              <ChevronDown size={14} className={`dropdown-chevron ${userDropdownOpen ? 'open' : ''}`} />
            </button>

            {userDropdownOpen && (
              <div className="user-dropdown-menu">
                <div className="dropdown-header">
                  <p className="dropdown-label">Active Account (Demo)</p>
                  <p className="dropdown-role">{currentUser.role === 'staff' ? 'Canteen Staff' : 'Student'}</p>
                </div>
                <div className="dropdown-list">
                  {demoUsers.map(u => (
                    <button
                      key={u.user_id}
                      className={`dropdown-item ${u.user_id === currentUser.user_id ? 'active' : ''}`}
                      onClick={() => handleSelectUser(u)}
                    >
                      <span className="item-name">{u.name}</span>
                      <span className="item-badge">{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu hamburger toggle */}
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Collapsible Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" role="dialog" aria-modal="true">
          <nav className="mobile-nav-links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Home
            </Link>
            <Link to="/menu" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Menu
            </Link>
            <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              My Orders
            </Link>
          </nav>
          <div className="mobile-user-section">
            <p className="mobile-section-title">Switch Student Profile:</p>
            {demoUsers.map(u => (
              <button
                key={u.user_id}
                className={`mobile-user-item ${u.user_id === currentUser.user_id ? 'active' : ''}`}
                onClick={() => handleSelectUser(u)}
              >
                {u.name} ({u.role})
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
