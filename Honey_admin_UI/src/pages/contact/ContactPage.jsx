import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { contactApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { pickList } from '../../utils/format'

export default function ContactPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await contactApi.list({ page: 1, limit: 50 })
    setRows(pickList(res.data))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const markRead = async (row) => {
    const id = row.contact_id ?? row.id
    const res = await contactApi.update(id, { status: 0 })
    if (res.ok) {
      toast.success('Marked as read')
      load()
    }
  }

  const columns = [
    {
      key: 'contact_id',
      header: 'ID',
      render: (r) => r.contact_id ?? r.id,
    },
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'phone_number',
      header: 'Phone',
      render: (r) => r.phone_number || r.phone || '—',
    },
    {
      key: 'message',
      header: 'Message',
      render: (r) => {
        const msg = r.message || ''
        return msg.length > 60 ? `${msg.slice(0, 60)}…` : msg || '—'
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        Number(r.status) === 1 ? (
          <span className="badge badge-warn">New</span>
        ) : (
          <span className="badge">Read</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="row-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(r)}>
            View
          </button>
          {Number(r.status) === 1 ? (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => markRead(r)}>
              Mark read
            </button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Contact</h2>
          <p>Inbox messages from the storefront contact form</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.contact_id ?? r.id}
          loading={loading}
        />
      </div>

      <Modal
        open={!!selected}
        title="Message"
        onClose={() => setSelected(null)}
        footer={
          <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>
            Close
          </button>
        }
      >
        {selected ? (
          <dl className="detail-grid">
            <dt>Name</dt>
            <dd>{selected.name}</dd>
            <dt>Email</dt>
            <dd>{selected.email}</dd>
            <dt>Phone</dt>
            <dd>{selected.phone_number || selected.phone || '—'}</dd>
            <dt>Message</dt>
            <dd style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</dd>
          </dl>
        ) : null}
      </Modal>
    </div>
  )
}
