const API_VERSION_PATH = '/api/v1'
const fieldLabels = {
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

function translateValidationMessage(message) {
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

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!configuredUrl) {
    throw new Error(
      'Configura VITE_API_BASE_URL con el origen del backend para cargar los datos.',
    )
  }

  return configuredUrl.replace(/\/+$/, '').replace(/\/api\/v1$/i, '')
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
  const message =
    getValidationMessage(payload?.detail) ??
    getValidationMessage(payload?.message)

  if (message) {
    return message
  }

  if (status === 422) {
    return 'Los datos enviados no cumplen con las validaciones del servidor.'
  }

  return `El servidor respondió con el estado ${status}.`
}

export async function apiRequest(path, options = {}) {
  const url = `${getApiBaseUrl()}${API_VERSION_PATH}${path}`
  let response

  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      ...options,
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        'No se pudo conectar con el backend. Comprueba su disponibilidad y la configuración CORS.',
      )
    }

    throw error
  }

  let payload

  try {
    payload = await response.json()
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `El servidor respondió con contenido no válido (estado ${response.status}).`,
      )
    }

    throw error
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status))
  }

  if (payload?.code !== 1) {
    throw new Error(
      getValidationMessage(payload?.message) ??
        'El servidor no confirmó la operación.',
    )
  }

  return payload
}
