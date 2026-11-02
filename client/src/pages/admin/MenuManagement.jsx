
import { useEffect, useMemo, useState } from 'react'
import DataTable from '../../components/admin/DataTable.jsx'
import './MenuManagement.css'

const API_URL = 'http://localhost:5000/api/menu'

const emptyForm = {
  name: '',
  description: '',
  category: 'Snacks',
  price: '',
  imageUrl: '',
  tag: 'Vegetarian',
}

const categoryOptions = [
  'Snacks',
  'Burgers',
  'Wraps',
  'Beverages',
  'South Indian',
  'Mains',
  'Desserts',
]

const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Contains egg',
  'Non-vegetarian',
]

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`
    )
  }

  return data
}

function normalizeItem(item) {
  return {
    ...item,
    id: item.id,
    name: item.name || '',
    description: item.description || '',
    category: item.category || 'Snacks',
    price: Number(item.price) || 0,
    imageUrl: item.imageUrl || '',
    available: Boolean(item.available),
    tag:
      item.tag ||
      (item.isVegetarian ? 'Vegetarian' : 'Non-vegetarian'),
  }
}

function toApiPayload(item) {
  return {
    name: item.name,
    description: item.description,
    category: item.category,
    price: Number(item.price),
    tag: item.tag,
    isVegetarian: ['Vegetarian', 'Vegan'].includes(item.tag),
    available: item.available,
  }
}

export default function MenuManagement() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [availabilityFilter, setAvailabilityFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [actionId, setActionId] = useState(null)

  async function loadItems() {
    setLoading(true)
    setError('')

    try {
      const data = await apiRequest(API_URL)
      const list = Array.isArray(data) ? data : data.items

      if (!Array.isArray(list)) {
        throw new Error('Unexpected menu API response format.')
      }

      setItems(list.map(normalizeItem))
    } catch (err) {
      setError(
        `${err.message}. Check that the backend is running at localhost:5000.`
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const categories = [
    'All',
    ...new Set([...categoryOptions, ...items.map(item => item.category)]),
  ].filter((value, index, array) => array.indexOf(value) === index)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    return items.filter(item => {
      const matchesCategory =
        category === 'All' || item.category === category

      const matchesAvailability =
        availabilityFilter === 'All' ||
        (availabilityFilter === 'Available' && item.available) ||
        (availabilityFilter === 'Unavailable' && !item.available)

      const searchableText =
        `${item.name} ${item.category} ${item.description} ${item.tag}`.toLowerCase()

      return (
        matchesCategory &&
        matchesAvailability &&
        searchableText.includes(query)
      )
    })
  }, [items, category, availabilityFilter, search])

  function openAddForm() {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setNotice('')
    setShowForm(true)
  }

  function openEditForm(item) {
    setForm({
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: String(item.price),
      imageUrl: item.imageUrl || '',
      tag: item.tag || 'Vegetarian',
    })

    setEditingId(item.id)
    setError('')
    setNotice('')
    setShowForm(true)
  }

  function closeForm() {
    if (saving) return
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  function updateField(field, value) {
    setForm(previous => ({ ...previous, [field]: value }))
  }

  async function saveItem(event) {
    event.preventDefault()
    setError('')
    setNotice('')

    const name = form.name.trim()
    const description = form.description.trim()
    const price = Number(form.price)
    const imageUrl = form.imageUrl.trim()

    if (!name) {
      setError('Please enter the menu item name.')
      return
    }

    if (!Number.isFinite(price) || price <= 0 || price > 100000) {
      setError('Price must be greater than ₹0 and no more than ₹1,00,000.')
      return
    }

    if (imageUrl && !/^https?:\/\/\S+$/i.test(imageUrl)) {
      setError('Please enter a valid image URL starting with http:// or https://.')
      return
    }

    const duplicate = items.some(
      item =>
        String(item.id) !== String(editingId) &&
        item.name.trim().toLowerCase() === name.toLowerCase()
    )

    if (duplicate) {
      setError('A menu item with this name already exists.')
      return
    }

    const itemData = {
      name,
      description,
      category: form.category,
      price,
      tag: form.tag,
      available: editingId === null
        ? true
        : items.find(item => String(item.id) === String(editingId))?.available ?? true,
    }

    setSaving(true)

    try {
      if (editingId !== null) {
        await apiRequest(`${API_URL}/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(toApiPayload(itemData)),
        })

        setNotice(`${name} updated successfully in the database.`)
      } else {
        await apiRequest(API_URL, {
          method: 'POST',
          body: JSON.stringify(toApiPayload(itemData)),
        })

        setNotice(`${name} added successfully to the database.`)
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await loadItems()
    } catch (err) {
      setError(err.message || 'Could not save the menu item.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailability(item) {
    const nextAvailable = !item.available
    setError('')
    setNotice('')
    setActionId(item.id)

    try {
      await apiRequest(`${API_URL}/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify(
          toApiPayload({ ...item, available: nextAvailable })
        ),
      })

      setNotice(
        `${item.name} marked ${nextAvailable ? 'Available' : 'Unavailable'}.`
      )

      await loadItems()
    } catch (err) {
      setError(err.message || 'Could not update availability.')
    } finally {
      setActionId(null)
    }
  }

  function deleteItem(item) {
    setDeleteTarget(item)
    setError('')
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    const item = deleteTarget
    setActionId(item.id)
    setError('')
    setNotice('')

    try {
      await apiRequest(`${API_URL}/${item.id}`, {
        method: 'DELETE',
      })

      setDeleteTarget(null)
      setNotice(`${item.name} deleted from the database.`)
      await loadItems()
    } catch (err) {
      setError(err.message || 'Could not delete the menu item.')
    } finally {
      setActionId(null)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'MENU ITEM',
      render: item => (
        <>
          <span className="menu-item-dot">
            {item.name.slice(0, 1).toUpperCase()}
          </span>
          <span className="table-primary">{item.name}</span>
          <span className="table-secondary">{item.tag}</span>
        </>
      ),
    },
    { key: 'category', label: 'CATEGORY' },
    {
      key: 'price',
      label: 'PRICE',
      render: item => (
        <span className="table-primary">
          ₹{item.price.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'available',
      label: 'AVAILABILITY',
      render: item => (
        <span
          className={`status-badge ${
            item.available ? 'status-available' : 'status-out'
          }`}
        >
          {item.available ? 'Available' : 'Unavailable'}
        </span>
      ),
    },
    {
      key: 'action',
      label: 'ACTIONS',
      render: item => (
        <div className="menu-row-actions">
          <button
            type="button"
            className="table-action"
            onClick={() => openEditForm(item)}
            disabled={actionId === item.id || saving}
            aria-label={`Edit ${item.name}`}
          >
            Edit
          </button>

          <button
            type="button"
            className="table-action"
            onClick={() => toggleAvailability(item)}
            disabled={actionId === item.id || saving}
          >
            {actionId === item.id
              ? 'Updating...'
              : item.available
                ? 'Mark unavailable'
                : 'Make available'}
          </button>

          <button
            type="button"
            className="table-action menu-delete-action"
            onClick={() => deleteItem(item)}
            disabled={actionId === item.id || saving}
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
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">FOOD &amp; CATALOGUE</div>
          <h1>Menu Management</h1>
          <p>Manage menu items, prices and availability.</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={openAddForm}
        >
          + Add menu item
        </button>
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

      {error && !showForm && (
        <div className="menu-error" role="alert">
          {error}
          <button
            type="button"
            className="notice-dismiss"
            onClick={() => setError('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <div
          className="menu-modal-backdrop"
          onClick={closeForm}
        >
          <form
            className="card menu-form menu-modal"
            onClick={event => event.stopPropagation()}
            onSubmit={saveItem}
            role="dialog"
            aria-modal="true"
            aria-labelledby="menu-modal-title"
          >
            <div className="form-heading">
              <h2 id="menu-modal-title">
                {editingId !== null ? 'Edit menu item' : 'Add menu item'}
              </h2>
              <p>
                {editingId !== null
                  ? 'Update the item details below.'
                  : 'Enter the details to add a new item to the menu.'}
              </p>
            </div>

            {error && (
              <div className="menu-error" role="alert">
                {error}
              </div>
            )}

            <div className="form-grid">
              <label>
                Item name *
                <input
                  className="form-control"
                  required
                  maxLength={120}
                  value={form.name}
                  onChange={event => updateField('name', event.target.value)}
                  placeholder="e.g. Aloo tikki burger"
                />
              </label>

              <label>
                Category *
                <select
                  className="form-control"
                  value={form.category}
                  onChange={event => updateField('category', event.target.value)}
                >
                  {[...new Set([...categoryOptions, form.category])].map(value => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Price (₹) *
                <input
                  className="form-control"
                  type="number"
                  min="0.01"
                  max="100000"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={event => updateField('price', event.target.value)}
                  placeholder="80"
                />
              </label>

              <label>
                Dietary type
                <select
                  className="form-control"
                  value={form.tag}
                  onChange={event => updateField('tag', event.target.value)}
                >
                  {dietaryOptions.map(value => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <label className="menu-description-field">
                Description
                <textarea
                  className="form-control"
                  rows={3}
                  maxLength={500}
                  value={form.description}
                  onChange={event =>
                    updateField('description', event.target.value)
                  }
                  placeholder="Briefly describe the dish"
                />
              </label>

              <label className="menu-image-field">
                Image URL
                <input
                  className="form-control"
                  type="url"
                  value={form.imageUrl}
                  onChange={event => updateField('imageUrl', event.target.value)}
                  placeholder="https://example.com/food.jpg"
                />
                <span className="table-secondary">
                  Image URLs are not saved in the database yet.
                </span>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving
                  ? 'Saving...'
                  : editingId !== null
                    ? 'Save changes'
                    : 'Add item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div
          className="menu-modal-backdrop"
          onClick={() => !actionId && setDeleteTarget(null)}
        >
          <div
            className="card menu-delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            onClick={event => event.stopPropagation()}
          >
            <div className="menu-delete-icon">!</div>

            <div className="menu-delete-content">
              <h2 id="delete-modal-title">Delete menu item?</h2>
              <p id="delete-modal-description">
                Are you sure you want to delete{' '}
                <strong>{deleteTarget.name}</strong>? This will delete it from
                the database if it is not referenced by other records.
              </p>
            </div>

            {error && <div className="menu-error" role="alert">{error}</div>}

            <div className="menu-delete-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={actionId !== null}
              >
                Cancel
              </button>

              <button
                type="button"
                className="menu-confirm-delete"
                onClick={confirmDelete}
                disabled={actionId !== null}
              >
                {actionId !== null ? 'Deleting...' : 'Delete item'}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="card menu-panel">
        <div className="menu-toolbar">
          <div className="search-box">
            <span>⌕</span>
            <input
              className="form-control"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search menu items..."
              aria-label="Search menu items"
            />
          </div>

          <select
            className="form-control status-filter"
            value={category}
            onChange={event => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            {categories.map(value => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>

          <select
            className="form-control status-filter"
            value={availabilityFilter}
            onChange={event => setAvailabilityFilter(event.target.value)}
            aria-label="Filter by availability"
          >
            <option value="All">All availability</option>
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
          </select>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadItems}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Loading menu items from database...</div>
        ) : (
          <DataTable
            columns={columns}
            rows={filtered}
            emptyMessage="No menu items match your search."
          />
        )}

        <div className="panel-footer">
          <span>{filtered.length} menu items shown</span>
          <span>Connected to MySQL via backend API</span>
        </div>
      </section>
    </div>
  )
}
