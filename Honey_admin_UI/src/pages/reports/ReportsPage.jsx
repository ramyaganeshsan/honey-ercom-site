import { useState } from 'react'
import dayjs from 'dayjs'
import { reportsApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import { formatMoney } from '../../utils/format'

export default function ReportsPage() {
  const [from, setFrom] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'))
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const run = async () => {
    setLoading(true)
    setError('')
    const res = await reportsApi.summary({ from, to })
    if (!res.ok) {
      setData(null)
      setError(res.message || 'Failed to load report')
    } else {
      setData(res.data)
    }
    setLoading(false)
  }

  const totals = data?.totals || data?.summary || data?.counts || {}
  const rows = Array.isArray(data?.daily)
    ? data.daily
    : Array.isArray(data?.rows)
      ? data.rows
      : Array.isArray(data?.items)
        ? data.items
        : []

  const orderCount = Number(totals.orders) || 0
  const revenue = Number(totals.revenue) || 0
  const avgOrder = orderCount > 0 ? revenue / orderCount : null

  const cards = [
    { label: 'Orders', value: totals.orders != null ? orderCount : null },
    {
      label: 'Revenue',
      value: totals.revenue != null ? formatMoney(revenue, 'AED') : null,
    },
    {
      label: 'Tax',
      value: totals.tax != null ? formatMoney(Number(totals.tax) || 0, 'AED') : null,
    },
    {
      label: 'Avg order',
      value: avgOrder != null ? formatMoney(avgOrder, 'AED') : null,
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reports</h2>
          <p>Filter by date and review sales summary</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="form-field" style={{ margin: 0, minWidth: 160 }}>
          <label>From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="form-field" style={{ margin: 0, minWidth: 160 }}>
          <label>To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ alignSelf: 'flex-end' }}
          onClick={run}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Run report'}
        </button>
      </div>

      {error ? <div className="form-alert">{error}</div> : null}

      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat-card" key={c.label}>
            <div className="label">{c.label}</div>
            <div className="value" style={{ fontSize: '1.4rem' }}>
              {c.value != null ? c.value : '—'}
            </div>
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-header">Daily breakdown</div>
        {data ? (
          <DataTable
            columns={[
              {
                key: 'date',
                header: 'Date',
                render: (r) => r.date || r.label || r._id || '—',
              },
              {
                key: 'orders',
                header: 'Orders',
                render: (r) => r.orders ?? r.count ?? '—',
              },
              {
                key: 'revenue',
                header: 'Revenue',
                render: (r) =>
                  formatMoney(
                    r.revenue ?? r.amount ?? r.total ?? 0,
                    'AED'
                  ),
              },
              {
                key: 'tax',
                header: 'Tax',
                render: (r) => formatMoney(r.tax ?? 0, 'AED'),
              },
            ]}
            rows={rows}
            loading={loading}
            emptyMessage="No orders found in this date range."
          />
        ) : (
          <div className="empty-state">
            Choose a date range and run the report to see results.
          </div>
        )}
      </div>
    </div>
  )
}
