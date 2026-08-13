import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { promocodesApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { formatDate, isActiveStatus, pickList } from '../../utils/format'

const emptyForm = {
  title: '',
  code: '',
  discount: '',
  type: 1,
  status: 1,
  minimum_total: 0,
  starts_at: '',
  expires_at: '',
}

export default function PromocodesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await promocodesApi.list({ page: 1, limit: 50 })
    setRows(pickList(res.data))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      title: row.title || '',
      code: row.code || '',
      discount: row.discount ?? '',
      type: row.type ?? 1,
      status: row.status ?? 1,
      minimum_total: row.minimum_total ?? 0,
      starts_at: row.starts_at ? String(row.starts_at).slice(0, 10) : '',
      expires_at: row.expires_at ? String(row.expires_at).slice(0, 10) : '',
    })
    setOpen(true)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const save = async () => {
    if (!form.code.trim() || !form.title.trim()) {
      toast.error('Title and code are required')
      return
    }
    setSaving(true)
    const payload = {
      ...form,
      discount: Number(form.discount) || 0,
      type: Number(form.type),
      status: Number(form.status),
      minimum_total: Number(form.minimum_total) || 0,
    }
    const id = editing?.id
    const res = editing
      ? await promocodesApi.update(id, payload)
      : await promocodesApi.create(payload)
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Promocode updated' : 'Promocode created')
      setOpen(false)
      load()
    }
  }

  const remove = async (row) => {
    if (!window.confirm('Delete this promocode?')) return
    const res = await promocodesApi.remove(row.id)
    if (res.ok) {
      toast.success('Promocode deleted')
      load()
    }
  }

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'title', header: 'Title' },
    { key: 'code', header: 'Code' },
    {
      key: 'discount',
      header: 'Discount',
      render: (r) =>
        Number(r.type) === 1 ? `${r.discount}%` : `${r.discount} KWD`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) =>
        isActiveStatus(r.status) ? (
          <span className="badge badge-ok">Active</span>
        ) : (
          <span className="badge badge-off">Inactive</span>
        ),
    },
    {
      key: 'expires_at',
      header: 'Expires',
      render: (r) => formatDate(r.expires_at),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="row-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(r)}>
            Edit
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(r)}>
            Delete
          </button>
        </div>
      ),
    },
  ]

  if (open) {
    return (
      <Modal
        open
        title={editing ? 'Edit promocode' : 'New promocode'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-field">
            <label>Title</label>
            <input name="title" value={form.title} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Code</label>
            <input name="code" value={form.code} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Discount</label>
            <input
              name="discount"
              type="number"
              value={form.discount}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Type</label>
            <select name="type" value={form.type} onChange={onChange}>
              <option value={1}>Percentage</option>
              <option value={2}>Fixed amount</option>
            </select>
          </div>
          <div className="form-field">
            <label>Minimum total</label>
            <input
              name="minimum_total"
              type="number"
              value={form.minimum_total}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select name="status" value={form.status} onChange={onChange}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
          <div className="form-field">
            <label>Starts</label>
            <input
              name="starts_at"
              type="date"
              value={form.starts_at}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Expires</label>
            <input
              name="expires_at"
              type="date"
              value={form.expires_at}
              onChange={onChange}
            />
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Promocodes</h2>
          <p>Create and manage discount codes</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add promocode
        </button>
      </div>

      <div className="panel">
        <DataTable columns={columns} rows={rows} rowKey="id" loading={loading} />
      </div>
    </div>
  )
}
