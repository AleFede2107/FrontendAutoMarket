import { clearSession, getStoredSession } from './authService.js'
import { buildApiUrl } from './httpConfig.js'

const fieldLabels = {
  nombre_cliente: 'Nombre',
  correo_cliente: 'Correo',
  telefono_cliente: 'Teléfono',
  vehiculos_ids: 'Vehículos',
  mensaje_cliente: 'Mensaje',
  marca: 'Marca',
  modelo: 'Modelo',
  anio: 'Año',
  precio: 'Precio',
  kilometraje: 'Kilometraje',
  condicion: 'Condición',
  transmision: 'Transmisión',
  combustible: 'Combustible',
  estado: 'Estado',
  fotoauto: 'Fotografía',
}

export class ApiError extends Error {
  constructor({ message, status, payload, cause }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
    this.cause = cause
  }
}

function translateValidationMessage(message) {
  if (!message || typeof message !== 'string') {
    return ''
  }

  if (message === 'Field required') {
    return 'es un campo obligatorio.'
  }

  const maxLengthMatch = message.match(/at most (\d+) characters?/)

  if (maxLengthMatch) {
    return `debe tener como máximo ${maxLengthMatch[1]} caracteres.`
  }

  const minimumMatch = message.match(/greater than or equal to (.+)$/)

  if (minimumMatch) {
    return `debe ser ${minimumMatch[1]} o mayor.`
  }

  if (message === 'Input should be a valid integer') {
    return 'debe ser un número entero.'
  }

  if (message === 'Input should be a valid number') {
    return 'debe ser un número válido.'
  }

  if (message.startsWith('String should match pattern')) {
    return 'tiene un valor no permitido.'
  }

  return message
}

function getValidationMessage(detail) {
  if (typeof detail === 'string') {
    return detail
  }

  if (detail && typeof detail.message === 'string') {
    return detail.message
  }

  if (Array.isArray(detail)) {
    const errors = detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.at(-1) : null
        const fieldName = fieldLabels[field] ?? field
        const message = translateValidationMessage(item.msg ?? '')
        return fieldName ? `${fieldName} ${message}` : message
      })
      .filter(Boolean)

    if (errors.length > 0) {
      return `Revisa los datos: ${errors.join('; ')}`
    }
  }

  return null
}

function getErrorMessage(payload, status) {
  const validationMessage =
    getValidationMessage(payload?.detail) ??
    getValidationMessage(payload?.message) ??
    getValidationMessage(payload?.error)

  if (validationMessage) {
    return validationMessage
  }

  if (status === 401) {
    return 'Tu sesión expiró o no tienes permisos para esta operación.'
  }

  if (status === 403) {
    return 'No tienes permiso para realizar esta operación.'
  }

  if (status === 404) {
    return 'El recurso solicitado ya no está disponible.'
  }

  if (status === 409) {
    return 'La solicitud no pudo aplicarse porque el estado o los datos cambiaron. Consulta de nuevo e intenta otra acción.'
  }

  if (status === 422) {
    return 'Los datos enviados no cumplen con las validaciones del servidor.'
  }

  return `El servidor respondió con el estado ${status}.`
}

async function parseJsonPayload(response) {
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('application/json')) {
    return null
  }

  try {
    return await response.json()
  } catch (error) {
    throw new ApiError({
      message: `El servidor respondió con contenido no válido (estado ${response.status}).`,
      status: response.status,
      payload: null,
      cause: error,
    })
  }
}

export async function apiRequest(path, options = {}) {
  const requestOptions = { ...options }
  const headers = new Headers(requestOptions.headers ?? {})
  const requireAuth = requestOptions.requireAuth === true

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  if (requireAuth) {
    const session = getStoredSession()

    if (!session?.token) {
      clearSession()
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.assign('/admin/login?reason=session_required')
      }
      throw new ApiError({
        message: 'Debes iniciar sesión para continuar.',
        status: 401,
        payload: { message: 'Debes iniciar sesión para continuar.' },
      })
    }

    headers.set('Authorization', `Bearer ${session.token}`)
  }

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData) &&
    typeof requestOptions.body !== 'string' &&
    !(requestOptions.body instanceof Blob) &&
    !(requestOptions.body instanceof URLSearchParams)
  ) {
    requestOptions.body = JSON.stringify(requestOptions.body)
  }

  if (
    requestOptions.body &&
    !(requestOptions.body instanceof FormData) &&
    !headers.has('Content-Type') &&
    typeof requestOptions.body === 'string'
  ) {
    headers.set('Content-Type', 'application/json')
  }

  try {
    const response = await fetch(buildApiUrl(path), {
      ...requestOptions,
      headers,
      signal: requestOptions.signal,
    })

    const payload = await parseJsonPayload(response)

    if (!response.ok) {
      const message = getErrorMessage(payload, response.status)

      if (response.status === 401 && requireAuth) {
        clearSession()
        if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
          window.location.assign('/admin/login?reason=session_expired')
        }
      }

      throw new ApiError({
        message,
        status: response.status,
        payload,
      })
    }

    if (payload && typeof payload === 'object' && 'code' in payload && payload.code !== 1) {
      throw new ApiError({
        message:
          getValidationMessage(payload.message) ??
          getValidationMessage(payload.detail) ??
          'El servidor no confirmó la operación.',
        status: 400,
        payload,
      })
    }

    return payload
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error
    }

    if (error instanceof TypeError) {
      throw new ApiError({
        message:
          'No se pudo conectar con el backend. Comprueba su disponibilidad y la configuración CORS.',
        status: 503,
        payload: null,
        cause: error,
      })
    }

    throw error
  }
}
