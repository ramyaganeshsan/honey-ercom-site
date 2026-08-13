import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { cmsApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Field from '../../components/Field'
import Modal from '../../components/Modal'
import { collectErrors, firstError, requiredText } from '../../utils/form'
import { isActiveStatus, pickList } from '../../utils/format'

const emptyForm = {
  cms_title: '',
  cms_title_french: '',
  cms_url: '',
  cms_desc: '',
  cms_desc_french: '',
  cms_status: 1,
}

export default function CmsPage() {
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
    const res = await cmsApi.list({ page: 1, limit: 50 })
    if (!res.ok) {
      setRows([])
      setListError(res.message || 'Failed to load CMS pages')
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
      cms_title: row.cms_title || '',
      cms_title_french: row.cms_title_french || '',
      cms_url: row.cms_url || '',
      cms_desc: row.cms_desc || '',
      cms_desc_french: row.cms_desc_french || '',
      cms_status: row.cms_status ?? 1,
    })
    setErrors({})
    setFormError('')
    setOpen(true)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({
      ...f,
      [name]: name === 'cms_status' ? Number(value) : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setFormError('')
  }

  const save = async () => {
    const next = collectErrors({
      cms_title: requiredText(form.cms_title, 'Title (EN)'),
      cms_url: requiredText(form.cms_url, 'URL'),
    })
    setErrors(next)
    if (Object.keys(next).length) {
      const msg = firstError(next)
      setFormError(msg)
      toast.error(msg)
      return
    }

    setSaving(true)
    setFormError('')
    const id = editing?.cms_id ?? editing?.id
    const res = editing
      ? await cmsApi.update(id, form)
      : await cmsApi.create(form)
    setSaving(false)
    if (!res.ok) {
      setFormError(res.message || 'Failed to save page')
      return
    }
    toast.success(editing ? 'Page updated successfully' : 'Page created successfully')
    setOpen(false)
    load()
  }

  const remove = async (row) => {
    if (!window.confirm('Delete this CMS page?')) return
    const id = row.cms_id ?? row.id
    const res = await cmsApi.remove(id)
    if (res.ok) {
      toast.success('Page deleted')
      load()
    }
  }

  const columns = [
    {
      key: 'cms_id',
      header: 'ID',
      render: (r) => r.cms_id ?? r.id,
    },
    { key: 'cms_title', header: 'Title' },
    { key: 'cms_url', header: 'URL' },
    {
      key: 'cms_status',
      header: 'Status',
      render: (r) =>
        isActiveStatus(r.cms_status) ? (
          <span className="badge badge-ok">Active</span>
        ) : (
          <span className="badge badge-off">Inactive</span>
        ),
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
        title={editing ? 'Edit CMS page' : 'New CMS page'}
        onClose={closeForm}
        wide
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
          <Field label="Title (EN)" required error={errors.cms_title}>
            <input name="cms_title" value={form.cms_title} onChange={onChange} />
          </Field>
          <Field label="Title (AR)">
            <input
              name="cms_title_french"
              value={form.cms_title_french}
              onChange={onChange}
            />
          </Field>
          <Field label="URL" required className="full" error={errors.cms_url}>
            <input name="cms_url" value={form.cms_url} onChange={onChange} />
          </Field>
          <Field label="Content (EN)" className="full">
            <textarea name="cms_desc" value={form.cms_desc} onChange={onChange} />
          </Field>
          <Field label="Content (AR)" className="full">
            <textarea
              name="cms_desc_french"
              value={form.cms_desc_french}
              onChange={onChange}
            />
          </Field>
          <Field label="Status" required>
            <select name="cms_status" value={form.cms_status} onChange={onChange}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </Field>
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>CMS</h2>
          <p>Manage static content pages</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add page
        </button>
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.cms_id ?? r.id}
          loading={loading}
          error={listError}
          onRetry={load}
          emptyMessage="No CMS pages yet."
        />
      </div>
    </div>
  )
}
