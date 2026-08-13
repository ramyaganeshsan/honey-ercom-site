import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/users', label: 'Users' },
  { to: '/categories', label: 'Categories' },
  { to: '/products', label: 'Products' },
  { to: '/orders', label: 'Orders' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/promocodes', label: 'Promocodes' },
  { to: '/cms', label: 'CMS' },
  { to: '/banners', label: 'Banners' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/settings', label: 'Settings' },
  { to: '/shipping', label: 'Shipping' },
  { to: '/contact', label: 'Contact' },
  { to: '/reports', label: 'Reports' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>Thunayan Honey</h1>
        <p>Admin Panel</p>
      </div>
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `nav-link${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-dot" aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
