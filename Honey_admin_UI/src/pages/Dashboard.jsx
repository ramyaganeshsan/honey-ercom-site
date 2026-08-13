import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/adminApi'
import { formatDate } from '../utils/format'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const res = await dashboardApi.get()
      if (!alive) return
      setData(res.ok ? res.data : null)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  const counts = data?.counts || data || {}
  const activity = data?.recentActivity || data?.activity || []

  const cards = [
    { label: 'Users', value: counts.users ?? counts.usersCount },
    { label: 'Products', value: counts.products ?? counts.productsCount },
    { label: 'Orders', value: counts.orders ?? counts.ordersCount },
    { label: 'Categories', value: counts.categories ?? counts.categoriesCount },
    { label: 'Transactions', value: counts.transactions ?? counts.transactionsCount },
    { label: 'Reviews', value: counts.reviews ?? counts.reviewsCount },
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
      ) : (
        <>
          <div className="stat-grid">
            {cards.map((c) => (
              <div className="stat-card" key={c.label}>
                <div className="label">{c.label}</div>
                <div className="value">
                  {c.value != null ? c.value : '—'}
                </div>
              </div>
            ))}
          </div>

          <div className="panel">
            <div className="panel-header">Recent activity</div>
            <div className="panel-body">
              {Array.isArray(activity) && activity.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                  {activity.slice(0, 12).map((item, i) => (
                    <li key={item.id || i}>
                      {item.message || item.title || JSON.stringify(item)}
                      {item.created_at || item.date ? (
                        <span style={{ color: 'var(--ink-muted)', marginLeft: 8 }}>
                          {formatDate(item.created_at || item.date)}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  Recent activity will appear here once the API returns events.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
