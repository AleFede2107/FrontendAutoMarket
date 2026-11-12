import { Link, Outlet } from 'react-router'

function AdminLayout() {
  return (
    <>
      <header className="site-header">
        <h1>Administración</h1>
        <nav className="site-nav" aria-label="Navegación administrativa">
          <ul>
            <li>
              <Link to="/admin">Panel</Link>
            </li>
            <li>
              <Link to="/admin/ordenes">Órdenes</Link>
            </li>
            <li>
              <Link to="/">Volver al inicio</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
    </>
  )
}

export default AdminLayout
