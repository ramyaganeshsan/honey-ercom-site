import { useCallback, useEffect, useState } from 'react'
import { transactionsApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import { formatDate, formatMoney, pickList } from '../../utils/format'

export default function TransactionsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await transactionsApi.list({ page: 1, limit: 50 })
    setRows(pickList(res.data))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (r) => r.id || r.transaction_id || '—',
    },
    {
      key: 'transaction_id',
      header: 'Txn ID',
      render: (r) => r.transaction_id || r.referenceNumber || '—',
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) =>
        r.email ||
        [r.firstname, r.lastname].filter(Boolean).join(' ') ||
        `User #${r.user_id || '—'}`,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => formatMoney(r.amount),
    },
    {
      key: 'payment_status',
      header: 'Status',
      render: (r) => <span className="badge">{r.payment_status || '—'}</span>,
    },
    {
      key: 'payment_type',
      header: 'Method',
      render: (r) => r.payment_type || r.transaction_type || '—',
    },
    {
      key: 'order_date',
      header: 'Date',
      render: (r) => formatDate(r.order_date || r.transaction_date || r.created_at),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Transactions</h2>
          <p>Payment and settlement history</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>
      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id || r.transaction_id}
          loading={loading}
        />
      </div>
    </div>
  )
}
