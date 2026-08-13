import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { categoriesApi, productsApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { productImageUrl } from '../../utils/assets'
import { formatMoney, isActiveStatus, pickList } from '../../utils/format'

const emptyForm = {
  deal_title: '',
  deal_title_french: '',
  url_title: '',
  deal_key: '',
  deal_description: '',
  deal_description_french: '',
  category_id: '',
  sub_category_id: '',
  deal_value: '',
  deal_price: '',
  user_limit_quantity: '',
  deal_status: 1,
  delivery_period: '2-3 days',
  brand_id: 1,
  brand_names: 'Thunayyan',
  tags: '',
  related_products: '',
  having_size_color: 0,
  shipping: 0,
  meta_description: '',
  meta_keywords: '',
  meta_description_french: '',
  meta_keywords_french: '',
  terms_conditions: '',
}

function mapRowToForm(row) {
  return {
    deal_title: row.deal_title || '',
    deal_title_french: row.deal_title_french || '',
    url_title: row.url_title || '',
    deal_key: row.deal_key || '',
    deal_description: row.deal_description || '',
    deal_description_french: row.deal_description_french || '',
    category_id: row.category_id ?? '',
    sub_category_id: row.sub_category_id ?? '',
    deal_value: row.deal_value ?? '',
    deal_price: row.deal_price ?? '',
    user_limit_quantity: row.user_limit_quantity ?? row.stock ?? '',
    deal_status: row.deal_status ?? 1,
    delivery_period: row.delivery_period || '2-3 days',
    brand_id: row.brand_id ?? 1,
    brand_names: row.brand_names || 'Thunayyan',
    tags: row.tags || '',
    related_products: row.related_products || '',
    having_size_color: row.having_size_color ?? 0,
    shipping: row.shipping ?? 0,
    meta_description: row.meta_description || '',
    meta_keywords: row.meta_keywords || '',
    meta_description_french: row.meta_description_french || '',
    meta_keywords_french: row.meta_keywords_french || '',
    terms_conditions: row.terms_conditions || '',
  }
}

function isRootCategory(c) {
  return !Number(c.main_category_id)
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
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imgBust, setImgBust] = useState(0)

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

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const savings = useMemo(() => {
    const value = Number(form.deal_value) || 0
    const price = Number(form.deal_price) || 0
    const amount = Math.max(0, value - price)
    const pct = value > 0 ? Math.round((amount / value) * 100) : 0
    return { amount, pct }
  }, [form.deal_value, form.deal_price])

  const parentCategories = useMemo(
    () => categories.filter((c) => isRootCategory(c)),
    [categories]
  )

  const subCategories = useMemo(() => {
    const parentId = Number(form.category_id) || 0
    if (!parentId) return []
    return categories.filter((c) => Number(c.main_category_id) === parentId)
  }, [categories, form.category_id])

  const resetImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview('')
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    resetImage()
    setOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm(mapRowToForm(row))
    resetImage()
    setImagePreview(productImageUrl(row.deal_key, Date.now()))
    setOpen(true)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => {
      if (name === 'category_id') {
        const parentId = Number(value) || 0
        const stillValid = categories.some(
          (c) =>
            Number(c.category_id ?? c.id) === Number(f.sub_category_id) &&
            Number(c.main_category_id) === parentId
        )
        return {
          ...f,
          category_id: value,
          sub_category_id: stillValid ? f.sub_category_id : '',
        }
      }
      return { ...f, [name]: value }
    })
  }

  const onImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const buildPayload = () => {
    const deal_value = Number(form.deal_value) || 0
    const deal_price =
      form.deal_price === '' || form.deal_price == null
        ? deal_value
        : Number(form.deal_price) || 0
    const category_id = Number(form.category_id) || 0
    const sub_category_id = Number(form.sub_category_id) || 0
    const linkedIds = [category_id, sub_category_id].filter(Boolean)

    return {
      deal_title: form.deal_title.trim(),
      deal_title_french: form.deal_title_french.trim() || form.deal_title.trim(),
      url_title: form.url_title.trim(),
      deal_key: form.deal_key.trim(),
      deal_description: form.deal_description,
      deal_description_french: form.deal_description_french,
      category_id,
      category_ids: linkedIds.join(','),
      sub_category_id,
      sec_category_id: 0,
      third_category_id: 0,
      deal_value,
      deal_price,
      user_limit_quantity: Number(form.user_limit_quantity) || 0,
      quantity: Number(form.user_limit_quantity) || 0,
      deal_status: Number(form.deal_status),
      delivery_period: form.delivery_period,
      brand_id: Number(form.brand_id) || 1,
      brand_names: form.brand_names,
      tags: form.tags,
      related_products: form.related_products,
      having_size_color: Number(form.having_size_color) || 0,
      shipping: Number(form.shipping) || 0,
      meta_description: form.meta_description,
      meta_keywords: form.meta_keywords,
      meta_description_french: form.meta_description_french,
      meta_keywords_french: form.meta_keywords_french,
      terms_conditions: form.terms_conditions,
    }
  }

  const save = async () => {
    if (!form.deal_title.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    const payload = buildPayload()
    const id = editing?.deal_id ?? editing?.id
    const res = editing
      ? await productsApi.update(id, payload)
      : await productsApi.create(payload)

    if (!res.ok) {
      setSaving(false)
      return
    }

    const savedId = res.data?.deal_id ?? id
    const dealKey = res.data?.deal_key || form.deal_key

    if (imageFile && savedId) {
      const up = await productsApi.uploadImage(savedId, imageFile)
      if (!up.ok) {
        setSaving(false)
        toast.error('Product saved, but image upload failed')
        setOpen(false)
        load()
        return
      }
      setImgBust(Date.now())
    }

    setSaving(false)
    toast.success(editing ? 'Product updated' : 'Product created')
    setOpen(false)
    if (dealKey) setImgBust(Date.now())
    load()
  }

  const remove = async (row) => {
    if (!window.confirm('Deactivate this product?')) return
    const id = row.deal_id ?? row.id
    const res = await productsApi.remove(id)
    if (res.ok) {
      toast.success('Product deactivated')
      load()
    }
  }

  const catName = (id) => {
    const c = categories.find((x) => (x.category_id ?? x.id) === Number(id))
    return c?.category_name || id || '—'
  }

  const categoryLabel = (r) => {
    const parent = catName(r.category_id)
    const subId = Number(r.sub_category_id)
    if (!subId) return parent
    return `${parent} / ${catName(subId)}`
  }

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (r) =>
        r.deal_key ? (
          <img
            className="thumb-img"
            src={productImageUrl(r.deal_key, imgBust)}
            alt=""
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden'
            }}
          />
        ) : (
          '—'
        ),
    },
    {
      key: 'deal_id',
      header: 'ID',
      render: (r) => r.deal_id ?? r.id,
    },
    {
      key: 'deal_title',
      header: 'Title',
      render: (r) => r.deal_title || '—',
    },
    {
      key: 'deal_value',
      header: 'Original',
      render: (r) => formatMoney(r.deal_value),
    },
    {
      key: 'deal_price',
      header: 'Sale price',
      render: (r) => formatMoney(r.deal_price),
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (r) => r.user_limit_quantity ?? r.stock ?? '—',
    },
    {
      key: 'category_id',
      header: 'Category',
      render: (r) => categoryLabel(r),
    },
    {
      key: 'deal_status',
      header: 'Status',
      render: (r) =>
        isActiveStatus(r.deal_status) ? (
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
            <label>Product image</label>
            <div className="image-upload">
              {imagePreview ? (
                <img className="image-preview" src={imagePreview} alt="Product preview" />
              ) : (
                <div className="image-preview placeholder">No image</div>
              )}
              <div>
                <input type="file" accept="image/*" onChange={onImageChange} />
                <p className="field-hint">
                  Uploads as {'{deal_key}_1.png'} into product image sizes (1000×800, 160×180, 80×80).
                </p>
              </div>
            </div>
          </div>

          <div className="form-field">
            <label>Title (EN)</label>
            <input name="deal_title" value={form.deal_title} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Title (AR)</label>
            <input
              name="deal_title_french"
              value={form.deal_title_french}
              onChange={onChange}
            />
          </div>

          <div className="form-field">
            <label>URL slug</label>
            <input
              name="url_title"
              value={form.url_title}
              onChange={onChange}
              placeholder="auto from title if empty"
            />
          </div>
          <div className="form-field">
            <label>Deal key (image filename base)</label>
            <input
              name="deal_key"
              value={form.deal_key}
              onChange={onChange}
              placeholder="auto if empty"
              disabled={!!editing}
            />
          </div>

          <div className="form-field full">
            <label>Description (EN)</label>
            <textarea
              name="deal_description"
              value={form.deal_description}
              onChange={onChange}
            />
          </div>
          <div className="form-field full">
            <label>Description (AR)</label>
            <textarea
              name="deal_description_french"
              value={form.deal_description_french}
              onChange={onChange}
            />
          </div>

          <div className="form-field">
            <label>Original price (MRP)</label>
            <input
              name="deal_value"
              type="number"
              step="0.001"
              min="0"
              value={form.deal_value}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Sale / discount price</label>
            <input
              name="deal_price"
              type="number"
              step="0.001"
              min="0"
              value={form.deal_price}
              onChange={onChange}
            />
          </div>
          <div className="form-field full">
            <p className="field-hint">
              Savings: {formatMoney(savings.amount)} ({savings.pct}%) — saved as deal_savings /
              deal_percentage
            </p>
          </div>

          <div className="form-field">
            <label>Stock (user limit qty)</label>
            <input
              name="user_limit_quantity"
              type="number"
              min="0"
              value={form.user_limit_quantity}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Status</label>
            <select name="deal_status" value={form.deal_status} onChange={onChange}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>

          <div className="form-field">
            <label>Category</label>
            <select name="category_id" value={form.category_id} onChange={onChange}>
              <option value="">Select category</option>
              {parentCategories.map((c) => (
                <option key={c.category_id ?? c.id} value={c.category_id ?? c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label>Sub category</label>
            <select
              name="sub_category_id"
              value={form.sub_category_id}
              onChange={onChange}
              disabled={!form.category_id}
            >
              <option value="">
                {form.category_id
                  ? subCategories.length
                    ? 'Select sub category'
                    : 'No sub categories for this category'
                  : 'Select category first'}
              </option>
              {subCategories.map((c) => (
                <option key={c.category_id ?? c.id} value={c.category_id ?? c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
            <p className="field-hint">
              Sub categories are linked via category.main_category_id → parent category_id
            </p>
          </div>

          <div className="form-field">
            <label>Brand name</label>
            <input name="brand_names" value={form.brand_names} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Brand ID</label>
            <input name="brand_id" type="number" value={form.brand_id} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Delivery period</label>
            <input name="delivery_period" value={form.delivery_period} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Shipping fee</label>
            <input
              name="shipping"
              type="number"
              step="0.001"
              value={form.shipping}
              onChange={onChange}
            />
          </div>

          <div className="form-field">
            <label>Has size / color</label>
            <select
              name="having_size_color"
              value={form.having_size_color}
              onChange={onChange}
            >
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </div>
          <div className="form-field">
            <label>Tags (comma separated)</label>
            <input name="tags" value={form.tags} onChange={onChange} />
          </div>
          <div className="form-field full">
            <label>Related product IDs (comma separated)</label>
            <input
              name="related_products"
              value={form.related_products}
              onChange={onChange}
            />
          </div>

          <div className="form-field full">
            <label>Meta description (EN)</label>
            <textarea
              name="meta_description"
              value={form.meta_description}
              onChange={onChange}
            />
          </div>
          <div className="form-field full">
            <label>Meta keywords (EN)</label>
            <input name="meta_keywords" value={form.meta_keywords} onChange={onChange} />
          </div>
          <div className="form-field full">
            <label>Meta description (AR)</label>
            <textarea
              name="meta_description_french"
              value={form.meta_description_french}
              onChange={onChange}
            />
          </div>
          <div className="form-field full">
            <label>Meta keywords (AR)</label>
            <input
              name="meta_keywords_french"
              value={form.meta_keywords_french}
              onChange={onChange}
            />
          </div>
          <div className="form-field full">
            <label>Terms &amp; conditions</label>
            <textarea
              name="terms_conditions"
              value={form.terms_conditions}
              onChange={onChange}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
