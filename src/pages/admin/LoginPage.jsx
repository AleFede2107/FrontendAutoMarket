import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { getStoredSession, loginAdmin } from '../../services/authService.js'

const inlineReasonMessages = {
  session_expired: 'Tu sesión expiró. Inicia sesión nuevamente.',
  session_required: 'Necesitas iniciar sesión para acceder al panel.',
  session_closed: 'Se cerró la sesión correctamente.',
}

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginReason = searchParams.get('reason')

  useEffect(() => {
    if (getStoredSession()) {
      navigate('/admin', { replace: true })
    }
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    try {
      setIsSubmitting(true)
      await loginAdmin({ correo, password })
      navigate('/admin', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-login-shell">
      <div className="admin-card admin-login-card">
        <p className="admin-eyebrow">Acceso administrativo</p>
        <h1>Iniciar sesión</h1>
        <p className="admin-page-description">
          Ingresa tus credenciales de administrador para acceder al panel.
        </p>

        {loginReason && inlineReasonMessages[loginReason] && (
          <p className="admin-alert admin-alert-info" role="status">
            {inlineReasonMessages[loginReason]}
          </p>
        )}

        {error && (
          <p className="admin-alert admin-alert-error" role="alert">
            {error}
          </p>
        )}

        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <label className="admin-field" htmlFor="admin-email">
            <span>Correo</span>
            <input
              id="admin-email"
              name="correo"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(event) => setCorreo(event.target.value)}
              placeholder="tu@correo.com"
              required
            />
          </label>

          <label className="admin-field" htmlFor="admin-password">
            <span>Contraseña</span>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <button
            className="admin-button admin-button-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión…' : 'Entrar al panel'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
