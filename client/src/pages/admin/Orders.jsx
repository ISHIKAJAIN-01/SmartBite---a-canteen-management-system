
import { useEffect, useMemo, useState } from 'react'
import DataTable from '../../components/admin/DataTable.jsx'
import './Orders.css'

const API_URL = 'http://localhost:5000/api/orders'

const nextStatus = {
  Placed: 'Preparing',
  Preparing: 'Ready',
  Ready: 'Collected',
  Collected: 'Collected',
  Cancelled: 'Cancelled',
}

function getItemCount(items) {
  if (!items) return 0
  return String(items).split(',').filter(Boolean).length
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const statuses = [
    'All',
    'Placed',
    'Preparing',
    'Ready',
    'Collected',
    'Cancelled',
  ]

  async function loadOrders() {
    try {
      setLoading(true)
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Orders load nahi hue.')

      const data = await response.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      setNotice('Orders load nahi hue. Backend server check karo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const filtered = useMemo(
    () =>
      orders.filter(
        (order) =>
          (filter === 'All' || order.status === filter) &&
          `${order.id} ${order.student} ${order.items}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [orders, filter, search]
  )

  async function advance(id) {
    const target = orders.find((order) => order.id === id)
    if (!target || !nextStatus[target.status] || target.status === 'Collected' || target.status === 'Cancelled') {
      return
    }

    const status = nextStatus[target.status]
    setUpdatingId(id)
    setNotice('')

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      )

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Status update nahi hua.')
      }

      setOrders((previous) =>
        previous.map((order) => (order.id === id ? result : order))
      )
      setNotice(`${id} ka status ${status} ho gaya aur database mein save ho gaya.`)
    } catch (error) {
      setNotice(error.message || 'Status update nahi hua. Dobara try karo.')
    } finally {
      setUpdatingId(null)
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'ORDER / STUDENT',
      render: (row) => (
        <>
          <span className="table-primary">{row.id}</span>
          <span className="table-secondary">{row.student}</span>
        </>
      ),
    },
    { key: 'time', label: 'TIME PLACED' },
    {
      key: 'items',
      label: 'ITEMS',
      render: (row) => <span className="order-items">{row.items}</span>,
    },
    {
      key: 'total',
      label: 'TOTAL',
      render: (row) => (
        <span className="table-primary">
          ₹{Number(row.total).toFixed(2).replace(/\.00$/, '')}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      render: (row) => (
        <span className={`status-badge status-${row.status.toLowerCase()}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'ACTION',
      render: (row) => (
        <button
          className="table-action"
          disabled={
            row.status === 'Collected' ||
            row.status === 'Cancelled' ||
            updatingId === row.id
          }
          onClick={() => advance(row.id)}
        >
          {updatingId === row.id
            ? 'Saving...'
            : row.status === 'Collected' || row.status === 'Cancelled'
              ? 'Completed'
              : `Mark ${nextStatus[row.status]}`}
        </button>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">ORDER OPERATIONS</div>
          <h1>Orders</h1>
          <p>Review incoming orders and keep pickups moving smoothly.</p>
        </div>
        <div className="orders-total">
          <strong>{orders.length}</strong>
          <span>database orders</span>
        </div>
      </div>

      {notice && <div className="notice-success">✓ {notice}</div>}

      <section className="card orders-panel">
        <div className="orders-toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              className="form-control"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order ID, student or item..."
            />
          </div>

          <select
            className="form-control status-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter by status"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p>Orders load ho rahe hain...</p>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            emptyMessage="Database mein orders nahi hain ya search se match nahi hua."
          />
        )}

        <div className="panel-footer">
          <span>
            Showing {filtered.length} of {orders.length} database orders
          </span>
          <button type="button" className="table-action" onClick={loadOrders}>
            Refresh
          </button>
        </div>
      </section>
    </div>
  )
}
