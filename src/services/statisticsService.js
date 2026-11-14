import { apiRequest } from './apiClient.js'

export async function getDashboardSummary(options = {}) {
  const response = await apiRequest('/estadisticas/Resumen', {
    requireAuth: true,
    ...options,
  })

  const item = response?.item ?? response

  if (!item || typeof item !== 'object') {
    throw new Error('El backend no devolvió un resumen de estadísticas válido.')
  }

  return item
}
