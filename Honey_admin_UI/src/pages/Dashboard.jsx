import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi } from '../api/adminApi'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const res = await dashboardApi.get()
      if (!alive) return
      if (!res.ok) {
        setError(res.message || 'Failed to load dashboard')
        setData(null)
      } else {
        setData(res.data)
      }
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  const counts = data?.counts || data || {}

  const cards = [
    { label: 'Users', value: counts.users, to: '/users' },
    { label: 'Products', value: counts.products, to: '/products' },
    { label: 'Orders', value: counts.orders, to: '/orders' },
    { label: 'Categories', value: counts.categories, to: '/categories' },
    { label: 'Pending reviews', value: counts.pendingReviews, to: '/reviews' },
    { label: 'Open contacts', value: counts.openContacts, to: '/contact' },
    { label: 'Low stock', value: counts.lowStockProducts, to: '/products' },
    { label: 'Transactions', value: counts.transactions, to: '/transactions' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Overview of store activity and catalog health</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-block">Loading dashboard…</div>
      ) : error ? (
        <div className="form-alert">{error}</div>
      ) : (
        <div className="stat-grid">
          {cards.map((c) => (
            <Link className="stat-card" key={c.label} to={c.to || '/'}>
              <div className="label">{c.label}</div>
              <div className="value">
                {c.value != null ? c.value : '—'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
