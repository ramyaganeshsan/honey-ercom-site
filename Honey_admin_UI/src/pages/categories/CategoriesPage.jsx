import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { categoriesApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { isActiveStatus, pickList } from '../../utils/format'

const emptyForm = {
  category_name: '',
  category_name_french: '',
  category_url: '',
  main_category_id: 0,
  category_status: 1,
  sort_order: 0,
}

export default function CategoriesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await categoriesApi.list({ page: 1, limit: 200 })
    setRows(pickList(res.data))
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const rootCategories = useMemo(
    () => rows.filter((c) => !Number(c.main_category_id)),
    [rows]
  )

  const parentName = (parentId) => {
    if (!Number(parentId)) return '— Root category —'
    const p = rows.find((x) => (x.category_id ?? x.id) === Number(parentId))
    return p?.category_name || `Parent #${parentId}`
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      category_name: row.category_name || '',
      category_name_french: row.category_name_french || '',
      category_url: row.category_url || '',
      main_category_id: row.main_category_id ?? 0,
      category_status: row.category_status ?? 1,
      sort_order: row.sort_order ?? 0,
    })
    setOpen(true)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({
      ...f,
      [name]:
        name === 'main_category_id' ||
        name === 'category_status' ||
        name === 'sort_order'
          ? Number(value)
          : value,
    }))
  }

  const save = async () => {
    if (!form.category_name.trim()) {
      toast.error('Category name is required')
      return
    }
    setSaving(true)
    const id = editing?.category_id ?? editing?.id
    const payload = {
      ...form,
      // Keep category.sub_category_id aligned with parent link for tree consistency
      sub_category_id: Number(form.main_category_id) || 0,
    }
    const res = editing
      ? await categoriesApi.update(id, payload)
      : await categoriesApi.create(payload)
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Category updated' : 'Category created')
      setOpen(false)
      load()
    }
  }

  const remove = async (row) => {
    if (!window.confirm('Delete this category?')) return
    const id = row.category_id ?? row.id
    const res = await categoriesApi.remove(id)
    if (res.ok) {
      toast.success('Category deleted')
      load()
    }
  }

  const columns = [
    {
      key: 'category_id',
      header: 'ID',
      render: (r) => r.category_id ?? r.id,
    },
    { key: 'category_name', header: 'Name' },
    {
      key: 'main_category_id',
      header: 'Type / Parent',
      render: (r) =>
        Number(r.main_category_id) ? (
          <span>Sub of {parentName(r.main_category_id)}</span>
        ) : (
          <span className="badge badge-ok">Category</span>
        ),
    },
    { key: 'category_url', header: 'URL' },
    {
      key: 'category_status',
      header: 'Status',
      render: (r) =>
        isActiveStatus(r.category_status) ? (
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

  const editingId = editing?.category_id ?? editing?.id
  const parentOptions = rootCategories.filter(
    (c) => (c.category_id ?? c.id) !== editingId
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p>Root categories and linked sub categories for products</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add category
        </button>
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.category_id ?? r.id}
          loading={loading}
        />
      </div>

      <Modal
        open={open}
        title={editing ? 'Edit category' : 'New category'}
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
            <label>Name (EN)</label>
            <input name="category_name" value={form.category_name} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Name (AR)</label>
            <input
              name="category_name_french"
              value={form.category_name_french}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>URL slug</label>
            <input name="category_url" value={form.category_url} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Parent category</label>
            <select
              name="main_category_id"
              value={form.main_category_id}
              onChange={onChange}
            >
              <option value={0}>— None (this is a root category) —</option>
              {parentOptions.map((c) => (
                <option key={c.category_id ?? c.id} value={c.category_id ?? c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
            <p className="field-hint">
              Choose a parent to make this a sub category. Products then filter sub categories by
              this link.
            </p>
          </div>
          <div className="form-field">
            <label>Sort order</label>
            <input
              name="sort_order"
              type="number"
              value={form.sort_order}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select
              name="category_status"
              value={form.category_status}
              onChange={onChange}
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
