import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getDashboardSummary } from '../../services/statisticsService.js'
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

function cancelCurrentRequest(requestRef) {
  const currentRequest = requestRef.current

  if (!currentRequest.controller) {
    return
  }

  requestRef.current = {
    id: currentRequest.id + 1,
    controller: null,
  }
  currentRequest.controller.abort()
}

function DashboardPage() {
  const [vehicles, setVehicles] = useState([])
  const [summary, setSummary] = useState(null)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSummaryLoading, setIsSummaryLoading] = useState(true)
  const [error, setError] = useState('')
  const [summaryError, setSummaryError] = useState('')
  const [actionError, setActionError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [conditionFilter, setConditionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const hasLoadedRef = useRef(false)
  const summaryRequestRef = useRef({ id: 0, controller: null })
  const vehiclesRequestRef = useRef({ id: 0, controller: null })

  const loadVehicles = useCallback(() => {
    const previousRequest = vehiclesRequestRef.current
    const currentRequest = {
      id: previousRequest.id + 1,
      controller: new AbortController(),
    }
    vehiclesRequestRef.current = currentRequest
    previousRequest.controller?.abort()
    setError('')

    if (hasLoadedRef.current) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    const requestPromise = (async () => {
      try {
        const items = await listVehicles({
          signal: currentRequest.controller.signal,
        })
        if (currentRequest.id !== vehiclesRequestRef.current.id) {
          return false
        }

        setVehicles(items)
        setHasLoaded(true)
        hasLoadedRef.current = true
        return true
      } catch (requestError) {
        if (
          currentRequest.id !== vehiclesRequestRef.current.id ||
          requestError.name === 'AbortError'
        ) {
          return false
        }

        setError(requestError.message)
        return false
      } finally {
        if (currentRequest.id === vehiclesRequestRef.current.id) {
          vehiclesRequestRef.current = {
            id: currentRequest.id,
            controller: null,
          }
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    })()

    return requestPromise
  }, [])

  const loadSummary = useCallback(() => {
    const previousRequest = summaryRequestRef.current
    const currentRequest = {
      id: previousRequest.id + 1,
      controller: new AbortController(),
    }
    summaryRequestRef.current = currentRequest
    previousRequest.controller?.abort()
    setSummaryError('')
    setIsSummaryLoading(true)

    const requestPromise = (async () => {
      try {
        const item = await getDashboardSummary({
          signal: currentRequest.controller.signal,
        })
        if (currentRequest.id !== summaryRequestRef.current.id) {
          return
        }

        setSummary(item)
      } catch (requestError) {
        if (
          currentRequest.id !== summaryRequestRef.current.id ||
          requestError.name === 'AbortError'
        ) {
          return
        }

        setSummaryError(requestError.message)
        setSummary(null)
      } finally {
        if (currentRequest.id === summaryRequestRef.current.id) {
          summaryRequestRef.current = {
            id: currentRequest.id,
            controller: null,
          }
          setIsSummaryLoading(false)
        }
      }
    })()

    return requestPromise
  }, [])

  const loadDashboard = useCallback(() => {
    const vehiclesRequest = loadVehicles()
    const summaryRequest = loadSummary()
    return Promise.all([vehiclesRequest, summaryRequest])
  }, [loadSummary, loadVehicles])

  useEffect(() => {
    loadDashboard()
    return () => {
      cancelCurrentRequest(vehiclesRequestRef)
      cancelCurrentRequest(summaryRequestRef)
    }
  }, [loadDashboard])

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
    await loadDashboard()
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
      await loadDashboard()
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
            onClick={loadDashboard}
            disabled={isLoading}
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

      {summaryError && (
        <p className="admin-alert admin-alert-info" role="status">
          {summaryError} El inventario puede seguir funcionando mientras el resumen se recarga.
        </p>
      )}
      {isSummaryLoading && summary === null && (
        <p className="admin-alert admin-alert-info" role="status">
          Cargando resumen de estadísticas…
        </p>
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
      ) : null}

      {(summary !== null || hasLoaded) && (
        <InventorySummary summary={summary} vehicles={vehicles} />
      )}

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
