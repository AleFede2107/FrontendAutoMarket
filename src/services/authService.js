const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '')
const LOGIN_PATH = '/api/v1/administradores/IniciarSesion'
const SESSION_STORAGE_KEY = 'automarket_admin_session'

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isValidSession(session) {
  return (
    isRecord(session) &&
    isRecord(session.admin) &&
    Number.isFinite(Number(session.admin.id)) &&
    typeof session.token === 'string' &&
    session.token.trim().length > 0 &&
    typeof session.tokenType === 'string' &&
    session.tokenType.trim().length > 0 &&
    (session.expiresAt === null || Number.isFinite(session.expiresAt))
  )
}

export function clearSession() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
  }
}

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.sessionStorage.getItem(SESSION_STORAGE_KEY)

  if (!rawSession) {
    return null
  }

  try {
    const session = JSON.parse(rawSession)

    if (!isValidSession(session)) {
      clearSession()
      return null
    }

    return session
  } catch {
    clearSession()
    return null
  }
}

function saveSession(session) {
  if (!isValidSession(session) || typeof window === 'undefined') {
    throw new Error('AutoMarket API devolvió una sesión no válida.')
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export async function loginAdmin({ correo, password }) {
  if (!API_BASE_URL) {
    throw new Error('Configura VITE_API_BASE_URL para conectar con AutoMarket API.')
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}${LOGIN_PATH}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo, password }),
    })
  } catch {
    throw new Error(
      'No se pudo conectar con AutoMarket API. Verifica la conexión y la configuración CORS.',
    )
  }

  let payload

  try {
    payload = await response.json()
  } catch {
    throw new Error('AutoMarket API devolvió una respuesta no válida.')
  }

  if (response.status === 401) {
    throw new Error(
      payload?.detail?.message ?? 'Correo o contraseña incorrectos.',
    )
  }

  if (response.status === 422) {
    throw new Error('Revisa el formato del correo y vuelve a intentarlo.')
  }

  if (!response.ok) {
    throw new Error(
      `No fue posible iniciar sesión (HTTP ${response.status}). Inténtalo nuevamente.`,
    )
  }

  if (
    payload?.code !== 1 ||
    !payload.item ||
    typeof payload.item.id !== 'number' ||
    typeof payload.item.activo !== 'boolean' ||
    typeof payload.access_token !== 'string' ||
    !payload.access_token.trim() ||
    typeof payload.token_type !== 'string'
  ) {
    throw new Error(
      payload?.message || 'AutoMarket API devolvió datos de sesión no válidos.',
    )
  }

  const expiresInMinutes = Number(payload.expires_in)
  const session = {
    admin: payload.item,
    token: payload.access_token,
    tokenType: payload.token_type,
    expiresAt: Number.isFinite(expiresInMinutes)
      ? Date.now() + expiresInMinutes * 60_000
      : null,
  }

  saveSession(session)
  return payload.item
}
