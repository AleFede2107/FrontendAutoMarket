import { apiRequest } from './apiClient.js'

export async function listPurchaseRequestStates({ signal } = {}) {
  const response = await apiRequest(
    '/catalogosgenerales/EstadosSolicitudes',
    { signal },
  )

  if (
    !Array.isArray(response?.items) ||
    response.items.some(
      (state) => typeof state !== 'string' || state.trim().length === 0,
    )
  ) {
    throw new Error('El backend devolvió un catálogo de estados no válido.')
  }

  return [...new Set(response.items)]
}
