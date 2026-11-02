
import { useEffect, useMemo, useState } from 'react'
import MetricCard from '../../components/admin/MetricCard.jsx'
import DataTable from '../../components/admin/DataTable.jsx'
import './Dashboard.css'

const menuApiUrl = 'http://localhost:5000/api/menu'
const inventoryApiUrl = 'http://localhost:5000/api/inventory'
const ordersApiUrl = 'http://localhost:5000/api/orders'

const badge = status => (
  <span className={`status-badge status-${String(status).toLowerCase()}`}>
    {status}
  </span>
)

const columns = [
  {
    key: 'id',
    label: 'ORDER ID',
    render: r => <span className="table-primary">{r.id}</span>,
  },
  {
    key: 'student',
    label: 'STUDENT',
    render: r => (
      <>
        <span className="table-primary">{r.student}</span>
        <span className="table-secondary">{r.items}</span>
      </>
    ),
  },
  { key: 'time', label: 'TIME PLACED' },
  {
    key: 'total',
    label: 'TOTAL',
    render: r => (
      <span className="table-primary">
        ₹{Number(r.total || 0).toFixed(2).replace(/\.00$/, '')}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'STATUS',
    render: r => badge(r.status),
  },
]

function normalizeOrder(order) {
  return {
    ...order,
    id: order.id ?? order.order_code,
    student: order.student ?? order.student_name ?? 'Unknown',
    items: order.items ?? order.items_summary ?? '—',
    total: Number(order.total ?? 0),
    status: order.status ?? 'Placed',
    time: order.time ?? (
      order.created_at
        ? new Date(order.created_at).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—'
    ),
  }
}

function normalizeInventoryItem(item) {
  return {
    ...item,
    id: Number(item.id ?? item.ingredient_id),
    name: String(item.name ?? item.ingredient_name ?? 'Unnamed ingredient'),
    quantity: Number(item.quantity ?? item.quantity_on_hand ?? 0),
    threshold: Number(item.threshold ?? item.reorder_level ?? 0),
    unit: String(item.unit ?? 'pcs'),
  }
}

function getStockStatus(item) {
  if (item.quantity <= 0) return 'Out of stock'
  if (item.quantity <= item.threshold) return 'Low stock'
  return 'In stock'
}

export default function Dashboard({ onNavigate }) {
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState(false)

  const [stock, setStock] = useState([])
  const [stockLoading, setStockLoading] = useState(true)
  const [stockError, setStockError] = useState(false)

  const [menuItems, setMenuItems] = useState([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState(false)

  async function loadOrders() {
    try {
      const response = await fetch(ordersApiUrl)
      if (!response.ok) throw new Error('Orders API request failed')

      const data = await response.json()
      if (!Array.isArray(data)) throw new Error('Invalid orders response')

      setOrders(data.map(normalizeOrder))
      setOrdersError(false)
    } catch (error) {
      console.error('Could not load dashboard orders:', error)
      setOrdersError(true)
    } finally {
      setOrdersLoading(false)
    }
  }

  async function loadMenuItems() {
    try {
      const response = await fetch(menuApiUrl)
      if (!response.ok) throw new Error('Menu API request failed')

      const data = await response.json()
      const items = Array.isArray(data) ? data : data.items
      if (!Array.isArray(items)) throw new Error('Invalid menu response')

      setMenuItems(items)
      setMenuError(false)
    } catch (error) {
      console.error('Could not load dashboard menu data:', error)
      setMenuError(true)
    } finally {
      setMenuLoading(false)
    }
  }

  async function loadInventory() {
    try {
      const response = await fetch(inventoryApiUrl)
      if (!response.ok) throw new Error('Inventory API request failed')

      const data = await response.json()
      const items = Array.isArray(data) ? data : data.items
      if (!Array.isArray(items)) throw new Error('Invalid inventory response')

      setStock(items.map(normalizeInventoryItem))
      setStockError(false)
    } catch (error) {
      console.error('Could not load dashboard inventory:', error)
      setStockError(true)
    } finally {
      setStockLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    loadMenuItems()
    loadInventory()

    function onFocus() {
      loadOrders()
      loadMenuItems()
      loadInventory()
    }

    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  const pendingOrders = useMemo(
    () => orders.filter(order =>
      ['Placed', 'Preparing', 'Pending'].includes(order.status)
    ),
    [orders]
  )

  const recentOrders = useMemo(
    () => [...orders].slice(0, 4),
    [orders]
  )

  const unavailableItems = useMemo(
    () => menuItems.filter(item =>
      item.available === false ||
      item.available === 0 ||
      item.available === '0' ||
      item.is_available === false ||
      item.is_available === 0 ||
      item.is_available === '0'
    ),
    [menuItems]
  )

  const lowStock = useMemo(
    () => stock.filter(item => getStockStatus(item) === 'Low stock'),
    [stock]
  )

  const outOfStock = useMemo(
    () => stock.filter(item => getStockStatus(item) === 'Out of stock'),
    [stock]
  )

  const goTo = page => {
    if (onNavigate) onNavigate(page)
  }

  return (
    <div className="page-stack">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">SMARTBITE ADMIN</div>
          <h1>Good morning, Admin <span>✳</span></h1>
          <p>Here’s what’s happening at your canteen today.</p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => window.print()}
        >
          ↗ &nbsp; Export report
        </button>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Orders Today"
          value={ordersLoading ? '—' : String(orders.length).padStart(2, '0')}
          change={ordersError ? 'Could not refresh' : 'Live database data'}
          caption="orders in the database"
          icon="▤"
          tone="brown"
        />

        <MetricCard
          label="Pending Orders"
          value={ordersLoading ? '—' : String(pendingOrders.length).padStart(2, '0')}
          change="Needs attention"
          caption="placed or preparing"
          icon="◷"
          tone="amber"
        />

        <MetricCard
          label="Unavailable Items"
          value={
            menuLoading || menuError
              ? '—'
              : String(unavailableItems.length).padStart(2, '0')
          }
          change={menuError ? 'Could not refresh' : 'Live menu data'}
          caption="currently unavailable"
          icon="⊘"
          tone="red"
        />

        <MetricCard
          label="Low-stock Ingredients"
          value={
            stockLoading || stockError
              ? '—'
              : String(lowStock.length).padStart(2, '0')
          }
          change={
            stockLoading
              ? 'Loading inventory...'
              : stockError
                ? 'Inventory unavailable'
                : outOfStock.length
                  ? `${outOfStock.length} out of stock`
                  : 'Live inventory data'
          }
          caption="at or below reorder threshold"
          icon="▥"
          tone="green"
        />
      </div>

      <div className="dashboard-columns">
        <section className="card panel-card recent-orders">
          <div className="panel-heading">
            <div>
              <h2>Recent orders</h2>
              <p>Latest activity from your canteen</p>
            </div>
            <span className="subtle-link">Today ↗</span>
          </div>

          {ordersError ? (
            <div className="stock-alert">
              Could not load orders. Check the backend.
              <button type="button" className="stock-link dashboard-action" onClick={loadOrders}>
                Retry →
              </button>
            </div>
          ) : ordersLoading ? (
            <p className="stock-alert">Loading orders...</p>
          ) : (
            <DataTable
              columns={columns}
              rows={recentOrders}
              emptyMessage="No orders in the database yet."
            />
          )}

          <div className="panel-footer">
            <span>
              Showing {recentOrders.length} of {orders.length} orders
            </span>
            <button
              type="button"
              className="subtle-link dashboard-action"
              onClick={() => goTo('Orders')}
            >
              View all orders →
            </button>
            <button
              type="button"
              className="subtle-link dashboard-action"
              onClick={loadOrders}
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="card panel-card stock-panel">
          <div className="panel-heading">
            <div>
              <h2>Low-stock alerts</h2>
              <p>Ingredients to keep an eye on</p>
            </div>
            <span className="alert-count">
              {stockLoading || stockError ? '—' : lowStock.length}
            </span>
          </div>

          {stockLoading ? (
            <p className="stock-alert">Loading current inventory...</p>
          ) : stockError ? (
            <div className="stock-alert">
              <p>Could not load inventory. Check that the backend is running.</p>
              <button
                type="button"
                className="stock-link dashboard-action"
                onClick={loadInventory}
              >
                Retry →
              </button>
            </div>
          ) : lowStock.length === 0 ? (
            <p className="stock-alert">
              All ingredients are above their reorder thresholds.
            </p>
          ) : (
            lowStock.map(item => {
              const quantity = Number(item.quantity)
              const threshold = Number(item.threshold)
              const width = threshold > 0
                ? Math.min(100, Math.max(0, (quantity / threshold) * 100))
                : 0

              return (
                <div className="stock-alert" key={item.id}>
                  <div className="stock-line">
                    <strong>{item.name}</strong>
                    <span>{item.quantity} {item.unit}</span>
                  </div>
                  <div className="stock-threshold">
                    Threshold: {item.threshold} {item.unit}
                  </div>
                  <div className="stock-bar">
                    <span style={{ width: `${width}%` }} />
                  </div>
                </div>
              )
            })
          )}

          {!stockLoading && !stockError && outOfStock.length > 0 && (
            <p className="stock-threshold">
              Out of stock: {outOfStock.map(item => item.name).join(', ')}
            </p>
          )}

          <button
            type="button"
            className="stock-link dashboard-action"
            onClick={() => goTo('Inventory')}
          >
            Review inventory →
          </button>
        </section>
      </div>

      <section className="insight-banner">
        <div className="insight-icon">✦</div>
        <div>
          <strong>
            {stockLoading
              ? 'Checking inventory...'
              : stockError
                ? 'Inventory could not be loaded'
                : lowStock.length === 0
                  ? 'All stock levels look good'
                  : 'Inventory needs attention'}
          </strong>
          <p>
            {stockLoading
              ? 'Loading current stock levels from the database.'
              : stockError
                ? 'Please check the backend and retry loading inventory.'
                : lowStock.length === 0
                  ? 'All ingredients are currently above their reorder thresholds.'
                  : `${lowStock.length} ingredient(s) need restocking. Check quantities in Inventory to update these alerts.`}
          </p>
        </div>
      </section>
    </div>
  )
}
