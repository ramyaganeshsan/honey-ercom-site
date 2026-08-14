import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ordersApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import { formatDate, formatMoney, pickList } from '../../utils/format'

const STATUS_OPTIONS = [
  { value: '0', label: 'Pending' },
  { value: '1', label: 'Processing' },
  { value: '2', label: 'Shipped' },
  { value: '3', label: 'Completed' },
  { value: '4', label: 'Cancelled' },
]

function orderIdOf(row) {
  return row?.order_id ?? row?.cart_id ?? row?.id
}

function amountOf(row) {
  return (
    row?.amount ??
    row?.grand_total_price ??
    row?.grand_total ??
    row?.total_cart_price ??
    row?.total ??
    null
  )
}

function paymentLabel(row) {
  if (row?.payment_method) return row.payment_method
  if (Number(row?.isCashOnDelivery) === 1 || Number(row?.is_cod) === 1 || Number(row?.type) === 5) {
    return 'Cash on delivery (COD)'
  }
  return row?.payment_status_label || 'Online payment'
}

export function OrdersListPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    setListError('')
    const res = await ordersApi.list({ page: 1, limit: 50 })
    if (!res.ok) {
      setRows([])
      setListError(res.message || 'Failed to load orders')
    } else {
      setRows(pickList(res.data))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    {
      key: 'id',
      header: 'Order',
      render: (r) => orderIdOf(r) ?? '—',
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) =>
        r.customer_name ||
        r.shipping_name ||
        r.email ||
        [r.firstname, r.lastname].filter(Boolean).join(' ') ||
        `User #${r.user_id || '—'}`,
    },
    {
      key: 'amount',
      header: 'Total',
      render: (r) => formatMoney(amountOf(r)),
    },
    {
      key: 'payment_method',
      header: 'Payment',
      render: (r) => (
        <span className="badge">{paymentLabel(r)}</span>
      ),
    },
    {
      key: 'order_status',
      header: 'Status',
      render: (r) => (
        <span className="badge">
          {r.order_status_label || r.status || 'Pending'}
        </span>
      ),
    },
    {
      key: 'order_date',
      header: 'Date',
      render: (r) =>
        formatDate(r.order_date || r.created_on || r.transaction_date || r.created_at),
    },
    {
      key: 'actions',
      header: '',
      render: (r) => (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(`/orders/${orderIdOf(r)}`)}
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
          rowKey={(r) => orderIdOf(r)}
          loading={loading}
          error={listError}
          onRetry={load}
          emptyMessage="No orders found."
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
  const [status, setStatus] = useState('0')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await ordersApi.get(id)
    if (!res.ok) {
      setOrder(null)
      setLoading(false)
      return
    }
    setOrder(res.data)
    const current =
      res.data?.order_status != null
        ? String(res.data.order_status)
        : STATUS_OPTIONS.find(
            (o) =>
              o.label.toLowerCase() ===
              String(res.data?.order_status_label || res.data?.status || '')
                .toLowerCase()
          )?.value || '0'
    setStatus(current)
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const saveStatus = async () => {
    if (status === '' || status == null) {
      toast.error('Select a status first')
      return
    }
    setSaving(true)
    // Send numeric order_status — never send string labels as payment_status
    const res = await ordersApi.updateStatus(id, {
      order_status: Number(status),
      admin_status: Number(status),
    })
    setSaving(false)
    if (!res.ok) {
      toast.error(res.message || 'Failed to update order status')
      return
    }
    toast.success('Order status updated successfully')
    setOrder(res.data || order)
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
  const total = amountOf(order)
  const shipping = order.shipping_amount ?? order.delivery_price ?? 0
  const subtotal = order.subtotal ?? order.total_cart_price ?? null
  const tax = order.tax_amount ?? 0
  const discount = order.discount_amount ?? 0

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Order #{order.order_id || order.cart_id || order.id || id}</h2>
          <p>
            {formatDate(
              order.order_date ||
                order.created_on ||
                order.transaction_date ||
                order.created_at
            )}
          </p>
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
                order.shipping_name ||
                order.email ||
                [order.firstname, order.lastname].filter(Boolean).join(' ') ||
                `User #${order.user_id || '—'}`}
            </dd>
            <dt>Phone</dt>
            <dd>{order.phone || order.shipping_phone || '—'}</dd>
            <dt>Address</dt>
            <dd>
              {order.address ||
                [order.shipping_address, order.shipping_address1]
                  .filter(Boolean)
                  .join(', ') ||
                '—'}
            </dd>
            <dt>Payment method</dt>
            <dd>
              <span className="badge badge-ok">{paymentLabel(order)}</span>
            </dd>
            <dt>Payment status</dt>
            <dd>{order.payment_status_label || '—'}</dd>
            <dt>Order status</dt>
            <dd>{order.order_status_label || order.status || 'Pending'}</dd>
            <dt>Subtotal</dt>
            <dd>{subtotal != null ? formatMoney(subtotal) : '—'}</dd>
            <dt>Shipping</dt>
            <dd>{formatMoney(shipping)}</dd>
            <dt>Tax</dt>
            <dd>{formatMoney(tax)}</dd>
            <dt>Discount</dt>
            <dd>{formatMoney(discount)}</dd>
            <dt>Total amount</dt>
            <dd>
              <strong>{total != null ? formatMoney(total) : '—'}</strong>
            </dd>
            <dt>Reference</dt>
            <dd>{order.tracking_id || order.transaction_id || order.referenceNumber || '—'}</dd>
          </dl>

          <div className="toolbar" style={{ marginTop: 20, marginBottom: 0 }}>
            <select
              className="input"
              style={{ maxWidth: 220 }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveStatus}
              disabled={saving}
            >
              {saving ? 'Updating…' : 'Update status'}
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
                render: (r) =>
                  r.deal_title || r.title || r.product_name || `Deal #${r.deal_id}`,
              },
              {
                key: 'sku',
                header: 'SKU',
                render: (r) => r.sku || '—',
              },
              {
                key: 'quantity',
                header: 'Qty',
                render: (r) => r.quantity ?? r.item_quantity ?? 1,
              },
              {
                key: 'unit',
                header: 'Unit',
                render: (r) =>
                  formatMoney(
                    r.unit_price ?? r.deal_price ?? r.price ?? r.currentPrice ?? 0
                  ),
              },
              {
                key: 'amount',
                header: 'Amount',
                render: (r) =>
                  formatMoney(
                    r.amount ??
                      (Number(r.deal_price || r.price || 0) *
                        Number(r.quantity ?? r.item_quantity ?? 1))
                  ),
              },
            ]}
            rows={items}
            rowKey={(r, i) => r.item_id || r.id || r.cart_item_id || i}
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
