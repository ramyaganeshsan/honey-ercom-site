import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ordersApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import { formatDate, formatMoney, pickList } from '../../utils/format'

export function OrdersListPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    const res = await ordersApi.list({ page: 1, limit: 50 })
    setRows(pickList(res.data))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    {
      key: 'id',
      header: 'Order',
      render: (r) => r.order_id || r.id || r.cart_id || '—',
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) =>
        r.customer_name ||
        r.email ||
        [r.firstname, r.lastname].filter(Boolean).join(' ') ||
        `User #${r.user_id || '—'}`,
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (r) => formatMoney(r.amount ?? r.total ?? r.grand_total),
    },
    {
      key: 'payment_status',
      header: 'Payment',
      render: (r) => (
        <span className="badge">{r.payment_status || r.status || '—'}</span>
      ),
    },
    {
      key: 'order_date',
      header: 'Date',
      render: (r) => formatDate(r.order_date || r.created_at || r.transaction_date),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/orders/${r.order_id || r.id || r.cart_id}`)}
        >
          View
        </button>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Orders</h2>
          <p>Browse and inspect customer orders</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>
      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.order_id || r.id || r.cart_id}
          loading={loading}
        />
      </div>
    </div>
  )
}

export function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const res = await ordersApi.get(id)
      if (!alive) return
      setOrder(res.ok ? res.data : null)
      setStatus(res.data?.payment_status || res.data?.status || '')
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [id])

  const saveStatus = async () => {
    const res = await ordersApi.updateStatus(id, { status, payment_status: status })
    if (res.ok) {
      toast.success('Order status updated')
      setOrder(res.data || { ...order, payment_status: status, status })
    }
  }

  if (loading) return <div className="loading-block">Loading order…</div>

  if (!order) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h2>Order not found</h2>
            <p>Could not load order #{id}</p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/orders')}>
            Back
          </button>
        </div>
      </div>
    )
  }

  const items = order.items || order.order_items || order.products || []

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Order #{order.order_id || order.id || id}</h2>
          <p>{formatDate(order.order_date || order.created_at || order.transaction_date)}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/orders')}>
          Back to orders
        </button>
      </div>

      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-header">Details</div>
        <div className="panel-body">
          <dl className="detail-grid">
            <dt>Customer</dt>
            <dd>
              {order.customer_name ||
                order.email ||
                [order.firstname, order.lastname].filter(Boolean).join(' ') ||
                `User #${order.user_id || '—'}`}
            </dd>
            <dt>Amount</dt>
            <dd>{formatMoney(order.amount ?? order.total ?? order.grand_total)}</dd>
            <dt>Shipping</dt>
            <dd>{formatMoney(order.shipping_amount ?? 0)}</dd>
            <dt>Payment</dt>
            <dd>{order.payment_status || order.status || '—'}</dd>
            <dt>Reference</dt>
            <dd>{order.referenceNumber || order.transaction_id || '—'}</dd>
          </dl>

          <div className="toolbar" style={{ marginTop: 20, marginBottom: 0 }}>
            <select
              className="input"
              style={{ maxWidth: 220 }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Select status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button type="button" className="btn btn-primary" onClick={saveStatus}>
              Update status
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">Line items</div>
        {Array.isArray(items) && items.length ? (
          <DataTable
            columns={[
              {
                key: 'name',
                header: 'Product',
                render: (r) => r.deal_title || r.title || r.product_name || r.product_id,
              },
              { key: 'quantity', header: 'Qty', render: (r) => r.quantity ?? 1 },
              {
                key: 'amount',
                header: 'Amount',
                render: (r) => formatMoney(r.amount ?? r.price ?? r.deal_price),
              },
            ]}
            rows={items}
            rowKey={(r, i) => r.id || r.cart_item_id || i}
          />
        ) : (
          <div className="empty-state">No line items returned for this order.</div>
        )}
      </div>
    </div>
  )
}

export default function OrdersPage() {
  return <OrdersListPage />
}
