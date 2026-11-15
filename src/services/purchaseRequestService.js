import { apiRequest } from './apiClient.js'

export async function listPurchaseRequests(options = {}) {
  const response = await apiRequest('/solicitudes/ListarSolicitudes', {
    requireAuth: true,
    ...options,
  })

  if (!Array.isArray(response.items)) {
    throw new Error('El backend devolvió una lista de solicitudes no válida.')
  }

  return response.items
}

export async function updatePurchaseRequestState(solicitudId, estado, options = {}) {
  const response = await apiRequest(`/solicitudes/ActualizarEstado/${solicitudId}`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
    requireAuth: true,
    ...options,
  })

  return response?.item ?? response
}

export async function updatePurchaseRequestNotes(
  solicitudId,
  notasAdministrador,
  options = {},
) {
  const response = await apiRequest(`/solicitudes/ActualizarNotas/${solicitudId}`, {
    method: 'PATCH',
    body: JSON.stringify({ notas_administrador: notasAdministrador }),
    requireAuth: true,
    ...options,
  })

  return response?.item ?? response
}
