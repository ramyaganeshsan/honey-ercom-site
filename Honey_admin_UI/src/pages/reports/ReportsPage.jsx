import { useState } from 'react'
import dayjs from 'dayjs'
import { reportsApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import { formatMoney, pickList } from '../../utils/format'

export default function ReportsPage() {
  const [from, setFrom] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'))
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'))
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)

  const run = async () => {
    setLoading(true)
    const res = await reportsApi.summary({ from, to })
    setData(res.ok ? res.data : null)
    setLoading(false)
  }

  const summary = data?.summary || data?.counts || data || {}
  const rows = pickList(data?.rows || data?.items || data?.orders || [])

  const cards = [
    { label: 'Orders', value: summary.orders ?? summary.ordersCount },
    { label: 'Revenue', value: summary.revenue != null ? formatMoney(summary.revenue) : summary.total_amount != null ? formatMoney(summary.total_amount) : null },
    { label: 'Customers', value: summary.customers ?? summary.users },
    { label: 'Avg order', value: summary.avg_order != null ? formatMoney(summary.avg_order) : null },
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
        <div className="panel-header">Detail rows</div>
        {data ? (
          <DataTable
            columns={[
              {
                key: 'label',
                header: 'Label',
                render: (r) => r.label || r.date || r.order_id || r.id || '—',
              },
              {
                key: 'orders',
                header: 'Orders',
                render: (r) => r.orders ?? r.count ?? '—',
              },
              {
                key: 'amount',
                header: 'Amount',
                render: (r) =>
                  r.amount != null || r.total != null
                    ? formatMoney(r.amount ?? r.total)
                    : '—',
              },
            ]}
            rows={rows}
            loading={loading}
            emptyMessage="No detail rows in this report response."
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
