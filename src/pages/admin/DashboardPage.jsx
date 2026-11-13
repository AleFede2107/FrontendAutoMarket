import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createVehicle,
  deleteVehicle,
  listVehicles,
} from '../../services/vehicleService.js'
import InventorySummary from './dashboard/InventorySummary.jsx'
import VehicleFilters from './dashboard/VehicleFilters.jsx'
import VehicleForm from './dashboard/VehicleForm.jsx'
import VehicleTable from './dashboard/VehicleTable.jsx'

const PAGE_SIZE = 10

function DashboardPage() {
  const [vehicles, setVehicles] = useState([])
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const hasLoadedRef = useRef(false)
  const requestInFlightRef = useRef(false)

  const loadVehicles = useCallback(async () => {
    if (requestInFlightRef.current) {
      return false
    }

    requestInFlightRef.current = true
    setError('')

    if (hasLoadedRef.current) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const items = await listVehicles()
      setVehicles(items)
      setHasLoaded(true)
      hasLoadedRef.current = true
      return true
    } catch (requestError) {
      setError(requestError.message)
      return false
    } finally {
      requestInFlightRef.current = false
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    listVehicles()
      .then((items) => {
        setVehicles(items)
        setHasLoaded(true)
        hasLoadedRef.current = true
      })
      .catch((requestError) => {
        setError(requestError.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !normalizedSearch ||
        `${vehicle.marca} ${vehicle.modelo} ${vehicle.id}`
          .toLocaleLowerCase()
          .includes(normalizedSearch)
      const matchesStatus = !statusFilter || vehicle.estado === statusFilter
      const matchesCondition =
        !conditionFilter || vehicle.condicion === conditionFilter

      return matchesSearch && matchesStatus && matchesCondition
    })
  }, [vehicles, search, statusFilter, conditionFilter])

  const pageCount = Math.max(1, Math.ceil(filteredVehicles.length / PAGE_SIZE))

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setConditionFilter('')
    setPage(1)
  }

  async function handleCreate(formData) {
    await createVehicle(formData)
    setActionError('')
    setNotice('El vehículo se agregó correctamente.')
    await loadVehicles()
  }

  async function handleDelete(vehicle) {
    const vehicleName = `${vehicle.marca} ${vehicle.modelo} (${vehicle.anio})`
    const confirmed = window.confirm(
      `¿Eliminar el registro del vehículo ${vehicleName}, ID ${vehicle.id}? Esta acción elimina el registro.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingId(vehicle.id)
    setActionError('')
    setNotice('')

    try {
      await deleteVehicle(vehicle.id)
      setNotice(`Se eliminó el registro de ${vehicleName}.`)
      await loadVehicles()
    } catch (requestError) {
      setActionError(requestError.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Administración</p>
          <h1>Inventario y estadísticas</h1>
          <p className="admin-page-description">
            Resumen y gestión de los vehículos registrados.
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            className="admin-button admin-button-secondary"
            type="button"
            onClick={loadVehicles}
            disabled={isLoading || isRefreshing}
          >
            {isRefreshing ? 'Actualizando…' : 'Actualizar listado'}
          </button>
          <button
            className="admin-button admin-button-primary"
            type="button"
            onClick={() => {
              setActionError('')
              setNotice('')
              setIsFormOpen(true)
            }}
            disabled={!hasLoaded || isRefreshing || deletingId !== null}
          >
            Agregar vehículo
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          <span>
            {error}
            {hasLoaded && ' Se conserva el último listado cargado correctamente.'}
          </span>
          <button
            className="admin-button admin-button-small admin-button-secondary"
            type="button"
            onClick={loadVehicles}
            disabled={isLoading || isRefreshing}
          >
            Reintentar
          </button>
        </div>
      )}

      {actionError && (
        <p className="admin-alert admin-alert-error" role="alert">
          {actionError}
        </p>
      )}
      {notice && (
        <p className="admin-alert admin-alert-success" role="status">
          {notice}
        </p>
      )}

      {isLoading && !hasLoaded ? (
        <section className="admin-card admin-loading" role="status">
          <span className="admin-spinner" aria-hidden="true" />
          <p>Cargando inventario…</p>
        </section>
      ) : hasLoaded ? (
        <>
          <InventorySummary vehicles={vehicles} />

          <section className="admin-card admin-inventory-card">
            <div className="admin-section-heading">
              <div>
                <h2>Gestión de vehículos</h2>
                <p>
                  La búsqueda, los filtros y la paginación se aplican en este
                  navegador sobre los registros recibidos.
                </p>
              </div>
              <span className="admin-section-count">
                {filteredVehicles.length} registros
              </span>
            </div>

            <p className="admin-alert admin-alert-info">
              La edición está temporalmente no disponible: el contrato actual
              combina un cuerpo JSON con una parte multipart de fotografía. No
              se enviará una solicitud de actualización inválida.
            </p>

            <VehicleFilters
              search={search}
              statusFilter={statusFilter}
              conditionFilter={conditionFilter}
              onSearchChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              onStatusChange={(value) => {
                setStatusFilter(value)
                setPage(1)
              }}
              onConditionChange={(value) => {
                setConditionFilter(value)
                setPage(1)
              }}
              onClear={clearFilters}
            />

            {vehicles.length === 0 ? (
              <div className="admin-empty-state">
                <h3>Inventario vacío</h3>
                <p>La consulta se completó y el backend no devolvió vehículos.</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="admin-empty-state">
                <h3>Sin resultados</h3>
                <p>No hay vehículos que coincidan con los filtros actuales.</p>
                <button
                  className="admin-button admin-button-secondary"
                  type="button"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <VehicleTable
                vehicles={filteredVehicles}
                page={Math.min(page, pageCount)}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                onDelete={handleDelete}
                deletingId={deletingId}
              />
            )}
          </section>
        </>
      ) : null}

      {isFormOpen && (
        <VehicleForm
          onClose={() => setIsFormOpen(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

export default DashboardPage
