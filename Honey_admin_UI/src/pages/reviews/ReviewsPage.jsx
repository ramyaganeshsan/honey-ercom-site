import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { reviewsApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import { formatDate, pickList } from '../../utils/format'

export default function ReviewsPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await reviewsApi.list({ page: 1, limit: 50 })
    setRows(pickList(res.data))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const approve = async (row) => {
    const id = row.id ?? row.review_id
    const res = await reviewsApi.approve(id)
    if (res.ok) {
      toast.success('Review approved')
      load()
    }
  }

  const reject = async (row) => {
    const id = row.id ?? row.review_id
    const res = await reviewsApi.reject(id)
    if (res.ok) {
      toast.success('Review rejected')
      load()
    }
  }

  const approved = (r) =>
    r.approve_status === true ||
    r.approve_status === 1 ||
    r.status === 'approved'

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (r) => r.id ?? r.review_id,
    },
    {
      key: 'product',
      header: 'Product',
      render: (r) => r.product_name || r.module_id || r.product_id || '—',
    },
    {
      key: 'user',
      header: 'User',
      render: (r) => r.user_name || r.user_id || '—',
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (r) => r.rating ?? '—',
    },
    {
      key: 'review_title',
      header: 'Title',
      render: (r) => r.review_title || '—',
    },
    {
      key: 'approve_status',
      header: 'Status',
      render: (r) =>
        approved(r) ? (
          <span className="badge badge-ok">Approved</span>
        ) : r.approve_status === false || r.status === 'rejected' ? (
          <span className="badge badge-off">Rejected / Pending</span>
        ) : (
          <span className="badge badge-warn">Pending</span>
        ),
    },
    {
      key: 'created_date',
      header: 'Date',
      render: (r) => formatDate(r.created_date || r.created_at),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="row-actions">
          <button type="button" className="btn btn-success btn-sm" onClick={() => approve(r)}>
            Approve
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => reject(r)}>
            Reject
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Reviews</h2>
          <p>Moderate customer product reviews</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>
      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id ?? r.review_id}
          loading={loading}
        />
      </div>
    </div>
  )
}
