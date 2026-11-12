import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <main className="site-main">
      <h1>Página no encontrada</h1>
      <p>La ruta que buscas no existe.</p>
      <p>
        <Link to="/">Volver al inicio</Link>
      </p>
    </main>
  )
}

export default NotFoundPage
