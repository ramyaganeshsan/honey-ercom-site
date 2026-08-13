import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { bannersApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Field from '../../components/Field'
import Modal from '../../components/Modal'
import { bannerImageUrl } from '../../utils/assets'
import { collectErrors, firstError, requiredText } from '../../utils/form'
import { isActiveStatus, pickList } from '../../utils/format'

const emptyForm = {
  image_title: '',
  image_title_french: '',
  image_info: '',
  image_info_french: '',
  redirect_url: '/products',
  position: 0,
  home: 1,
  status: 1,
  product: 0,
}

export default function BannersPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imgBust, setImgBust] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setListError('')
    const res = await bannersApi.list({ page: 1, limit: 50 })
    if (!res.ok) {
      setRows([])
      setListError(res.message || 'Failed to load banners')
    } else {
      setRows(pickList(res.data))
    }
    setLoading(false)
  }, [])

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

  const resetImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview('')
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

  const openEdit = (row) => {
    setEditing(row)
    setForm({
      image_title: row.image_title || '',
      image_title_french: row.image_title_french || '',
      image_info: row.image_info || '',
      image_info_french: row.image_info_french || '',
      redirect_url: row.redirect_url || '/products',
      position: row.position ?? 0,
      home: row.home ?? 1,
      status: row.status ?? 1,
      product: row.product ?? 0,
    })
    setErrors({})
    setFormError('')
    resetImage()
    const id = row.banner_id ?? row.id
    setImagePreview(bannerImageUrl(id, Date.now()))
    setOpen(true)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({
      ...f,
      [name]:
        name === 'position' ||
        name === 'home' ||
        name === 'status' ||
        name === 'product'
          ? Number(value)
          : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setFormError('')
  }

  const onImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setErrors((prev) => ({ ...prev, image: '' }))
  }

  const save = async () => {
    const next = collectErrors({
      image_title: requiredText(form.image_title, 'Title (EN)'),
      image: !editing && !imageFile ? 'Banner image is required' : '',
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
    const id = editing?.banner_id ?? editing?.id
    const res = editing
      ? await bannersApi.update(id, form)
      : await bannersApi.create(form)

    if (!res.ok) {
      setSaving(false)
      setFormError(res.message || 'Failed to save banner')
      return
    }

    const savedId = res.data?.banner_id ?? id
    if (imageFile) {
      if (!savedId) {
        setSaving(false)
        toast.error('Banner saved, but image could not be uploaded (missing ID)')
        setOpen(false)
        load()
        return
      }
      const up = await bannersApi.uploadImage(savedId, imageFile)
      if (!up.ok) {
        setSaving(false)
        toast.error(up.message || 'Banner saved, but image upload failed')
        setOpen(false)
        load()
        return
      }
      setImgBust(Date.now())
    }

    setSaving(false)
    toast.success(editing ? 'Banner updated successfully' : 'Banner created successfully')
    setOpen(false)
    load()
  }

  const remove = async (row) => {
    if (!window.confirm('Deactivate this banner?')) return
    const id = row.banner_id ?? row.id
    const res = await bannersApi.remove(id)
    if (res.ok) {
      toast.success('Banner deactivated')
      load()
    }
  }

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (r) => {
        const id = r.banner_id ?? r.id
        return (
          <img
            className="thumb-img thumb-wide"
            src={bannerImageUrl(id, imgBust)}
            alt=""
            onError={(e) => {
              e.currentTarget.style.visibility = 'hidden'
            }}
          />
        )
      },
    },
    {
      key: 'banner_id',
      header: 'ID',
      render: (r) => r.banner_id ?? r.id,
    },
    { key: 'image_title', header: 'Title' },
    { key: 'redirect_url', header: 'URL' },
    { key: 'position', header: 'Position' },
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
        title={editing ? 'Edit banner' : 'New banner'}
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
              {saving ? 'Saving…' : 'Save banner'}
            </button>
          </>
        }
      >
        <p className="legend-required">
          <span className="req-star">*</span> Required fields
        </p>
        {formError ? <div className="form-alert">{formError}</div> : null}

        <div className="form-grid">
          <Field
            label="Banner image"
            required={!editing}
            className="full"
            error={errors.image}
            hint="Saved as {banner_id}.png under cloud/uploads/banner_images/"
          >
            <div className="image-upload">
              {imagePreview ? (
                <img className="image-preview wide" src={imagePreview} alt="Banner preview" />
              ) : (
                <div className="image-preview wide placeholder">No image</div>
              )}
              <div>
                <input type="file" accept="image/*" onChange={onImageChange} />
              </div>
            </div>
          </Field>

          <Field label="Title (EN)" required error={errors.image_title}>
            <input name="image_title" value={form.image_title} onChange={onChange} />
          </Field>
          <Field label="Title (AR)">
            <input
              name="image_title_french"
              value={form.image_title_french}
              onChange={onChange}
            />
          </Field>
          <Field label="Info (EN)" className="full">
            <textarea name="image_info" value={form.image_info} onChange={onChange} />
          </Field>
          <Field label="Info (AR)" className="full">
            <textarea
              name="image_info_french"
              value={form.image_info_french}
              onChange={onChange}
            />
          </Field>
          <Field label="Redirect URL">
            <input name="redirect_url" value={form.redirect_url} onChange={onChange} />
          </Field>
          <Field label="Linked product ID">
            <input name="product" type="number" value={form.product} onChange={onChange} />
          </Field>
          <Field label="Position">
            <input name="position" type="number" value={form.position} onChange={onChange} />
          </Field>
          <Field label="Home banner" required>
            <select name="home" value={form.home} onChange={onChange}>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </Field>
          <Field label="Status" required>
            <select name="status" value={form.status} onChange={onChange}>
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
          <h2>Banners</h2>
          <p>Homepage and promotional banner images</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add banner
        </button>
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.banner_id ?? r.id}
          loading={loading}
          error={listError}
          onRetry={load}
          emptyMessage="No banners yet. Add your first banner."
        />
      </div>
    </div>
  )
}
