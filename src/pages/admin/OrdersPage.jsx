import { useCallback, useEffect, useRef, useState } from 'react'
import {
  listPurchaseRequests,
  updatePurchaseRequestNotes,
  updatePurchaseRequestState,
} from '../../services/purchaseRequestService.js'

const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('es', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const stateLabels = {
  pendiente: 'Pendiente',
  contactado: 'Contactado',
  confirmada: 'Confirmada',
  rechazada: 'Rechazada',
  cancelada: 'Cancelada',
  completada: 'Completada',
}

const allowedTransitions = {
  pendiente: ['contactado', 'rechazada', 'cancelada'],
  contactado: ['confirmada', 'rechazada', 'cancelada'],
  confirmada: ['completada', 'cancelada'],
  rechazada: [],
  cancelada: [],
  completada: [],
}

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

function normalizeState(value) {
  return String(value ?? '').trim().toLowerCase()
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

function formatAmount(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const amount = Number(value)
  return Number.isFinite(amount) ? numberFormatter.format(amount) : value
}

function OrdersPage() {
  const [requests, setRequests] = useState([])
  const [notesDrafts, setNotesDrafts] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [hasLoaded, setHasLoaded] = useState(false)
  const [savingNotesId, setSavingNotesId] = useState(null)
  const [savingStatusId, setSavingStatusId] = useState(null)
  const hasLoadedRef = useRef(false)
  const requestsRequestRef = useRef({ id: 0, controller: null })

  const loadRequests = useCallback(() => {
    const previousRequest = requestsRequestRef.current
    const currentRequest = {
      id: previousRequest.id + 1,
      controller: new AbortController(),
    }
    requestsRequestRef.current = currentRequest
    previousRequest.controller?.abort()
    setError('')

    if (hasLoadedRef.current) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    const requestPromise = (async () => {
      try {
        const items = await listPurchaseRequests({
          signal: currentRequest.controller.signal,
          requireAuth: true,
        })
        if (currentRequest.id !== requestsRequestRef.current.id) {
          return
        }

        setRequests(items)
        setNotesDrafts(
          items.reduce((result, request) => {
            result[request.id] = request.notas_administrador ?? ''
            return result
          }, {}),
        )
        setHasLoaded(true)
        hasLoadedRef.current = true
      } catch (requestError) {
        if (
          currentRequest.id !== requestsRequestRef.current.id ||
          requestError.name === 'AbortError'
        ) {
          return
        }

        setError(requestError.message)
      } finally {
        if (currentRequest.id === requestsRequestRef.current.id) {
          requestsRequestRef.current = {
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

  useEffect(() => {
    loadRequests()
    return () => cancelCurrentRequest(requestsRequestRef)
  }, [loadRequests])

  async function handleSaveNotes(request) {
    if (savingNotesId !== null) {
      return
    }

    const currentText = notesDrafts[request.id] ?? request.notas_administrador ?? ''

    setSavingNotesId(request.id)

    try {
      await updatePurchaseRequestNotes(request.id, currentText)
      setNotice(`Se guardaron las notas de la solicitud #${request.id}.`)
      setError('')
      await loadRequests()
    } catch (requestError) {
      if (requestError.status === 404) {
        setError('La solicitud ya no existe. Se recargó la lista actualizada.')
        await loadRequests()
        return
      }

      if (requestError.status === 401) {
        return
      }

      setError(requestError.message)
    } finally {
      setSavingNotesId(null)
    }
  }

  async function handleStatusUpdate(request, nextStatus) {
    const currentStatus = normalizeState(request.estado)
    const nextState = normalizeState(nextStatus)

    if (!nextState || !allowedTransitions[currentStatus]?.includes(nextState)) {
      setError('El cambio de estado no está permitido por la regla actual del backend.')
      return
    }

    const confirmed = window.confirm(
      `¿Cambiar la solicitud #${request.id} de ${stateLabels[currentStatus] ?? currentStatus} a ${stateLabels[nextState] ?? nextState}?`,
    )

    if (!confirmed) {
      return
    }

    setSavingStatusId(request.id)

    try {
      const updatedRequest = await updatePurchaseRequestState(request.id, nextState)
      setNotice(`El estado de la solicitud #${request.id} se actualizó correctamente.`)
      setError('')
      setRequests((currentRequests) =>
        currentRequests.map((currentRequest) =>
          currentRequest.id === request.id
            ? {
                ...currentRequest,
                estado: nextState,
                actualizado_en:
                  updatedRequest?.actualizado_en ?? currentRequest.actualizado_en,
              }
            : currentRequest,
        ),
      )
      await loadRequests()
    } catch (requestError) {
      if (requestError.status === 404) {
        setError('La solicitud ya no existe. Se recargó la lista actualizada.')
        await loadRequests()
        return
      }

      if (requestError.status === 409) {
        setError('La transición no es válida o hubo un cambio concurrente. Se volvió a consultar el último estado disponible.')
        await loadRequests()
        return
      }

      if (requestError.status === 422) {
        setError(requestError.message)
        return
      }

      if (requestError.status === 401) {
        return
      }

      setError(requestError.message)
    } finally {
      setSavingStatusId(null)
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Administración</p>
          <h1>Solicitudes de compra</h1>
          <p className="admin-page-description">
            Gestiona el listado, notas administrativas y estados. La operación está protegida por sesión compartida.
          </p>
        </div>
        <button
          className="admin-button admin-button-secondary"
          type="button"
          onClick={() => loadRequests()}
          disabled={isLoading || isRefreshing}
        >
          {isRefreshing ? 'Actualizando…' : 'Actualizar solicitudes'}
        </button>
      </header>

      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          <span>
            {error}
            {hasLoaded && ' Se conserva la última lista cargada correctamente.'}
          </span>
          <button
            className="admin-button admin-button-small admin-button-secondary"
            type="button"
            onClick={() => loadRequests()}
            disabled={isLoading || isRefreshing}
          >
            Reintentar
          </button>
        </div>
      )}

      {notice && (
        <p className="admin-alert admin-alert-success" role="status">
          {notice}
        </p>
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
                La lista completa se usa para filtrar y paginar localmente si se agregan filtros en el futuro.
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
                    <th scope="col">Mensaje</th>
                    <th scope="col">Vehículos</th>
                    <th scope="col">Total estimado*</th>
                    <th scope="col">Registro</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => {
                    const detailList = Array.isArray(request.detalles) ? request.detalles : []
                    const currentStatus = normalizeState(request.estado)
                    const allowedStatusOptions = allowedTransitions[currentStatus] ?? []

                    return (
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
                          <div className="admin-request-message">
                            {request.mensaje_cliente || '—'}
                          </div>
                        </td>
                        <td>
                          <ul className="admin-request-vehicles">
                            {detailList.length === 0 ? (
                              <li>Sin vehículos</li>
                            ) : (
                              detailList.map((vehicle) => (
                                <li key={vehicle.id}>
                                  {vehicle.marca} {vehicle.modelo} ({vehicle.anio})
                                </li>
                              ))
                            )}
                          </ul>
                        </td>
                        <td>{formatAmount(request.total_estimado)}</td>
                        <td>{formatDate(request.creado_en)}</td>
                        <td>
                          <div className="admin-request-status-cell">
                            <label className="admin-field admin-field-inline" htmlFor={`status-${request.id}`}>
                              <span className="sr-only">Estado</span>
                              <select
                                id={`status-${request.id}`}
                                value={currentStatus}
                                onChange={(event) => handleStatusUpdate(request, event.target.value)}
                                disabled={savingStatusId !== null || allowedStatusOptions.length === 0}
                              >
                                <option value={currentStatus}>
                                  {stateLabels[currentStatus] ?? currentStatus}
                                </option>
                                {allowedStatusOptions.map((statusKey) => (
                                  <option key={statusKey} value={statusKey}>
                                    {stateLabels[statusKey] ?? statusKey}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        </td>
                        <td>
                          <div className="admin-request-notes">
                            <label className="admin-field" htmlFor={`notes-${request.id}`}>
                              <span className="sr-only">Notas administrativas</span>
                              <textarea
                                id={`notes-${request.id}`}
                                value={notesDrafts[request.id] ?? ''}
                                onChange={(event) =>
                                  setNotesDrafts((previousDrafts) => ({
                                    ...previousDrafts,
                                    [request.id]: event.target.value,
                                  }))
                                }
                                rows={4}
                                maxLength={5000}
                              />
                            </label>
                            <button
                              className="admin-button admin-button-secondary admin-button-small"
                              type="button"
                              disabled={savingNotesId !== null || savingStatusId !== null}
                              onClick={() => handleSaveNotes(request)}
                            >
                              {savingNotesId === request.id ? 'Guardando…' : 'Guardar notas'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="admin-footnote">
            * El contrato no especifica la moneda de los importes; se muestran como estimados.
          </p>
        </section>
      ) : null}
    </div>
  )
}

export default OrdersPage
