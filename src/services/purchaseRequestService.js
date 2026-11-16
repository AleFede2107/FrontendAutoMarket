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

export async function createPurchaseRequest(request, options = {}) {
  if (
    !Array.isArray(request?.vehiculos_ids) ||
    request.vehiculos_ids.some(
      (vehicleId) => !Number.isInteger(vehicleId) || vehicleId < 1,
    )
  ) {
    throw new Error('La solicitud requiere IDs enteros de vehículos válidos.')
  }

  const vehicleIds = [...new Set(request.vehiculos_ids)]
  if (vehicleIds.length === 0) {
    throw new Error('Selecciona al menos un vehículo para enviar la solicitud.')
  }

  const body = {
    nombre_cliente: request.nombre_cliente,
    correo_cliente: request.correo_cliente,
    telefono_cliente: request.telefono_cliente,
    vehiculos_ids: vehicleIds,
  }

  if (request.mensaje_cliente) {
    body.mensaje_cliente = request.mensaje_cliente
  }

  const response = await apiRequest('/solicitudes/CrearSolicitud', {
    ...options,
    method: 'POST',
    body,
    requireAuth: false,
  })

  if (
    !response?.item ||
    !Number.isInteger(response.item.id) ||
    typeof response.item.estado !== 'string' ||
    (typeof response.item.total_estimado !== 'string' &&
      typeof response.item.total_estimado !== 'number')
  ) {
    throw new Error(
      'El servidor respondió, pero no devolvió los datos necesarios para confirmar la solicitud.',
    )
  }

  return response.item
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
