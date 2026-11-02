import './AdminSidebar.css'

const navItems = [
  { label: 'Dashboard', icon: '▦', group: 'OVERVIEW' },
  { label: 'Orders', icon: '▤', group: 'OPERATIONS', count: '6' },
  { label: 'Menu Management', icon: '☷', group: 'OPERATIONS' },
  { label: 'Inventory', icon: '▥', group: 'OPERATIONS', alert: true },
]

export default function AdminSidebar({ activePage, onNavigate }) {
  let currentGroup = ''
  return (
    <aside className="admin-sidebar">
      <div className="brand-lockup"><div className="brand-mark">S</div><div><div className="brand-name">SmartBite<span>.</span></div><div className="brand-caption">CAMPUS FOOD, SIMPLIFIED</div></div></div>
      <div className="sidebar-divider" />
      <nav className="sidebar-nav" aria-label="Admin navigation">
        {navItems.map((item) => {
          const showGroup = item.group !== currentGroup
          currentGroup = item.group
          return <div key={item.label}>
            {showGroup && <div className="nav-group-label">{item.group}</div>}
            <button className={`nav-item ${activePage === item.label ? 'active' : ''}`} onClick={() => onNavigate(item.label)}>
              <span className="nav-icon">{item.icon}</span><span className="nav-label">{item.label}</span>
              {item.count && <span className="nav-count">{item.count}</span>}
              {item.alert && <span className="nav-alert" />}
            </button>
          </div>
        })}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-help-icon">?</div><div><strong>Need help?</strong><span>View admin guide</span></div><span className="help-arrow">↗</span></div>
      <div className="sidebar-user"><div className="user-avatar">AM</div><div className="user-details"><strong>Admin Manager</strong><span>Administrator</span></div><span className="user-menu">•••</span></div>
    </aside>
  )
}
