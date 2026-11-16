import { useRef, useState } from 'react'
import { CartContext } from './cartContext.js'

const CART_STORAGE_KEY = 'automarket-cart-v1'

function readStoredSelection() {
  if (typeof window === 'undefined') {
    return { vehicleIds: [], message: '' }
  }

  try {
    const storedValue = window.localStorage.getItem(CART_STORAGE_KEY)

    if (storedValue === null) {
      return { vehicleIds: [], message: '' }
    }

    const parsedValue = JSON.parse(storedValue)
    if (
      parsedValue?.version !== 1 ||
      !Array.isArray(parsedValue.vehicleIds) ||
      parsedValue.vehicleIds.some(
        (vehicleId) => !Number.isInteger(vehicleId) || vehicleId < 1,
      )
    ) {
      return {
        vehicleIds: [],
        message:
          'La selección guardada no era válida. Puedes volver a agregar vehículos.',
      }
    }

    return {
      vehicleIds: [...new Set(parsedValue.vehicleIds)],
      message: '',
    }
  } catch {
    return {
      vehicleIds: [],
      message:
        'No se pudo leer la selección guardada en este navegador. La selección actual solo se conservará mientras la página esté abierta.',
    }
  }
}

function CartProvider({ children }) {
  const [storedSelection] = useState(readStoredSelection)
  const [vehicleIds, setVehicleIds] = useState(storedSelection.vehicleIds)
  const vehicleIdsRef = useRef(vehicleIds)
  const [storageMessage, setStorageMessage] = useState(storedSelection.message)

  function updateSelection(nextIds) {
    vehicleIdsRef.current = nextIds
    setVehicleIds(nextIds)

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ version: 1, vehicleIds: nextIds }),
      )
      setStorageMessage('')
    } catch {
      setStorageMessage(
        'No se pudo guardar la selección en este navegador. Se conservará mientras esta página esté abierta.',
      )
    }
  }

  function addVehicle(vehicleId) {
    if (!Number.isInteger(vehicleId) || vehicleId < 1) {
      return
    }

    const currentIds = vehicleIdsRef.current
    if (!currentIds.includes(vehicleId)) {
      updateSelection([...currentIds, vehicleId])
    }
  }

  function removeVehicle(vehicleId) {
    updateSelection(
      vehicleIdsRef.current.filter((currentId) => currentId !== vehicleId),
    )
  }

  function removeVehicles(vehicleIdsToRemove) {
    const idsToRemove = new Set(vehicleIdsToRemove)
    updateSelection(
      vehicleIdsRef.current.filter((currentId) => !idsToRemove.has(currentId)),
    )
  }

  return (
    <CartContext.Provider
      value={{
        vehicleIds,
        storageMessage,
        addVehicle,
        removeVehicle,
        removeVehicles,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export { CartProvider }
