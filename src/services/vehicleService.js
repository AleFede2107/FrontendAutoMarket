import mockVehicles from '../mocks/vehicles.js'
import { apiRequest } from './apiClient.js'

export async function getVehicles() {
  return mockVehicles
}

export async function listVehicles(options = {}) {
  const response = await apiRequest('/vehiculos/ListarVehiculos', {
    requireAuth: true,
    ...options,
  })

  if (!Array.isArray(response.items)) {
    throw new Error('El backend devolvió una lista de vehículos no válida.')
  }

  return response.items
}

export function createVehicle(formData, options = {}) {
  return apiRequest('/vehiculos/CrearVehiculo', {
    method: 'POST',
    body: formData,
    requireAuth: true,
    ...options,
  })
}

export function deleteVehicle(vehicleId, options = {}) {
  return apiRequest(`/vehiculos/EliminarVehiculo/${vehicleId}`, {
    method: 'DELETE',
    requireAuth: true,
    ...options,
  })
}
