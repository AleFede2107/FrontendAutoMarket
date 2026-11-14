import { buildApiUrl } from './httpConfig.js'

const SESSION_STORAGE_KEY = 'automarket_admin_session'

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeErrorMessage(payload, status) {
  if (typeof payload?.detail === 'string' && payload.detail.trim()) {
    return payload.detail
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return payload.message
  }

  if (status === 401) {
    return 'Credenciales inválidas o sesión expirada.'
  }

  if (status === 422) {
    return 'Los datos enviados no cumplen con las validaciones del servidor.'
  }

  return `El servidor respondió con el estado ${status}.`
}

export function isValidSession(session) {
  if (!isPlainObject(session)) {
    return false
  }

  const hasAdmin = isPlainObject(session.admin) && Number.isFinite(Number(session.admin.id))
  const hasToken = typeof session.token === 'string' && session.token.trim().length > 0
  const hasTokenType = typeof session.tokenType === 'string' && session.tokenType.trim().length > 0

  return hasAdmin && hasToken && hasTokenType
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
    const parsedSession = JSON.parse(rawSession)

    if (!isValidSession(parsedSession)) {
      clearSession()
      return null
    }

    return parsedSession
  } catch {
    clearSession()
    return null
  }
}

export function saveSession(session) {
  if (!isValidSession(session)) {
    return false
  }

  if (typeof window === 'undefined') {
    return false
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  return true
}

export function getAccessToken() {
  return getStoredSession()?.token ?? ''
}

export function restoreSession() {
  return getStoredSession()
}

export function normalizeLoginResponse(response) {
  if (!isPlainObject(response)) {
    return null
  }

  const admin = isPlainObject(response.item) ? response.item : null
  const token = typeof response.access_token === 'string' ? response.access_token : ''

  if (!admin || !token) {
    return null
  }

  const expiresInMinutes = Number(response.expires_in)
  const expiresAt = Number.isFinite(expiresInMinutes)
    ? Date.now() + expiresInMinutes * 60_000
    : null

  return {
    admin,
    token,
    tokenType: typeof response.token_type === 'string' ? response.token_type : 'Bearer',
    expiresInMinutes: Number.isFinite(expiresInMinutes) ? expiresInMinutes : 0,
    expiresAt,
  }
}

export async function loginAdmin({ correo, password }) {
  if (typeof correo !== 'string' || !correo.trim()) {
    throw new Error('Debes escribir tu correo para iniciar sesión.')
  }

  if (typeof password !== 'string' || !password.trim()) {
    throw new Error('Debes escribir tu contraseña para iniciar sesión.')
  }

  const response = await fetch(buildApiUrl('/administradores/IniciarSesion'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ correo: correo.trim(), password }),
  })

  let payload = null

  try {
    payload = await response.json()
  } catch {
    if (response.ok) {
      throw new Error('El backend no devolvió una respuesta válida durante el login.')
    }
  }

  if (!response.ok) {
    throw new Error(normalizeErrorMessage(payload, response.status))
  }

  if (payload?.code !== 1) {
    throw new Error(payload?.message ?? 'El login no se completó correctamente.')
  }

  const session = normalizeLoginResponse(payload)

  if (!session) {
    throw new Error('El backend no devolvió una sesión válida para el administrador.')
  }

  saveSession(session)
  return session
}

export function logoutAdmin() {
  clearSession()
  return true
}
