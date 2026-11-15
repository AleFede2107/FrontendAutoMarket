import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { clearSession, getStoredSession } from '../services/authService.js'
import '../pages/admin/admin.css'

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = getStoredSession()

  useEffect(() => {
    if (!session) {
      navigate('/admin/login', { replace: true, state: { from: location.pathname } })
      return
    }
  }, [location.pathname, navigate, session])

  if (!session) {
    return null
  }

  function handleLogout() {
    clearSession()
    navigate('/admin/login?reason=session_closed', { replace: true })
  }

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

        <button
          className="admin-button admin-button-secondary admin-sidebar-logout"
          type="button"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>

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
