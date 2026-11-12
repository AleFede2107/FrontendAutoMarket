import { apiRequest } from './apiClient.js'

export async function listVehicles() {
  const response = await apiRequest('/vehiculos/ListarVehiculos')

  if (!Array.isArray(response.items)) {
    throw new Error('El backend devolvió una lista de vehículos no válida.')
  }

  return response.items
}

export function createVehicle(formData) {
  return apiRequest('/vehiculos/CrearVehiculo', {
    method: 'POST',
    body: formData,
  })
}

export function deleteVehicle(vehicleId) {
  return apiRequest(`/vehiculos/EliminarVehiculo/${vehicleId}`, {
    method: 'DELETE',
  })
}
