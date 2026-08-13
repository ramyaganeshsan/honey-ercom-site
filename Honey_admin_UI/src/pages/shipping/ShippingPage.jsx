import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { shippingApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import { isActiveStatus, pickList } from '../../utils/format'

const TABS = [
  { id: 'countries', label: 'Countries' },
  { id: 'states', label: 'States' },
  { id: 'cities', label: 'Cities' },
]

const EMPTY = {
  countries: {
    country_name: '',
    country_name_french: '',
    country_code: '',
    currency_code: 'KWD',
    currency_symbol: 'KD',
    country_status: 1,
  },
  states: {
    state_name: '',
    state_name_arabic: '',
    state_url: '',
    state_country_id: 1,
    statestatus: 1,
  },
  cities: {
    city_name: '',
    city_name_french: '',
    city_url: '',
    country_id: 1,
    stateid: 1,
    delivery_charge: 0,
    city_latitude: '0',
    city_longitude: '0',
    city_status: 1,
  },
}

export default function ShippingPage() {
  const [tab, setTab] = useState('countries')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY.countries)
  const [saving, setSaving] = useState(false)

  const api = shippingApi[tab]

  const load = useCallback(async () => {
    setLoading(true)
    const res = await shippingApi[tab].list({ page: 1, limit: 100 })
    setRows(pickList(res.data))
    setLoading(false)
  }, [tab])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...EMPTY[tab] })
    setOpen(true)
  }

  const openEdit = (row) => {
    setEditing(row)
    setForm({ ...EMPTY[tab], ...row })
    setOpen(true)
  }

  const onChange = (e) => {
    const { name, value, type } = e.target
    setForm((f) => ({
      ...f,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  const idOf = (row) => {
    if (!row) return null
    if (tab === 'countries') return row.country_id ?? row.id
    if (tab === 'states') return row.state_id ?? row.id
    return row.city_id ?? row.id
  }

  const save = async () => {
    setSaving(true)
    const id = idOf(editing)
    const res = editing ? await api.update(id, form) : await api.create(form)
    setSaving(false)
    if (res.ok) {
      toast.success(editing ? 'Updated' : 'Created')
      setOpen(false)
      load()
    }
  }

  const remove = async (row) => {
    if (!window.confirm('Delete this record?')) return
    const res = await api.remove(idOf(row))
    if (res.ok) {
      toast.success('Deleted')
      load()
    }
  }

  const columnsByTab = {
    countries: [
      { key: 'country_id', header: 'ID', render: (r) => r.country_id ?? r.id },
      { key: 'country_name', header: 'Name' },
      { key: 'country_code', header: 'Code' },
      { key: 'currency_code', header: 'Currency' },
      {
        key: 'country_status',
        header: 'Status',
        render: (r) =>
          isActiveStatus(r.country_status) ? (
            <span className="badge badge-ok">Active</span>
          ) : (
            <span className="badge badge-off">Inactive</span>
          ),
      },
    ],
    states: [
      { key: 'state_id', header: 'ID', render: (r) => r.state_id ?? r.id },
      { key: 'state_name', header: 'Name' },
      { key: 'state_country_id', header: 'Country ID' },
      {
        key: 'statestatus',
        header: 'Status',
        render: (r) =>
          isActiveStatus(r.statestatus) ? (
            <span className="badge badge-ok">Active</span>
          ) : (
            <span className="badge badge-off">Inactive</span>
          ),
      },
    ],
    cities: [
      { key: 'city_id', header: 'ID', render: (r) => r.city_id ?? r.id },
      { key: 'city_name', header: 'Name' },
      { key: 'stateid', header: 'State ID' },
      { key: 'delivery_charge', header: 'Delivery' },
      {
        key: 'city_status',
        header: 'Status',
        render: (r) =>
          isActiveStatus(r.city_status) ? (
            <span className="badge badge-ok">Active</span>
          ) : (
            <span className="badge badge-off">Inactive</span>
          ),
      },
    ],
  }

  const columns = [
    ...columnsByTab[tab],
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
        title={`${editing ? 'Edit' : 'New'} ${tab.slice(0, -1)}`}
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
          {Object.keys(EMPTY[tab]).map((key) => (
            <div className="form-field" key={key}>
              <label>{key.replace(/_/g, ' ')}</label>
              <input
                name={key}
                type={typeof EMPTY[tab][key] === 'number' ? 'number' : 'text'}
                value={form[key] ?? ''}
                onChange={onChange}
              />
            </div>
          ))}
        </div>
      </Modal>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Shipping</h2>
          <p>Countries, states, and cities for delivery</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Add {tab.slice(0, -1)}
        </button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => idOf(r)}
          loading={loading}
        />
      </div>
    </div>
  )
}
