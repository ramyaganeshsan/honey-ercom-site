import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { authApi } from '../api/adminApi'
import { clearToken } from '../api/client'

const TITLES = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/categories': 'Categories',
  '/products': 'Products',
  '/orders': 'Orders',
  '/transactions': 'Transactions',
  '/promocodes': 'Promocodes',
  '/cms': 'CMS Pages',
  '/banners': 'Banners',
  '/reviews': 'Reviews',
  '/settings': 'Settings',
  '/shipping': 'Shipping',
  '/contact': 'Contact Inbox',
  '/reports': 'Reports',
}

function titleFor(pathname) {
  if (TITLES[pathname]) return TITLES[pathname]
  const base = '/' + pathname.split('/').filter(Boolean)[0]
  return TITLES[base] || 'Admin'
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const res = await authApi.me()
      if (!alive) return
      if (res.ok && res.data) {
        setAdmin(res.data.user || res.data)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  const name =
    admin?.firstname ||
    admin?.name ||
    admin?.email ||
    'Admin'

  const initial = String(name).charAt(0).toUpperCase()

  const logout = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <header className="topbar">
          <div className="topbar-title">{titleFor(location.pathname)}</div>
          <div className="topbar-right">
            <div className="admin-chip">
              <span className="admin-avatar">{initial}</span>
              <span>{name}</span>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        <main className="page-content">
          <Outlet context={{ admin }} />
        </main>
      </div>
    </div>
  )
}
