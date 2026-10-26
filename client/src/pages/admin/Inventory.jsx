
import { useEffect, useMemo, useState } from 'react'
import DataTable from '../../components/admin/DataTable.jsx'
import './Inventory.css'

const categories = [
  'Dairy',
  'Bakery',
  'Produce',
  'Coffee & Tea',
  'Pantry',
  'Other',
]

const units = ['kg', 'g', 'L', 'ml', 'pcs']

const emptyForm = {
  name: '',
  category: 'Dairy',
  quantity: '0',
  unit: 'kg',
  threshold: '5',
}

const API_URL = 'http://localhost:5000/api/inventory'

function getCategory(name = '') {
  const value = String(name ?? '').toLowerCase()

  if (['milk', 'paneer', 'cheese', 'butter', 'curd'].some(x => value.includes(x))) {
    return 'Dairy'
  }
  if (['bun', 'bread'].some(x => value.includes(x))) return 'Bakery'
  if (['tomato', 'potato', 'onion', 'vegetable'].some(x => value.includes(x))) {
    return 'Produce'
  }
  if (['coffee', 'tea'].some(x => value.includes(x))) return 'Coffee & Tea'
  if (['oil', 'salt', 'sugar', 'flour', 'spice'].some(x => value.includes(x))) {
    return 'Pantry'
  }

  return 'Other'
}

function getStatus(item) {
  if (item.quantity <= 0) return 'Out of stock'
  if (item.quantity <= item.threshold) return 'Low stock'
  return 'In stock'
}

function normalizeItem(item) {
  const name = String(item.name ?? item.ingredient_name ?? '')
  const id = Number(item.id ?? item.ingredient_id)
  const quantity = Number(item.quantity ?? item.quantity_on_hand ?? 0)
  const threshold = Number(item.threshold ?? item.reorder_level ?? 0)

  return {
    ...item,
    id,
    name,
    category: item.category || getCategory(name),
    quantity,
    threshold,
    unit: String(item.unit ?? 'pcs'),
  }
}

export default function Inventory() {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  async function loadInventory() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(API_URL)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not load inventory.')
      }

      if (!Array.isArray(data)) {
        throw new Error('Invalid inventory response from server.')
      }

      const normalized = data.map(normalizeItem)

      if (normalized.some(item => !Number.isFinite(item.id) || !item.name)) {
        throw new Error('Inventory API returned an item with missing ID or name.')
      }

      setStock(normalized)
    } catch (err) {
      setError(
        `${err.message}. Check the backend and /api/inventory response.`
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const filtered = useMemo(
    () =>
      stock.filter(item => {
        const matchesFilter =
          filter === 'All' || getStatus(item) === filter

        const searchText = `${item.name} ${item.category}`.toLowerCase()
        const matchesSearch = searchText.includes(search.toLowerCase().trim())

        return matchesFilter && matchesSearch
      }),
    [stock, filter, search]
  )

  const low = stock.filter(
    item => item.quantity > 0 && item.quantity <= item.threshold
  ).length

  const out = stock.filter(item => item.quantity <= 0).length

  function closeModal() {
    if (saving) return
    setModal(null)
    setError('')
  }

  function openAdd() {
    setForm({ ...emptyForm })
    setError('')
    setNotice('')
    setModal({ type: 'add' })
  }

  function openEdit(item) {
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      threshold: String(item.threshold),
    })
    setError('')
    setNotice('')
    setModal({ type: 'edit', id: item.id })
  }

  function openDelete(item) {
    setError('')
    setNotice('')
    setModal({ type: 'delete', item })
  }

  function updateField(field, value) {
    setForm(previous => ({ ...previous, [field]: value }))
  }

  async function saveIngredient(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    const name = form.name.trim()
    const quantity = Number(form.quantity)
    const threshold = Number(form.threshold)

    if (!name) {
      setError('Please enter an ingredient name.')
      return
    }

    if (
      form.quantity.trim() === '' ||
      form.threshold.trim() === '' ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(threshold) ||
      quantity < 0 ||
      threshold < 0
    ) {
      setError('Enter valid quantities. Values cannot be negative.')
      return
    }

    if (name.length > 120) {
      setError('Ingredient name must be 120 characters or fewer.')
      return
    }

    const duplicate = stock.some(
      item =>
        item.name.toLowerCase() === name.toLowerCase() &&
        item.id !== modal?.id
    )

    if (duplicate) {
      setError('An ingredient with this name already exists.')
      return
    }

    setSaving(true)

    try {
      const isAdd = modal.type === 'add'
      const url = isAdd ? API_URL : `${API_URL}/${modal.id}`

      const response = await fetch(url, {
        method: isAdd ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          quantity,
          unit: form.unit,
          threshold,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not save ingredient.')
      }

      await loadInventory()

      setNotice(
        isAdd
          ? `${name} added to inventory.`
          : `${name} updated successfully.`
      )
      setSearch('')
      setFilter('All')
      setModal(null)
      setError('')
    } catch (err) {
      setError(err.message || 'Could not save ingredient.')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!modal?.item) return

    const item = modal.item
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(`${API_URL}/${item.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete ingredient.')
      }

      await loadInventory()
      setNotice(`${item.name} removed from active inventory.`)
      setModal(null)
      setError('')
    } catch (err) {
      setError(err.message || 'Could not delete ingredient.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'INGREDIENT',
      render: item => (
        <>
          <span className="ingredient-mark">
            {item.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="table-primary">{item.name}</span>
          <span className="table-secondary">{item.category}</span>
        </>
      ),
    },
    {
      key: 'quantity',
      label: 'CURRENT STOCK',
      render: item => (
        <span className="table-primary">
          {item.quantity} {item.unit}
        </span>
      ),
    },
    {
      key: 'threshold',
      label: 'REORDER THRESHOLD',
      render: item => (
        <span>{item.threshold} {item.unit}</span>
      ),
    },
    {
      key: 'status',
      label: 'STOCK STATUS',
      render: item => {
        const status = getStatus(item)
        const statusClass =
          status === 'In stock'
            ? 'status-available'
            : status === 'Low stock'
              ? 'status-low'
              : 'status-out'

        return (
          <span className={`status-badge ${statusClass}`}>
            {status}
          </span>
        )
      },
    },
    {
      key: 'action',
      label: 'ACTIONS',
      render: item => (
        <div className="inventory-row-actions">
          <button
            type="button"
            className="table-action"
            onClick={() => openEdit(item)}
          >
            Edit
          </button>
          <button
            type="button"
            className="inventory-delete-button"
            onClick={() => openDelete(item)}
            aria-label={`Delete ${item.name}`}
          >
            Delete
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-stack">
      <div className="page-heading-row inventory-heading">
        <div>
          <div className="eyebrow">STOCK & INGREDIENTS</div>
          <h1>Inventory</h1>
          <p>
            Track ingredient quantities and identify items that need restocking.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary inventory-add-button"
          onClick={openAdd}
        >
          <span aria-hidden="true">+</span> Add Ingredient
        </button>
      </div>

      <div className="inventory-summary">
        <span>
          <i className="summary-dot low-dot" /> {low} low stock
        </span>
        <span>
          <i className="summary-dot out-dot" /> {out} out of stock
        </span>
      </div>

      {notice && (
        <div className="notice-success" role="status">
          {notice}
          <button
            type="button"
            className="notice-dismiss"
            onClick={() => setNotice('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {error && !modal && (
        <div className="inventory-form-error" role="alert">
          {error}
          <button type="button" onClick={loadInventory}>
            Retry
          </button>
        </div>
      )}

      <section className="card inventory-panel">
        <div className="inventory-toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              className="form-control"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search ingredients..."
              aria-label="Search ingredients"
            />
          </div>

          <select
            className="form-control status-filter"
            value={filter}
            onChange={event => setFilter(event.target.value)}
            aria-label="Filter stock status"
          >
            {['All', 'In stock', 'Low stock', 'Out of stock'].map(status => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p role="status">Loading inventory from database...</p>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            emptyMessage="No ingredients match your search."
          />
        )}

        <div className="panel-footer">
          <span>{filtered.length} ingredients shown</span>
          <span>Inventory synced with MySQL</span>
        </div>
      </section>

      {modal && (
        <div
          className="inventory-modal-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          {modal.type === 'delete' ? (
            <div
              className="card inventory-edit-modal inventory-delete-modal"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="inventory-delete-title"
              onMouseDown={event => event.stopPropagation()}
            >
              <div className="inventory-modal-heading">
                <div className="inventory-delete-icon">
                  <span aria-hidden="true">!</span>
                </div>
                <button
                  type="button"
                  className="inventory-modal-close"
                  onClick={closeModal}
                  aria-label="Close confirmation"
                  disabled={saving}
                >
                  ×
                </button>
              </div>

              <h2 id="inventory-delete-title">Delete ingredient?</h2>
              <p className="inventory-delete-description">
                Are you sure you want to remove{' '}
                <strong>{modal.item.name}</strong> from active inventory?
                The inventory record will be removed, but transaction history
                is preserved.
              </p>

              {error && (
                <p className="inventory-form-error" role="alert">{error}</p>
              )}

              <div className="inventory-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inventory-confirm-delete"
                  onClick={confirmDelete}
                  disabled={saving}
                >
                  {saving ? 'Deleting...' : 'Delete ingredient'}
                </button>
              </div>
            </div>
          ) : (
            <form
              className="card inventory-edit-modal"
              onSubmit={saveIngredient}
              onMouseDown={event => event.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="inventory-modal-title"
            >
              <div className="inventory-modal-heading">
                <div>
                  <div className="eyebrow">INVENTORY MANAGEMENT</div>
                  <h2 id="inventory-modal-title">
                    {modal.type === 'add'
                      ? 'Add ingredient'
                      : `Edit ${form.name}`}
                  </h2>
                  <p>
                    {modal.type === 'add'
                      ? 'Add a new ingredient to your stock.'
                      : 'Update this ingredient’s details and stock levels.'}
                  </p>
                </div>

                <button
                  type="button"
                  className="inventory-modal-close"
                  onClick={closeModal}
                  aria-label="Close popup"
                  disabled={saving}
                >
                  ×
                </button>
              </div>

              <div className="inventory-edit-fields">
                <label className="inventory-field-full">
                  Ingredient name
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={event => updateField('name', event.target.value)}
                    placeholder="e.g. Coffee beans"
                    maxLength={120}
                    required
                    autoFocus
                  />
                </label>

                <label>
                  Category
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={event =>
                      updateField('category', event.target.value)
                    }
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Unit
                  <select
                    className="form-control"
                    value={form.unit}
                    onChange={event => updateField('unit', event.target.value)}
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Current quantity ({form.unit})
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    step="any"
                    value={form.quantity}
                    onChange={event =>
                      updateField('quantity', event.target.value)
                    }
                    required
                  />
                </label>

                <label>
                  Reorder threshold ({form.unit})
                  <input
                    className="form-control"
                    type="number"
                    min="0"
                    step="any"
                    value={form.threshold}
                    onChange={event =>
                      updateField('threshold', event.target.value)
                    }
                    required
                  />
                </label>
              </div>

              {error && (
                <p className="inventory-form-error" role="alert">
                  {error}
                </p>
              )}

              <div className="inventory-modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving...'
                    : modal.type === 'add'
                      ? 'Add Ingredient'
                      : 'Save changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
