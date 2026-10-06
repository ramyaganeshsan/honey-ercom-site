import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { categoriesApi, productsApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Field from '../../components/Field'
import Modal from '../../components/Modal'
import { productImageUrl } from '../../utils/assets'
import {
  collectErrors,
  firstError,
  requiredNumber,
  requiredSelect,
  requiredText,
} from '../../utils/form'
import { formatMoney, isActiveStatus, pickList } from '../../utils/format'

const MAX_PRODUCT_IMAGES = 8

const BULK_COLUMNS = [
  'Item No#',
  'Product Name (EN)',
  'Product Name (AR)',
  'Description (EN)',
  'Description (AR)',
  'Material',
  'Dimension',
  'Original Price',
  'Discount Price',
  'Stock',
  'Image_1 (main)',
  'Image_2 … Image_8',
]

function emptyImageSlots() {
  return Array.from({ length: MAX_PRODUCT_IMAGES }, (_, i) => ({
    index: i + 1,
    file: null,
    preview: '',
  }))
}

const emptyForm = {
  item_no: '',
  deal_title: '',
  deal_title_french: '',
  url_title: '',
  deal_key: '',
  deal_description: '',
  deal_description_french: '',
  material: '',
  dimension: '',
  category_id: '',
  deal_value: '',
  deal_price: '',
  user_limit_quantity: '',
  deal_status: 1,
  delivery_period: '2-3 days',
  brand_id: 1,
  brand_names: 'GOZO HOME',
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
    item_no: row.item_no || '',
    deal_title: row.deal_title || '',
    deal_title_french: row.deal_title_french || '',
    url_title: row.url_title || '',
    deal_key: row.deal_key || '',
    deal_description: row.deal_description || '',
    deal_description_french: row.deal_description_french || '',
    material: row.material || '',
    dimension: row.dimension || '',
    category_id: row.category_id ?? '',
    deal_value: row.deal_value ?? '',
    deal_price: row.deal_price ?? '',
    user_limit_quantity: row.user_limit_quantity ?? row.stock ?? '',
    deal_status: row.deal_status ?? 1,
    delivery_period: row.delivery_period || '2-3 days',
    brand_id: row.brand_id ?? 1,
    brand_names: row.brand_names || 'GOZO HOME',
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

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function ProductsPage() {
  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageSlots, setImageSlots] = useState(emptyImageSlots)
  const [imgBust, setImgBust] = useState(0)

  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkCategoryId, setBulkCategoryId] = useState('')
  const [bulkExcel, setBulkExcel] = useState(null)
  const [bulkUploading, setBulkUploading] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)
  const [bulkError, setBulkError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setListError('')
    const [prodRes, catRes] = await Promise.all([
      productsApi.list({ search: q || undefined, page: 1, limit: 50 }),
      categoriesApi.list({ page: 1, limit: 200 }),
    ])
    if (!prodRes.ok) {
      setRows([])
      setListError(prodRes.message || 'Failed to load products')
    } else {
      setRows(pickList(prodRes.data))
    }
    if (catRes.ok) setCategories(pickList(catRes.data))
    setLoading(false)
  }, [q])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    return () => {
      imageSlots.forEach((slot) => {
        if (slot.preview && slot.preview.startsWith('blob:')) {
          URL.revokeObjectURL(slot.preview)
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const resetImage = () => {
    setImageSlots((prev) => {
      prev.forEach((slot) => {
        if (slot.preview && slot.preview.startsWith('blob:')) {
          URL.revokeObjectURL(slot.preview)
        }
      })
      return emptyImageSlots()
    })
  }

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
    resetImage()
    setOpen(true)
  }

  const openBulk = () => {
    setBulkCategoryId('')
    setBulkExcel(null)
    setBulkResult(null)
    setBulkError('')
    setBulkOpen(true)
  }

  const closeBulk = () => {
    if (bulkUploading) return
    setBulkOpen(false)
  }

  const openEdit = async (row) => {
    setEditing(row)
    setForm(mapRowToForm(row))
    setErrors({})
    setFormError('')
    resetImage()
    setOpen(true)

    const dealId = row.deal_id ?? row.id
    const bust = Date.now()
    if (dealId) {
      const detail = await productsApi.get(dealId)
      const indexes =
        detail.ok && Array.isArray(detail.data?.image_indexes)
          ? detail.data.image_indexes
          : [1]
      setImageSlots(
        emptyImageSlots().map((slot) => ({
          ...slot,
          preview: indexes.includes(slot.index)
            ? productImageUrl(row.deal_key, bust, slot.index)
            : '',
        }))
      )
    } else if (row.deal_key) {
      setImageSlots(
        emptyImageSlots().map((slot, i) => ({
          ...slot,
          preview: i === 0 ? productImageUrl(row.deal_key, bust, 1) : '',
        }))
      )
    }
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setFormError('')
  }

  const onImageSlotChange = (slotIndex, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageSlots((prev) =>
      prev.map((slot) => {
        if (slot.index !== slotIndex) return slot
        if (slot.preview && slot.preview.startsWith('blob:')) {
          URL.revokeObjectURL(slot.preview)
        }
        return {
          ...slot,
          file,
          preview: URL.createObjectURL(file),
        }
      })
    )
    setErrors((prev) => ({ ...prev, image: '' }))
    e.target.value = ''
  }

  const clearImageSlot = (slotIndex) => {
    setImageSlots((prev) =>
      prev.map((slot) => {
        if (slot.index !== slotIndex) return slot
        if (slot.preview && slot.preview.startsWith('blob:')) {
          URL.revokeObjectURL(slot.preview)
        }
        return { ...slot, file: null, preview: '' }
      })
    )
  }

  const buildPayload = () => {
    const deal_value = Number(form.deal_value) || 0
    const deal_price =
      form.deal_price === '' || form.deal_price == null
        ? deal_value
        : Number(form.deal_price) || 0
    const category_id = Number(form.category_id) || 0

    return {
      item_no: form.item_no.trim(),
      deal_title: form.deal_title.trim(),
      deal_title_french: form.deal_title_french.trim() || form.deal_title.trim(),
      url_title: form.url_title.trim(),
      deal_key: form.deal_key.trim(),
      deal_description: form.deal_description,
      deal_description_french: form.deal_description_french,
      material: form.material.trim(),
      dimension: form.dimension.trim(),
      category_id,
      category_ids: category_id ? String(category_id) : '',
      sub_category_id: 0,
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

  const validate = () => {
    const next = collectErrors({
      category_id: requiredSelect(form.category_id, 'Category'),
      deal_title: requiredText(form.deal_title, 'Title (EN)'),
      deal_value: requiredNumber(form.deal_value, 'Original price', { min: 0 }),
      deal_price: requiredNumber(form.deal_price, 'Sale price', { min: 0 }),
      user_limit_quantity: requiredNumber(form.user_limit_quantity, 'Stock', {
        min: 0,
      }),
    })
    if (parentCategories.length === 0) {
      next.category_id = 'Create a Category first in Categories menu'
    }
    if (
      form.deal_value !== '' &&
      form.deal_price !== '' &&
      Number(form.deal_price) > Number(form.deal_value)
    ) {
      next.deal_price = 'Sale price cannot be higher than original price'
    }
    return next
  }

  const save = async () => {
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) {
      const msg = firstError(next)
      setFormError(msg)
      toast.error(msg)
      return
    }

    setSaving(true)
    setFormError('')
    const payload = buildPayload()
    const id = editing?.deal_id ?? editing?.id
    const res = editing
      ? await productsApi.update(id, payload)
      : await productsApi.create(payload)

    if (!res.ok) {
      setSaving(false)
      setFormError(res.message || 'Failed to save product')
      return
    }

    const savedId = res.data?.deal_id ?? id
    const pendingUploads = imageSlots.filter((slot) => slot.file)
    if (pendingUploads.length) {
      if (!savedId) {
        setSaving(false)
        toast.error('Product saved, but images could not be uploaded (missing ID)')
        setOpen(false)
        load()
        return
      }
      for (const slot of pendingUploads) {
        const up = await productsApi.uploadImage(savedId, slot.file, slot.index)
        if (!up.ok) {
          setSaving(false)
          toast.error(
            up.message ||
              `Product saved, but image ${slot.index} upload failed`
          )
          setOpen(false)
          load()
          return
        }
      }
      setImgBust(Date.now())
    }

    setSaving(false)
    toast.success(editing ? 'Product updated successfully' : 'Product created successfully')
    setOpen(false)
    setImgBust(Date.now())
    load()
  }

  const remove = async (row) => {
    if (!window.confirm('Deactivate this product? It will be hidden from the storefront.')) {
      return
    }
    const id = row.deal_id ?? row.id
    const res = await productsApi.remove(id)
    if (res.ok) {
      toast.success('Product deactivated')
      load()
    }
  }

  const downloadTemplate = async () => {
    const res = await productsApi.downloadBulkTemplate()
    if (!res.ok) {
      toast.error(res.message || 'Failed to download template')
      return
    }
    downloadBlob(res.data, 'gozo-product-bulk-template.xlsx')
    toast.success('Template downloaded')
  }

  const runBulkUpload = async () => {
    if (!bulkCategoryId) {
      setBulkError('Select a Category first — bulk upload unlocks after that')
      return
    }
    if (!bulkExcel) {
      setBulkError('Choose an Excel (.xlsx) file')
      return
    }
    setBulkUploading(true)
    setBulkError('')
    setBulkResult(null)
    const res = await productsApi.bulkUpload(bulkCategoryId, bulkExcel)
    setBulkUploading(false)
    if (!res.ok) {
      setBulkError(res.message || 'Bulk upload failed')
      toast.error(res.message || 'Bulk upload failed')
      return
    }
    setBulkResult(res.data)
    const created = res.data?.created_count || 0
    const skipped = res.data?.skipped_count || 0
    toast.success(
      created
        ? `Added ${created} product(s)${skipped ? ` · ${skipped} already in Products (skipped)` : ''}`
        : res.message || 'No new products added'
    )
    load()
  }

  const catName = (id) => {
    const c = categories.find((x) => (x.category_id ?? x.id) === Number(id))
    return c?.category_name || id || '—'
  }

  const categoryLabel = (r) => catName(r.category_id)

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
      key: 'item_no',
      header: 'Item No#',
      render: (r) => r.item_no || '—',
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
        title={editing ? 'Edit product' : 'New product'}
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
              {saving ? 'Saving…' : 'Save product'}
            </button>
          </>
        }
      >
        <p className="legend-required">
          <span className="req-star">*</span> Required fields
        </p>
        {formError ? <div className="form-alert">{formError}</div> : null}

        <div className="flow-steps compact">
          <span className={form.category_id ? 'done' : 'active'}>1. Category</span>
          <span className={form.category_id ? 'active' : ''}>2. Product</span>
        </div>

        <div className="form-grid">
          <Field
            label="1. Category"
            required
            error={errors.category_id}
            hint={
              parentCategories.length === 0 ? (
                <>
                  No categories yet. <Link to="/categories">Create Category first</Link>
                </>
              ) : (
                ''
              )
            }
          >
            <select name="category_id" value={form.category_id} onChange={onChange}>
              <option value="">Select category</option>
              {parentCategories.map((c) => (
                <option key={c.category_id ?? c.id} value={c.category_id ?? c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Item No#"
            hint="Product code you assign. Each Item No# must be unique."
            error={errors.item_no}
          >
            <input
              name="item_no"
              value={form.item_no}
              onChange={onChange}
              placeholder="e.g. GOZO-001"
            />
          </Field>

          <Field
            label="3. Product gallery images (max 8)"
            className="full"
            error={errors.image}
          >
            <div className="image-slots-grid">
              {imageSlots.map((slot) => (
                <div className="image-slot" key={slot.index}>
                  {slot.preview ? (
                    <img
                      className="image-preview"
                      src={slot.preview}
                      alt={`Product image ${slot.index}`}
                    />
                  ) : (
                    <div className="image-preview placeholder">
                      Image {slot.index}
                    </div>
                  )}
                  <div className="image-slot-actions">
                    <label className="btn btn-ghost btn-sm">
                      {slot.preview ? 'Replace' : 'Add'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => onImageSlotChange(slot.index, e)}
                      />
                    </label>
                    {slot.file ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => clearImageSlot(slot.index)}
                      >
                        Undo
                      </button>
                    ) : null}
                  </div>
                  <div className="field-hint">
                    {slot.index === 1 ? 'Main' : `Gallery ${slot.index}`} ·{' '}
                    {`{deal_key}_${slot.index}.png`}
                  </div>
                </div>
              ))}
            </div>
          </Field>

          <Field label="Title (EN)" required error={errors.deal_title}>
            <input name="deal_title" value={form.deal_title} onChange={onChange} />
          </Field>
          <Field label="Title (AR)">
            <input
              name="deal_title_french"
              value={form.deal_title_french}
              onChange={onChange}
            />
          </Field>

          <Field label="URL slug" hint="Auto from title if empty">
            <input name="url_title" value={form.url_title} onChange={onChange} />
          </Field>
          <Field label="Deal key" hint="Image filename base; auto if empty">
            <input
              name="deal_key"
              value={form.deal_key}
              onChange={onChange}
              disabled={!!editing}
            />
          </Field>

          <Field label="Description (EN)" className="full">
            <textarea
              name="deal_description"
              value={form.deal_description}
              onChange={onChange}
            />
          </Field>
          <Field label="Description (AR)" className="full">
            <textarea
              name="deal_description_french"
              value={form.deal_description_french}
              onChange={onChange}
            />
          </Field>

          <Field label="Material">
            <input name="material" value={form.material} onChange={onChange} />
          </Field>
          <Field label="Dimension">
            <input name="dimension" value={form.dimension} onChange={onChange} />
          </Field>

          <Field label="Original price (MRP)" required error={errors.deal_value}>
            <input
              name="deal_value"
              type="number"
              step="0.001"
              min="0"
              value={form.deal_value}
              onChange={onChange}
            />
          </Field>
          <Field label="Sale / discount price" required error={errors.deal_price}>
            <input
              name="deal_price"
              type="number"
              step="0.001"
              min="0"
              value={form.deal_price}
              onChange={onChange}
            />
          </Field>
          <div className="form-field full">
            <p className="field-hint">
              Savings: {formatMoney(savings.amount)} ({savings.pct}%)
            </p>
          </div>

          <Field label="Stock" required error={errors.user_limit_quantity}>
            <input
              name="user_limit_quantity"
              type="number"
              min="0"
              value={form.user_limit_quantity}
              onChange={onChange}
            />
          </Field>
          <Field label="Status" required>
            <select name="deal_status" value={form.deal_status} onChange={onChange}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </Field>

          <Field label="Brand name">
            <input name="brand_names" value={form.brand_names} onChange={onChange} />
          </Field>
          <Field label="Delivery period">
            <input name="delivery_period" value={form.delivery_period} onChange={onChange} />
          </Field>
          <Field label="Shipping fee">
            <input
              name="shipping"
              type="number"
              step="0.001"
              value={form.shipping}
              onChange={onChange}
            />
          </Field>
          <Field label="Has size / color">
            <select
              name="having_size_color"
              value={form.having_size_color}
              onChange={onChange}
            >
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </Field>
          <Field label="Tags (comma separated)">
            <input name="tags" value={form.tags} onChange={onChange} />
          </Field>
          <Field label="Related product IDs" className="full">
            <input
              name="related_products"
              value={form.related_products}
              onChange={onChange}
            />
          </Field>
          <Field label="Meta description (EN)" className="full">
            <textarea
              name="meta_description"
              value={form.meta_description}
              onChange={onChange}
            />
          </Field>
          <Field label="Meta keywords (EN)" className="full">
            <input name="meta_keywords" value={form.meta_keywords} onChange={onChange} />
          </Field>
          <Field label="Terms & conditions" className="full">
            <textarea
              name="terms_conditions"
              value={form.terms_conditions}
              onChange={onChange}
            />
          </Field>
        </div>
      </Modal>
    )
  }

  if (bulkOpen) {
    const bulkReady = Boolean(bulkCategoryId)
    return (
      <Modal
        open
        title="Bulk product upload"
        onClose={closeBulk}
        wide
        busy={bulkUploading}
        footer={
          <>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={closeBulk}
              disabled={bulkUploading}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={runBulkUpload}
              disabled={bulkUploading || !bulkReady || !bulkExcel}
            >
              {bulkUploading ? 'Uploading…' : 'Upload & import'}
            </button>
          </>
        }
      >
        <div className="flow-steps compact">
          <span className={bulkCategoryId ? 'done' : 'active'}>1. Category</span>
          <span className={bulkCategoryId ? (bulkExcel ? 'active' : 'active') : ''}>
            2. Excel with photos
          </span>
        </div>

        {bulkError ? <div className="form-alert">{bulkError}</div> : null}

        <div className="form-grid">
          <Field
            label="1. Category"
            required
            className="full"
            hint="Select a category first — bulk upload unlocks after that. All imported products are assigned to this category."
          >
            <select
              value={bulkCategoryId}
              onChange={(e) => {
                setBulkCategoryId(e.target.value)
                setBulkError('')
              }}
            >
              <option value="">Select category</option>
              {parentCategories.map((c) => (
                <option key={c.category_id ?? c.id} value={c.category_id ?? c.id}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className={`bulk-format-box ${bulkReady ? '' : 'is-disabled'}`}>
          <h3>Excel template</h3>
          <p>
            One product per row. Put EN + AR text, then insert photos in Image_1…Image_8 on
            that same row (Image_1 = main, min 1 / max 8).
          </p>
          <ul className="bulk-columns">
            {BULK_COLUMNS.map((col) => (
              <li key={col}>{col}</li>
            ))}
          </ul>
          <div className="bulk-actions">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={downloadTemplate}
              disabled={!bulkReady || bulkUploading}
            >
              Download Excel template
            </button>
          </div>
        </div>

        <div className="form-grid" style={{ marginTop: 16 }}>
          <Field
            label="Excel file (.xlsx)"
            required
            className="full"
            hint={
              bulkReady
                ? 'Upload the filled template (with pictures in Image_1…Image_8)'
                : 'Select a Category first to enable upload'
            }
          >
            <input
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              disabled={!bulkReady || bulkUploading}
              onChange={(e) => {
                setBulkExcel(e.target.files?.[0] || null)
                setBulkError('')
              }}
            />
            {bulkExcel ? (
              <p className="field-hint">Selected: {bulkExcel.name}</p>
            ) : null}
          </Field>
        </div>

        {bulkResult ? (
          <div className="bulk-result">
            <h3>Import result</h3>
            <p>
              Added <strong>{bulkResult.created_count || 0}</strong>
              {' · '}
              Already in Products (skipped){' '}
              <strong>{bulkResult.skipped_count || 0}</strong>
              {' · '}
              Need fix <strong>{bulkResult.error_count || 0}</strong>
            </p>
            {(bulkResult.skipped || []).length > 0 ? (
              <div className="bulk-result-list">
                <h4>Already in Products (skipped)</h4>
                <ul>
                  {bulkResult.skipped.slice(0, 30).map((s) => (
                    <li key={`${s.row}-${s.item_no}`}>
                      Row {s.row}: Item No# {s.item_no} — {s.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {(bulkResult.errors || []).length > 0 ? (
              <div className="bulk-result-list">
                <h4>Need fix</h4>
                <ul>
                  {bulkResult.errors.slice(0, 30).map((s) => (
                    <li key={`${s.row}-${s.item_no}-${s.message}`}>
                      Row {s.row}
                      {s.item_no ? `: Item No# ${s.item_no}` : ''}: {s.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {(bulkResult.created || []).length > 0 ? (
              <div className="bulk-result-list">
                <h4>Added</h4>
                <ul>
                  {bulkResult.created.slice(0, 30).map((s) => (
                    <li key={`${s.row}-${s.deal_id}`}>
                      Row {s.row}: Item No# {s.item_no} — {s.deal_title}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p>Step 2 — after Category is ready</p>
        </div>
        <div className="page-header-actions">
          <button type="button" className="btn btn-ghost" onClick={openBulk}>
            Bulk upload
          </button>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            Add product
          </button>
        </div>
      </div>

      <div className="flow-steps">
        <Link to="/categories" className="flow-step">
          <strong>1</strong>
          <span>Category</span>
        </Link>
        <span className="flow-step active">
          <strong>2</strong>
          <span>Product</span>
        </span>
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
          error={listError}
          onRetry={load}
          emptyMessage="No products yet. Add a Category first, then add products."
        />
      </div>
    </div>
  )
}
