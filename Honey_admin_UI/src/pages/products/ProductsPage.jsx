import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { categoriesApi, productsApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { formatMoney, isActiveStatus, pickList } from '../../utils/format'

const emptyForm = {
  deal_title: '',
  deal_price: '',
  deal_value: '',
  stock: '',
  category_id: '',
  deal_status: 1,
}

export default function ProductsPage() {
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [prodRes, catRes] = await Promise.all([
      productsApi.list({ search: q || undefined, page: 1, limit: 50 }),
      categoriesApi.list({ page: 1, limit: 200 }),
    ])
    setRows(pickList(prodRes.data))
    setCategories(pickList(catRes.data))
    setLoading(false)
  }, [q])

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
      deal_title: row.deal_title || row.title || '',
      deal_price: row.deal_price ?? row.price ?? '',
      deal_value: row.deal_value ?? row.value ?? '',
      stock: row.stock ?? row.quantity ?? row.user_limit_quantity ?? '',
      category_id: row.category_id ?? '',
      deal_status: row.deal_status ?? row.status ?? 1,
    })
    setOpen(true)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const save = async () => {
    if (!form.deal_title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    const payload = {
      deal_title: form.deal_title,
      title: form.deal_title,
      deal_price: Number(form.deal_price) || 0,
      price: Number(form.deal_price) || 0,
      deal_value: Number(form.deal_value) || 0,
      value: Number(form.deal_value) || 0,
      stock: Number(form.stock) || 0,
      category_id: Number(form.category_id) || 0,
      deal_status: Number(form.deal_status),
      status: Number(form.deal_status),
    }
    const id = editing?.deal_id ?? editing?.id
    const res = editing
      ? await productsApi.update(id, payload)
      : await productsApi.create(payload)
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Product updated' : 'Product created')
      setOpen(false)
      load()
    }
  }

  const remove = async (row) => {
    if (!window.confirm('Delete this product?')) return
    const id = row.deal_id ?? row.id
    const res = await productsApi.remove(id)
    if (res.ok) {
      toast.success('Product deleted')
      load()
    }
  }

  const catName = (id) => {
    const c = categories.find((x) => (x.category_id ?? x.id) === Number(id))
    return c?.category_name || id || '—'
  }

  const columns = [
    {
      key: 'deal_id',
      header: 'ID',
      render: (r) => r.deal_id ?? r.id,
    },
    {
      key: 'deal_title',
      header: 'Title',
      render: (r) => r.deal_title || r.title || '—',
    },
    {
      key: 'deal_price',
      header: 'Price',
      render: (r) => formatMoney(r.deal_price ?? r.price),
    },
    {
      key: 'deal_value',
      header: 'Value',
      render: (r) => formatMoney(r.deal_value ?? r.value),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (r) => r.stock ?? r.quantity ?? r.user_limit_quantity ?? '—',
    },
    {
      key: 'category_id',
      header: 'Category',
      render: (r) => catName(r.category_id),
    },
    {
      key: 'deal_status',
      header: 'Status',
      render: (r) =>
        isActiveStatus(r.deal_status ?? r.status) ? (
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

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>Create and manage honey catalog items</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add product
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setQ(search.trim())
          }}
        />
        <button type="button" className="btn btn-primary" onClick={() => setQ(search.trim())}>
          Search
        </button>
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.deal_id ?? r.id}
          loading={loading}
        />
      </div>

      <Modal
        open={open}
        title={editing ? 'Edit product' : 'New product'}
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
          <div className="form-field full">
            <label>Title</label>
            <input name="deal_title" value={form.deal_title} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Price</label>
            <input
              name="deal_price"
              type="number"
              step="0.001"
              value={form.deal_price}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Value</label>
            <input
              name="deal_value"
              type="number"
              step="0.001"
              value={form.deal_value}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Stock</label>
            <input name="stock" type="number" value={form.stock} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Category</label>
            <select name="category_id" value={form.category_id} onChange={onChange}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.category_id ?? c.id} value={c.category_id ?? c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Status</label>
            <select name="deal_status" value={form.deal_status} onChange={onChange}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
