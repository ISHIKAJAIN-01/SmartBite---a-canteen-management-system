import AdminSidebar from './AdminSidebar.jsx'
import './AdminLayout.css'

export default function AdminLayout({ activePage, onNavigate, children }) {
  return (
    <div className="admin-shell">
      <AdminSidebar activePage={activePage} onNavigate={onNavigate} />
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="breadcrumb"><span>SmartBite</span><span className="breadcrumb-sep">/</span><strong>Admin Panel</strong></div>
          <div className="topbar-right"><span className="live-dot" /> <span>Campus Canteen</span><div className="avatar">AD</div></div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}
