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

function adaptPublicVehicle(vehicle) {
  const toFiniteNumber = (value) => {
    if (
      typeof value !== 'number' &&
      (typeof value !== 'string' || value.trim() === '')
    ) {
      return Number.NaN
    }

    return Number(value)
  }

  const adaptedVehicle = {
    id: vehicle?.id,
    estado: vehicle?.estado,
    brand: vehicle?.marca,
    model: vehicle?.modelo,
    year: toFiniteNumber(vehicle?.anio),
    price: toFiniteNumber(vehicle?.precio),
    mileage: toFiniteNumber(vehicle?.kilometraje),
    transmission: vehicle?.transmision ?? '',
    fuel: vehicle?.combustible ?? '',
    imageUrl: typeof vehicle?.fotoauto === 'string' ? vehicle.fotoauto : '',
    description:
      typeof vehicle?.descripcion === 'string' ? vehicle.descripcion : '',
  }

  if (
    !Number.isInteger(adaptedVehicle.id) ||
    adaptedVehicle.id < 1 ||
    typeof adaptedVehicle.estado !== 'string' ||
    typeof adaptedVehicle.brand !== 'string' ||
    typeof adaptedVehicle.model !== 'string' ||
    !Number.isFinite(adaptedVehicle.year) ||
    adaptedVehicle.year < 1 ||
    !Number.isFinite(adaptedVehicle.price) ||
    adaptedVehicle.price < 0 ||
    !Number.isFinite(adaptedVehicle.mileage) ||
    adaptedVehicle.mileage < 0
  ) {
    throw new Error('El backend devolvió un vehículo con datos no válidos.')
  }

  return adaptedVehicle
}

export async function listPublicVehicles(options = {}) {
  const response = await apiRequest('/vehiculos/ListarVehiculos', {
    ...options,
    requireAuth: false,
  })

  if (!Array.isArray(response?.items)) {
    throw new Error('El backend devolvió una lista de vehículos no válida.')
  }

  return response.items.map(adaptPublicVehicle)
}

export function createVehicle(formData, options = {}) {
  return apiRequest('/vehiculos/CrearVehiculo', {
    method: 'POST',
    body: formData,
    requireAuth: true,
    ...options,
  })
}

export async function updateVehicle(vehicleId, formData, options = {}) {
  const response = await apiRequest(
    `/vehiculos/ActualizarVehiculo/${vehicleId}`,
    {
      ...options,
      method: 'PUT',
      body: formData,
      requireAuth: true,
    },
  )

  if (response?.code !== 1) {
    throw new Error('El servidor no confirmó la actualización del vehículo.')
  }

  return response
}

export function deleteVehicle(vehicleId, options = {}) {
  return apiRequest(`/vehiculos/EliminarVehiculo/${vehicleId}`, {
    method: 'DELETE',
    requireAuth: true,
    ...options,
  })
}
