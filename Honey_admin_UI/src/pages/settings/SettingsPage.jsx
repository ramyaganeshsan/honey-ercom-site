import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { settingsApi } from '../../api/adminApi'

const FIELDS = [
  { name: 'site_name', label: 'Site name' },
  { name: 'site_name_french', label: 'Site name (AR)' },
  { name: 'title', label: 'Page title' },
  { name: 'contact_email', label: 'Contact email' },
  { name: 'webmaster_email', label: 'Webmaster email' },
  { name: 'phone1', label: 'Phone' },
  { name: 'address1', label: 'Address' },
  { name: 'currency_code', label: 'Currency code' },
  { name: 'currency_symbol', label: 'Currency symbol' },
  { name: 'tax_percentage', label: 'Tax %', type: 'number' },
  { name: 'flat_shipping', label: 'Flat shipping', type: 'number' },
  { name: 'facebook_page', label: 'Facebook' },
  { name: 'instagram_page', label: 'Instagram' },
  { name: 'twitter_page', label: 'Twitter / X' },
  { name: 'meta_keywords', label: 'Meta keywords', full: true },
  { name: 'meta_description', label: 'Meta description', full: true, textarea: true },
]

export default function SettingsPage() {
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const res = await settingsApi.get()
      if (!alive) return
      const data = res.data || {}
      setForm(typeof data === 'object' ? data : {})
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  const onChange = (e) => {
    const { name, value, type } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    const res = await settingsApi.update(form)
    setSaving(false)
    if (res.ok) {
      toast.success('Settings saved')
      if (res.data) setForm(res.data)
    }
  }

  if (loading) return <div className="loading-block">Loading settings…</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p>Site-wide configuration</p>
        </div>
      </div>

      <form className="panel" onSubmit={save}>
        <div className="panel-body">
          <div className="form-grid">
            {FIELDS.map((field) => (
              <div
                className={`form-field${field.full ? ' full' : ''}`}
                key={field.name}
              >
                <label htmlFor={field.name}>{field.label}</label>
                {field.textarea ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={form[field.name] ?? ''}
                    onChange={onChange}
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type || 'text'}
                    value={form[field.name] ?? ''}
                    onChange={onChange}
                  />
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
