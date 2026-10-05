import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { categoriesApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Field from '../../components/Field'
import Modal from '../../components/Modal'
import {
  collectErrors,
  firstError,
  requiredText,
} from '../../utils/form'
import { isActiveStatus, pickList } from '../../utils/format'

const emptyCategory = {
  category_name: '',
  category_name_french: '',
  category_url: '',
  category_status: 1,
  sort_order: 0,
}

function slugify(text) {
  return (
    String(text || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'category'
  )
}

export default function CategoriesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyCategory)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setListError('')
    const res = await categoriesApi.list({ page: 1, limit: 200 })
    if (!res.ok) {
      setRows([])
      setListError(res.message || 'Failed to load categories')
    } else {
      setRows(pickList(res.data))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Only top-level categories (no subcategory hierarchy)
  const categories = useMemo(
    () => rows.filter((c) => !Number(c.main_category_id)),
    [rows]
  )

  const closeForm = () => {
    if (saving) return
    setOpen(false)
    setErrors({})
    setFormError('')
  }

  const openCreate = () => {
    setEditing(null)
    setErrors({})
    setFormError('')
    setForm({ ...emptyCategory })
    setOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setErrors({})
    setFormError('')
    setForm({
      category_name: row.category_name || '',
      category_name_french: row.category_name_french || '',
      category_url: row.category_url || '',
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
        name === 'category_status' || name === 'sort_order'
          ? Number(value)
          : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setFormError('')
  }

  const save = async () => {
    const next = collectErrors({
      category_name: requiredText(form.category_name, 'Category name'),
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
    const id = editing?.category_id ?? editing?.id
    const payload = {
      category_name: form.category_name.trim(),
      category_name_french:
        form.category_name_french.trim() || form.category_name.trim(),
      category_url: form.category_url.trim() || slugify(form.category_name),
      main_category_id: 0,
      sub_category_id: 0,
      category_status: Number(form.category_status),
      sort_order: Number(form.sort_order) || 0,
    }

    const res = editing
      ? await categoriesApi.update(id, payload)
      : await categoriesApi.create(payload)
    setSaving(false)
    if (!res.ok) {
      setFormError(res.message || 'Failed to save')
      return
    }
    toast.success(
      editing ? 'Category updated successfully' : 'Category created successfully'
    )
    setOpen(false)
    load()
  }

  const remove = async (row) => {
    if (!window.confirm('Deactivate this category?')) {
      return
    }
    const id = row.category_id ?? row.id
    const res = await categoriesApi.remove(id)
    if (res.ok) {
      toast.success('Category deactivated')
      load()
    }
  }

  const columns = [
    {
      key: 'category_id',
      header: 'ID',
      render: (r) => r.category_id ?? r.id,
    },
    { key: 'category_name', header: 'Category name' },
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
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => openEdit(r)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => remove(r)}
          >
            Deactivate
          </button>
        </div>
      ),
    },
  ]

  if (open) {
    return (
      <Modal
        open
        title={editing ? 'Edit category' : 'Add category'}
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
            <button
              type="button"
              className="btn btn-primary"
              onClick={save}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <p className="legend-required">
          <span className="req-star">*</span> Required fields
        </p>
        {formError ? <div className="form-alert">{formError}</div> : null}

        <div className="flow-steps compact">
          <span className="active">1. Category</span>
          <span>2. Product</span>
        </div>

        <div className="form-grid">
          <Field label="Category name (EN)" required error={errors.category_name}>
            <input
              name="category_name"
              value={form.category_name}
              onChange={onChange}
            />
          </Field>
          <Field label="Category name (AR)">
            <input
              name="category_name_french"
              value={form.category_name_french}
              onChange={onChange}
            />
          </Field>
          <Field label="URL slug" hint="Auto from name if empty">
            <input
              name="category_url"
              value={form.category_url}
              onChange={onChange}
            />
          </Field>
          <Field label="Sort order">
            <input
              name="sort_order"
              type="number"
              value={form.sort_order}
              onChange={onChange}
            />
          </Field>
          <Field label="Status" required>
            <select
              name="category_status"
              value={form.category_status}
              onChange={onChange}
            >
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
          <h2>Categories</h2>
          <p>Setup order: Category → then add Products</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add category
        </button>
      </div>

      <div className="flow-steps">
        <button type="button" className="flow-step active">
          <strong>1</strong>
          <span>Category</span>
        </button>
        <Link to="/products" className="flow-step">
          <strong>2</strong>
          <span>Product</span>
        </Link>
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={categories}
          rowKey={(r) => r.category_id ?? r.id}
          loading={loading}
          error={listError}
          onRetry={load}
          emptyMessage="No categories yet. Add your first Category."
        />
      </div>
    </div>
  )
}
