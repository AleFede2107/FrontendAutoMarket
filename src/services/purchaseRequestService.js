import { apiRequest } from './apiClient.js'

export async function listPurchaseRequests() {
  const response = await apiRequest('/solicitudes/ListarSolicitudes')

  if (!Array.isArray(response.items)) {
    throw new Error('El backend devolvió una lista de solicitudes no válida.')
  }

  return response.items
}
