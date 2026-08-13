import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { bannersApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { bannerImageUrl } from '../../utils/assets'
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
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [imgBust, setImgBust] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await bannersApi.list({ page: 1, limit: 50 })
    setRows(pickList(res.data))
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

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
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

  const save = async () => {
    if (!form.image_title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!editing && !imageFile) {
      toast.error('Banner image is required')
      return
    }

    setSaving(true)
    const id = editing?.banner_id ?? editing?.id
    const res = editing
      ? await bannersApi.update(id, form)
      : await bannersApi.create(form)

    if (!res.ok) {
      setSaving(false)
      return
    }

    const savedId = res.data?.banner_id ?? id
    if (imageFile && savedId) {
      const up = await bannersApi.uploadImage(savedId, imageFile)
      if (!up.ok) {
        setSaving(false)
        toast.error('Banner saved, but image upload failed')
        setOpen(false)
        load()
        return
      }
      setImgBust(Date.now())
    }

    setSaving(false)
    toast.success(editing ? 'Banner updated' : 'Banner created')
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
        />
      </div>

      <Modal
        open={open}
        title={editing ? 'Edit banner' : 'New banner'}
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
            <label>Banner image</label>
            <div className="image-upload">
              {imagePreview ? (
                <img className="image-preview wide" src={imagePreview} alt="Banner preview" />
              ) : (
                <div className="image-preview wide placeholder">No image</div>
              )}
              <div>
                <input type="file" accept="image/*" onChange={onImageChange} />
                <p className="field-hint">
                  Saved as {'{banner_id}.png'} under cloud/uploads/banner_images/
                </p>
              </div>
            </div>
          </div>

          <div className="form-field">
            <label>Title (EN)</label>
            <input name="image_title" value={form.image_title} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Title (AR)</label>
            <input
              name="image_title_french"
              value={form.image_title_french}
              onChange={onChange}
            />
          </div>
          <div className="form-field full">
            <label>Info (EN)</label>
            <textarea name="image_info" value={form.image_info} onChange={onChange} />
          </div>
          <div className="form-field full">
            <label>Info (AR)</label>
            <textarea
              name="image_info_french"
              value={form.image_info_french}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Redirect URL</label>
            <input name="redirect_url" value={form.redirect_url} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Linked product ID</label>
            <input name="product" type="number" value={form.product} onChange={onChange} />
          </div>
          <div className="form-field">
            <label>Position</label>
            <input
              name="position"
              type="number"
              value={form.position}
              onChange={onChange}
            />
          </div>
          <div className="form-field">
            <label>Home banner</label>
            <select name="home" value={form.home} onChange={onChange}>
              <option value={1}>Yes</option>
              <option value={0}>No</option>
            </select>
          </div>
          <div className="form-field">
            <label>Status</label>
            <select name="status" value={form.status} onChange={onChange}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  )
}
