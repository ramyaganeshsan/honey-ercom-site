import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { categoriesApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { isActiveStatus, pickList } from '../../utils/format'

const emptyCategory = {
  category_name: '',
  category_name_french: '',
  category_url: '',
  category_status: 1,
  sort_order: 0,
}

const emptySub = {
  category_name: '',
  category_name_french: '',
  category_url: '',
  main_category_id: '',
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
  const [tab, setTab] = useState('categories') // categories | subcategories
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyCategory)
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

  const categories = useMemo(
    () => rows.filter((c) => !Number(c.main_category_id)),
    [rows]
  )

  const subcategories = useMemo(
    () => rows.filter((c) => Number(c.main_category_id) > 0),
    [rows]
  )

  const parentName = (parentId) => {
    const p = rows.find((x) => (x.category_id ?? x.id) === Number(parentId))
    return p?.category_name || `Category #${parentId}`
  }

  const openCreate = (mode = tab, parentId = '') => {
    const nextTab = mode === 'subcategories' ? 'subcategories' : 'categories'
    if (nextTab === 'subcategories' && categories.length === 0) {
      toast.error('Create a Category first, then add Sub categories under it')
      setTab('categories')
      return
    }
    setTab(nextTab)
    setEditing(null)
    setForm(
      nextTab === 'categories'
        ? { ...emptyCategory }
        : { ...emptySub, main_category_id: parentId || '' }
    )
    setOpen(true)
  }

  const openEdit = (row) => {
    const isSub = Number(row.main_category_id) > 0
    setTab(isSub ? 'subcategories' : 'categories')
    setEditing(row)
    setForm({
      category_name: row.category_name || '',
      category_name_french: row.category_name_french || '',
      category_url: row.category_url || '',
      main_category_id: isSub ? row.main_category_id : 0,
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
      toast.error('Name is required')
      return
    }

    const isSubTab = tab === 'subcategories'
    if (isSubTab && !Number(form.main_category_id)) {
      toast.error('Select the parent Category for this Sub category')
      return
    }

    setSaving(true)
    const id = editing?.category_id ?? editing?.id
    const parentId = isSubTab ? Number(form.main_category_id) : 0
    const payload = {
      category_name: form.category_name.trim(),
      category_name_french:
        form.category_name_french.trim() || form.category_name.trim(),
      category_url: form.category_url.trim() || slugify(form.category_name),
      main_category_id: parentId,
      sub_category_id: parentId,
      category_status: Number(form.category_status),
      sort_order: Number(form.sort_order) || 0,
    }

    const res = editing
      ? await categoriesApi.update(id, payload)
      : await categoriesApi.create(payload)
    setSaving(false)
    if (res.ok) {
      toast.success(
        editing
          ? isSubTab
            ? 'Sub category updated'
            : 'Category updated'
          : isSubTab
            ? 'Sub category created'
            : 'Category created'
      )
      setOpen(false)
      load()
    }
  }

  const remove = async (row) => {
    const isSub = Number(row.main_category_id) > 0
    if (!window.confirm(`Delete this ${isSub ? 'sub category' : 'category'}?`)) {
      return
    }
    const id = row.category_id ?? row.id
    const res = await categoriesApi.remove(id)
    if (res.ok) {
      toast.success(isSub ? 'Sub category deleted' : 'Category deleted')
      load()
    }
  }

  const categoryColumns = [
    {
      key: 'category_id',
      header: 'ID',
      render: (r) => r.category_id ?? r.id,
    },
    { key: 'category_name', header: 'Category name' },
    {
      key: 'subs',
      header: 'Sub categories',
      render: (r) => {
        const id = r.category_id ?? r.id
        const count = subcategories.filter(
          (s) => Number(s.main_category_id) === Number(id)
        ).length
        return count
      },
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
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => openCreate('subcategories', r.category_id ?? r.id)}
          >
            Add sub
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(r)}>
            Delete
          </button>
        </div>
      ),
    },
  ]

  const subColumns = [
    {
      key: 'category_id',
      header: 'ID',
      render: (r) => r.category_id ?? r.id,
    },
    { key: 'category_name', header: 'Sub category' },
    {
      key: 'main_category_id',
      header: 'Under category',
      render: (r) => parentName(r.main_category_id),
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

  const isSubForm = tab === 'subcategories'
  const listRows = isSubForm ? subcategories : categories
  const columns = isSubForm ? subColumns : categoryColumns

  if (open) {
    return (
      <Modal
        open
        title={
          editing
            ? isSubForm
              ? 'Edit sub category'
              : 'Edit category'
            : isSubForm
              ? 'Add sub category'
              : 'Add category'
        }
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
        <div className="flow-steps compact">
          <span className={!isSubForm ? 'active' : 'done'}>1. Category</span>
          <span className={isSubForm ? 'active' : ''}>2. Sub category</span>
          <span>3. Product</span>
        </div>

        <div className="form-grid">
          {isSubForm ? (
            <div className="form-field full">
              <label>1. Parent category (required)</label>
              <select
                name="main_category_id"
                value={form.main_category_id || ''}
                onChange={onChange}
              >
                <option value="">Select category first</option>
                {categories.map((c) => (
                  <option key={c.category_id ?? c.id} value={c.category_id ?? c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
              <p className="field-hint">
                Sub category must belong to one Category. Example: Honey → Natural Honey
              </p>
            </div>
          ) : null}

          <div className="form-field">
            <label>{isSubForm ? '2. Sub category name (EN)' : 'Category name (EN)'}</label>
            <input name="category_name" value={form.category_name} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>{isSubForm ? 'Sub category name (AR)' : 'Category name (AR)'}</label>
            <input
              name="category_name_french"
              value={form.category_name_french}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>URL slug</label>
            <input
              name="category_url"
              value={form.category_url}
              onChange={onChange}
              placeholder="auto from name if empty"
            />
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
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Categories</h2>
          <p>Setup order: Category → Sub category → then add Products</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openCreate(tab)}
        >
          {tab === 'categories' ? 'Add category' : 'Add sub category'}
        </button>
      </div>

      <div className="flow-steps">
        <button
          type="button"
          className={`flow-step${tab === 'categories' ? ' active' : ''}`}
          onClick={() => setTab('categories')}
        >
          <strong>1</strong>
          <span>Category</span>
        </button>
        <button
          type="button"
          className={`flow-step${tab === 'subcategories' ? ' active' : ''}`}
          onClick={() => setTab('subcategories')}
        >
          <strong>2</strong>
          <span>Sub category</span>
        </button>
        <Link to="/products" className="flow-step">
          <strong>3</strong>
          <span>Product</span>
        </Link>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={`tab${tab === 'categories' ? ' active' : ''}`}
          onClick={() => setTab('categories')}
        >
          1. Categories ({categories.length})
        </button>
        <button
          type="button"
          className={`tab${tab === 'subcategories' ? ' active' : ''}`}
          onClick={() => setTab('subcategories')}
        >
          2. Sub categories ({subcategories.length})
        </button>
      </div>

      {tab === 'subcategories' && categories.length === 0 ? (
        <div className="panel empty-hint">
          <p>
            No categories yet. Create a <strong>Category</strong> first, then come back to add
            Sub categories under it.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openCreate('categories')}
          >
            Add category
          </button>
        </div>
      ) : (
        <div className="panel">
          <DataTable
            columns={columns}
            rows={listRows}
            rowKey={(r) => r.category_id ?? r.id}
            loading={loading}
          />
        </div>
      )}
    </div>
  )
}
