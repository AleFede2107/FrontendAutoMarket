export const API_VERSION_PATH = '/api/v1'

export function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!configuredUrl) {
    throw new Error(
      'Configura VITE_API_BASE_URL con el origen del backend para cargar los datos.',
    )
  }

  return configuredUrl.replace(/\/+$/, '').replace(/\/api\/v1$/i, '')
}

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${getApiBaseUrl()}${API_VERSION_PATH}${normalizedPath}`
}
