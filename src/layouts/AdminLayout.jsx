import { Link, NavLink, Outlet } from 'react-router'
import '../pages/admin/admin.css'

function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" to="/admin" aria-label="AutoMarket, panel">
          <span className="admin-brand-mark" aria-hidden="true">
            A
          </span>
          <span>AutoMarket</span>
        </Link>

        <p className="admin-sidebar-label">Administración</p>
        <nav className="admin-sidebar-nav" aria-label="Navegación administrativa">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-sidebar-link${isActive ? ' is-active' : ''}`
            }
          >
            <span className="admin-nav-indicator" aria-hidden="true" />
            Inventario y estadísticas
          </NavLink>
          <NavLink
            to="/admin/ordenes"
            className={({ isActive }) =>
              `admin-sidebar-link${isActive ? ' is-active' : ''}`
            }
          >
            <span className="admin-nav-indicator" aria-hidden="true" />
            Solicitudes de compra
          </NavLink>
        </nav>

        <Link className="admin-store-link" to="/">
          Volver al sitio
        </Link>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
