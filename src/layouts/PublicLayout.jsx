import { Link, Outlet } from 'react-router'

function PublicLayout() {
  return (
    <>
      <header className="site-header">
        <h1>Venta de autos</h1>
        <nav className="site-nav" aria-label="Navegación principal">
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/autos">Autos</Link>
            </li>
            <li>
              <Link to="/carrito">Carrito</Link>
            </li>
            <li>
              <Link to="/admin/login">Login de administrador</Link>
            </li>
            <li>
              <Link to="/admin">Panel administrativo (sin protección)</Link>
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

export default PublicLayout
