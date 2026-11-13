import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { loginAdmin } from '../../services/authService.js'
import './LoginPage.css'

const benefits = [
  {
    icon: 'track_changes',
    title: 'Seguimiento de pedidos',
    description: 'Consulta el estado de cada operación.',
  },
  {
    icon: 'inventory_2',
    title: 'Control de inventario',
    description: 'Consulta disponibilidad desde un solo lugar.',
  },
  {
    icon: 'fact_check',
    title: 'Inspección de vehículos',
    description: 'Mantén el inventario listo para cada venta.',
  },
]

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')
    setIsSubmitting(true)

    try {
      const administrator = await loginAdmin({
        correo: email.trim(),
        password,
      })
      if (!administrator.activo) {
        throw new Error('Esta cuenta administrativa está inactiva.')
      }
      setPassword('')
      navigate('/admin', { replace: true })
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : 'No fue posible iniciar sesión. Inténtalo nuevamente.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <Link className="login-brand" to="/" aria-label="AutoMarket, inicio">
          <span className="material-symbols-outlined" aria-hidden="true">
            directions_car
          </span>
          <span>
            Auto<span>Market</span>
          </span>
        </Link>
        <nav className="login-header__nav" aria-label="Ayuda y navegación">
          <Link to="/#contacto">Ayuda y soporte</Link>
          <Link to="/">
            Volver a la tienda
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_outward
            </span>
          </Link>
        </nav>
      </header>

      <main className="login-main">
        <aside className="login-showcase" aria-labelledby="showcase-title">
          <img
            className="login-showcase__image"
            src="https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1400&q=85"
            alt="Vehículo en exhibición"
          />
          <div className="login-showcase__overlay" aria-hidden="true" />
          <div className="login-showcase__content">
            <span className="login-verified">
              <span className="material-symbols-outlined" aria-hidden="true">
                verified
              </span>
              Concesionario verificado
            </span>
            <div className="login-showcase__copy">
              <p className="login-eyebrow">Administración AutoMarket</p>
              <h1 id="showcase-title">
                Tu operación, <span>bajo control</span>
              </h1>
              <p className="login-showcase__description">
                Gestiona pedidos, inventario y vehículos desde un espacio
                centralizado.
              </p>
              <ul className="login-benefits">
                {benefits.map((benefit) => (
                  <li key={benefit.title}>
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      {benefit.icon}
                    </span>
                    <span>
                      <strong>{benefit.title}</strong>
                      <small>{benefit.description}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <span className="login-showcase__caption">
              Acceso exclusivo para administración AutoMarket.
            </span>
          </div>
        </aside>

        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-card">
            <div className="login-heading">
              <span className="login-eyebrow">Espacio de administración</span>
              <h2 id="login-title">Bienvenido, Administrador</h2>
              <p>
                Ingresa tus credenciales para acceder al panel administrativo
              </p>
            </div>

            <form
              className="login-form"
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
            >
              <label className="login-field">
                <span>Correo electrónico</span>
                <span className="login-input-wrap">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    mail
                  </span>
                  <input
                    autoComplete="email"
                    type="email"
                    name="email"
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </span>
              </label>

              <div className="login-field">
                <div className="login-field__label">
                  <label htmlFor="login-password">Contraseña</label>
                  <button
                    className="login-text-button"
                    type="button"
                    disabled
                    title="La recuperación de contraseña estará disponible próximamente."
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <span className="login-input-wrap">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    lock
                  </span>
                  <input
                    autoComplete="current-password"
                    id="login-password"
                    maxLength={128}
                    name="password"
                    placeholder="Ingresa tu contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    className="login-password-toggle"
                    type="button"
                    disabled={isSubmitting}
                    aria-label={
                      showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((isVisible) => !isVisible)}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </span>
              </div>

              <label className="login-remember">
                <input type="checkbox" disabled />
                <span>
                  Recordar mi sesión (disponible al integrar el backend)
                </span>
              </label>

              <button
                className="login-submit"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verificando...' : 'Iniciar sesión'}
                <span className="material-symbols-outlined" aria-hidden="true">
                  {isSubmitting ? 'progress_activity' : 'arrow_forward'}
                </span>
              </button>
              {notice ? (
                <p className="login-notice" role="alert">
                  {notice}
                </p>
              ) : null}
            </form>

            <Link className="login-store-link" to="/">
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_back
              </span>
              Regresar a la tienda
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LoginPage
