import { Link, Outlet, useLocation } from 'react-router'

function PublicLayout() {
  const isHome = useLocation().pathname === '/'

  return (
    <div className="public-layout">
      <header className="public-header">
        <div className="public-header__inner">
          <Link className="public-brand" to="/" aria-label="AutoMarket, inicio">
            <span className="material-symbols-outlined" aria-hidden="true">
              directions_car
            </span>
            <span>
              Auto<span>Market</span>
            </span>
          </Link>
          <nav className="public-nav" aria-label="Navegación principal">
            <Link to="/autos">Vehículos</Link>
            {isHome ? (
              <>
                <a href="#categorias">Categorías</a>
                <a href="#marcas">Marcas</a>
                <a href="#ventajas">¿Por qué nosotros?</a>
              </>
            ) : (
              <Link to="/">Inicio</Link>
            )}
            <a href="#contacto">Contacto</a>
          </nav>
          <div className="public-header__actions">
            <Link
              className="public-header__cart"
              to="/carrito"
              aria-label="Carrito"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                shopping_bag
              </span>
              Carrito
            </Link>
            <Link className="public-header__catalog" to="/autos">
              Catálogo
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="public-footer" id="contacto">
        <div className="public-footer__inner">
          <div className="public-footer__brand">
            <Link className="public-brand" to="/" aria-label="AutoMarket, inicio">
              <span className="material-symbols-outlined" aria-hidden="true">
                directions_car
              </span>
              <span>
                Auto<span>Market</span>
              </span>
            </Link>
            <p>
              Explora el catálogo y consulta la información disponible de cada
              vehículo.
            </p>
          </div>
          <div className="public-footer__links">
            <h2>Explora</h2>
            <Link to="/autos">Catálogo de vehículos</Link>
            {isHome ? (
              <>
                <a href="#categorias">Categorías</a>
                <a href="#marcas">Marcas</a>
              </>
            ) : (
              <Link to="/">Inicio</Link>
            )}
          </div>
          <div className="public-footer__links">
            <h2>AutoMarket</h2>
            {isHome ? (
              <a href="#ventajas">Cómo funciona</a>
            ) : null}
            <Link to="/carrito">Carrito</Link>
            <Link to="/admin/login">Acceso administrativo</Link>
          </div>
        </div>
        <div className="public-footer__bottom">
          <span>© AutoMarket</span>
          <Link to="/">Inicio</Link>
        </div>
      </footer>
    </div>
  )
}

export default PublicLayout
