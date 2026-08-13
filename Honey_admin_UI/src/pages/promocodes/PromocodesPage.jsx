import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { promocodesApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Field from '../../components/Field'
import Modal from '../../components/Modal'
import {
  collectErrors,
  firstError,
  requiredNumber,
  requiredText,
} from '../../utils/form'
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
  const [listError, setListError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setListError('')
    const res = await promocodesApi.list({ page: 1, limit: 50 })
    if (!res.ok) {
      setRows([])
      setListError(res.message || 'Failed to load promocodes')
    } else {
      setRows(pickList(res.data))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const closeForm = () => {
    if (saving) return
    setOpen(false)
    setErrors({})
    setFormError('')
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setFormError('')
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
    setErrors({})
    setFormError('')
    setOpen(true)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setFormError('')
  }

  const save = async () => {
    const next = collectErrors({
      title: requiredText(form.title, 'Title'),
      code: requiredText(form.code, 'Code'),
      discount: requiredNumber(form.discount, 'Discount', {
        min: 0,
        allowZero: false,
      }),
    })
    if (Number(form.type) === 1 && Number(form.discount) > 100) {
      next.discount = 'Percentage discount cannot exceed 100'
    }
    if (form.starts_at && form.expires_at && form.starts_at > form.expires_at) {
      next.expires_at = 'Expiry date must be after start date'
    }
    setErrors(next)
    if (Object.keys(next).length) {
      const msg = firstError(next)
      setFormError(msg)
      toast.error(msg)
      return
    }

    setSaving(true)
    setFormError('')
    const payload = {
      ...form,
      title: form.title.trim(),
      code: form.code.trim(),
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
    if (!res.ok) {
      setFormError(res.message || 'Failed to save promocode')
      return
    }
    toast.success(editing ? 'Promocode updated successfully' : 'Promocode created successfully')
    setOpen(false)
    load()
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
        onClose={closeForm}
        busy={saving}
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={closeForm}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <p className="legend-required">
          <span className="req-star">*</span> Required fields
        </p>
        {formError ? <div className="form-alert">{formError}</div> : null}

        <div className="form-grid">
          <Field label="Title" required error={errors.title}>
            <input name="title" value={form.title} onChange={onChange} />
          </Field>
          <Field label="Code" required error={errors.code}>
            <input name="code" value={form.code} onChange={onChange} />
          </Field>
          <Field label="Discount" required error={errors.discount}>
            <input name="discount" type="number" value={form.discount} onChange={onChange} />
          </Field>
          <Field label="Type" required>
            <select name="type" value={form.type} onChange={onChange}>
              <option value={1}>Percentage</option>
              <option value={2}>Fixed amount</option>
            </select>
          </Field>
          <Field label="Minimum total">
            <input
              name="minimum_total"
              type="number"
              value={form.minimum_total}
              onChange={onChange}
            />
          </Field>
          <Field label="Status" required>
            <select name="status" value={form.status} onChange={onChange}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </Field>
          <Field label="Starts">
            <input name="starts_at" type="date" value={form.starts_at} onChange={onChange} />
          </Field>
          <Field label="Expires" error={errors.expires_at}>
            <input name="expires_at" type="date" value={form.expires_at} onChange={onChange} />
          </Field>
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
        <DataTable
          columns={columns}
          rows={rows}
          rowKey="id"
          loading={loading}
          error={listError}
          onRetry={load}
          emptyMessage="No promocodes yet."
        />
      </div>
    </div>
  )
}
