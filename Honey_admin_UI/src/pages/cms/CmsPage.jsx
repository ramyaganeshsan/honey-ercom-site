import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { cmsApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
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
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await cmsApi.list({ page: 1, limit: 50 })
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
      cms_title: row.cms_title || '',
      cms_title_french: row.cms_title_french || '',
      cms_url: row.cms_url || '',
      cms_desc: row.cms_desc || '',
      cms_desc_french: row.cms_desc_french || '',
      cms_status: row.cms_status ?? 1,
    })
    setOpen(true)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({
      ...f,
      [name]: name === 'cms_status' ? Number(value) : value,
    }))
  }

  const save = async () => {
    if (!form.cms_title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    const id = editing?.cms_id ?? editing?.id
    const res = editing
      ? await cmsApi.update(id, form)
      : await cmsApi.create(form)
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Page updated' : 'Page created')
      setOpen(false)
      load()
    }
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
        onClose={() => setOpen(false)}
        wide
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
            <label>Title (EN)</label>
            <input name="cms_title" value={form.cms_title} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Title (AR)</label>
            <input
              name="cms_title_french"
              value={form.cms_title_french}
              onChange={onChange}
            />
          </div>
          <div className="form-field full">
            <label>URL</label>
            <input name="cms_url" value={form.cms_url} onChange={onChange} />
          </div>
          <div className="form-field full">
            <label>Content (EN)</label>
            <textarea name="cms_desc" value={form.cms_desc} onChange={onChange} />
          </div>
          <div className="form-field full">
            <label>Content (AR)</label>
            <textarea
              name="cms_desc_french"
              value={form.cms_desc_french}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select name="cms_status" value={form.cms_status} onChange={onChange}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
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
        />
      </div>
    </div>
  )
}
