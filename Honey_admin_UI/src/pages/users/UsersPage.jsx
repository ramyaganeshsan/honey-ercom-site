import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { usersApi } from '../../api/adminApi'
import DataTable from '../../components/DataTable'
import { formatDate, isActiveStatus, pickList } from '../../utils/format'

export default function UsersPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const res = await usersApi.list({ search: q || undefined, page: 1, limit: 50 })
    setRows(pickList(res.data))
    setLoading(false)
  }, [q])

  useEffect(() => {
    load()
  }, [load])

  const toggleBlock = async (user) => {
    const id = user.user_id ?? user.id
    const blocked = !isActiveStatus(user.user_status)
    const res = blocked
      ? await usersApi.unblock(id)
      : await usersApi.block(id)
    if (res.ok) {
      toast.success(blocked ? 'User unblocked' : 'User blocked')
      load()
    }
  }

  const columns = [
    {
      key: 'user_id',
      header: 'ID',
      render: (r) => r.user_id ?? r.id ?? '—',
    },
    {
      key: 'name',
      header: 'Name',
      render: (r) =>
        [r.firstname, r.lastname].filter(Boolean).join(' ') || r.name || '—',
    },
    { key: 'email', header: 'Email' },
    {
      key: 'phone_number',
      header: 'Phone',
      render: (r) => r.phone_number || r.phone || '—',
    },
    {
      key: 'user_status',
      header: 'Status',
      render: (r) =>
        isActiveStatus(r.user_status) ? (
          <span className="badge badge-ok">Active</span>
        ) : (
          <span className="badge badge-off">Blocked</span>
        ),
    },
    {
      key: 'joined_date',
      header: 'Joined',
      render: (r) => formatDate(r.joined_date || r.created_at),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="row-actions">
          <button
            type="button"
            className={`btn btn-sm ${
              isActiveStatus(r.user_status) ? 'btn-danger' : 'btn-success'
            }`}
            onClick={() => toggleBlock(r)}
          >
            {isActiveStatus(r.user_status) ? 'Block' : 'Unblock'}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Users</h2>
          <p>Search customers and manage account access</p>
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setQ(search.trim())
          }}
        />
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setQ(search.trim())}
        >
          Search
        </button>
        <button type="button" className="btn btn-ghost" onClick={load}>
          Refresh
        </button>
      </div>

      <div className="panel">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.user_id ?? r.id}
          loading={loading}
        />
      </div>
    </div>
  )
}
