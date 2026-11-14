import { useCallback, useEffect, useRef, useState } from 'react'
import { listPurchaseRequests } from '../../services/purchaseRequestService.js'

const numberFormatter = new Intl.NumberFormat('es', {
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('es', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

function formatAmount(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? numberFormatter.format(amount) : value
}

function OrdersPage() {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const hasLoadedRef = useRef(false)
  const requestInFlightRef = useRef(false)

  const loadRequests = useCallback(async () => {
    if (requestInFlightRef.current) {
      return
    }

    requestInFlightRef.current = true
    setError('')

    if (hasLoadedRef.current) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const items = await listPurchaseRequests()
      setRequests(items)
      setHasLoaded(true)
      hasLoadedRef.current = true
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      requestInFlightRef.current = false
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    listPurchaseRequests()
      .then((items) => {
        setRequests(items)
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

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Administración</p>
          <h1>Solicitudes de compra</h1>
          <p className="admin-page-description">
            Solicitudes disponibles en el backend.
          </p>
        </div>
        <button
          className="admin-button admin-button-secondary"
          type="button"
          onClick={loadRequests}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? 'Actualizando…' : 'Actualizar solicitudes'}
        </button>
      </header>

      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          <span>
            {error}
            {hasLoaded &&
              ' Se conserva la última lista cargada correctamente.'}
          </span>
          <button
            className="admin-button admin-button-small admin-button-secondary"
            type="button"
            onClick={loadRequests}
            disabled={isLoading || isRefreshing}
          >
            Reintentar
          </button>
        </div>
      )}

      {isLoading && !hasLoaded ? (
        <section className="admin-card admin-loading" role="status">
          <span className="admin-spinner" aria-hidden="true" />
          <p>Cargando solicitudes…</p>
        </section>
      ) : hasLoaded ? (
        <section className="admin-card admin-requests-card">
          <div className="admin-section-heading">
            <div>
              <h2>Solicitudes registradas</h2>
              <p>
                Consulta de solo lectura. El backend aún no ofrece operaciones
                para crear, aprobar o rechazar solicitudes.
              </p>
            </div>
            <span className="admin-section-count">
              {requests.length} registros
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="admin-empty-state">
              <h3>Sin solicitudes registradas</h3>
              <p>
                La consulta se completó y el backend devolvió una lista vacía.
              </p>
            </div>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table admin-requests-table">
                <thead>
                  <tr>
                    <th scope="col">Solicitud</th>
                    <th scope="col">Cliente</th>
                    <th scope="col">Vehículos de interés</th>
                    <th scope="col">Total estimado*</th>
                    <th scope="col">Registro</th>
                    <th scope="col">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>#{request.id}</td>
                      <td>
                        <div className="admin-request-client">
                          <strong>{request.nombre_cliente}</strong>
                          <span>{request.correo_cliente}</span>
                          <span>{request.telefono_cliente}</span>
                        </div>
                      </td>
                      <td>
                        <ul className="admin-request-vehicles">
                          {request.detalles.map((vehicle) => (
                            <li key={vehicle.id}>
                              {vehicle.marca} {vehicle.modelo} ({vehicle.anio})
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td>{formatAmount(request.total_estimado)}</td>
                      <td>{formatDate(request.creado_en)}</td>
                      <td>
                        <span className="admin-status admin-status-neutral">
                          {request.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="admin-footnote">
            * El contrato no especifica la moneda de los importes.
          </p>
        </section>
      ) : null}
    </div>
  )
}

export default OrdersPage
