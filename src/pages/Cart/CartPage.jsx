import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useCart } from '../../context/useCart.js'
import { ApiError } from '../../services/apiClient.js'
import { createPurchaseRequest } from '../../services/purchaseRequestService.js'
import { listPublicVehicles } from '../../services/vehicleService.js'
import './CartPage.css'

const EMPTY_FORM = {
  nombre_cliente: '',
  correo_cliente: '',
  telefono_cliente: '',
  mensaje_cliente: '',
}

function formatAmount(amount) {
  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 2,
  }).format(amount)
}

function getStatusLabel(status) {
  const labels = {
    disponible: 'Disponible',
    reservado: 'Reservado',
    vendido: 'Vendido',
  }

  return labels[status] ?? status
}

function validateForm(form) {
  const errors = {}
  const name = form.nombre_cliente.trim()
  const email = form.correo_cliente.trim()
  const phone = form.telefono_cliente.trim()

  if (name.length < 2 || name.length > 150) {
    errors.nombre_cliente = 'Escribe un nombre de entre 2 y 150 caracteres.'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.correo_cliente = 'Escribe un correo electrónico válido.'
  }

  if (phone.length < 1 || phone.length > 30) {
    errors.telefono_cliente = 'El teléfono debe tener entre 1 y 30 caracteres.'
  }

  if (form.mensaje_cliente.length > 5000) {
    errors.mensaje_cliente = 'El mensaje no puede superar 5000 caracteres.'
  }

  return errors
}

function getInventoryChanges(previousVehicles, latestVehicles, selectedIds) {
  const previousById = new Map(
    previousVehicles.map((vehicle) => [vehicle.id, vehicle]),
  )
  const latestById = new Map(
    latestVehicles.map((vehicle) => [vehicle.id, vehicle]),
  )

  return selectedIds.flatMap((id) => {
    const previousVehicle = previousById.get(id)
    const latestVehicle = latestById.get(id)

    if (!latestVehicle) {
      return [
        {
          id,
          name: previousVehicle
            ? `${previousVehicle.brand} ${previousVehicle.model}`
            : `Vehículo ${id}`,
          previousStatus: previousVehicle?.estado ?? 'sin verificar',
          latestStatus: 'no encontrado',
          previousPrice: previousVehicle?.price,
          latestPrice: undefined,
        },
      ]
    }

    if (
      previousVehicle &&
      (previousVehicle.estado !== latestVehicle.estado ||
        previousVehicle.price !== latestVehicle.price)
    ) {
      return [
        {
          id,
          name: `${latestVehicle.brand} ${latestVehicle.model}`,
          previousStatus: previousVehicle.estado,
          latestStatus: latestVehicle.estado,
          previousPrice: previousVehicle.price,
          latestPrice: latestVehicle.price,
        },
      ]
    }

    return []
  })
}

function VehicleDetailsDialog({ vehicle, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="cart-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="cart-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-dialog-title"
      >
        <button
          className="cart-dialog__close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar ficha del vehículo"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            close
          </span>
        </button>
        {vehicle.imageUrl ? (
          <img
            className="cart-dialog__image"
            src={vehicle.imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
          />
        ) : (
          <div className="cart-dialog__image cart-image-placeholder">
            Sin fotografía
          </div>
        )}
        <div className="cart-dialog__content">
          <span className="cart-eyebrow">
            {getStatusLabel(vehicle.estado)} · {vehicle.year}
          </span>
          <h2 id="cart-dialog-title">
            {vehicle.brand} {vehicle.model}
          </h2>
          <p className="cart-dialog__price">
            {formatAmount(vehicle.price)}
          </p>
          <p>{vehicle.description}</p>
          <dl className="cart-dialog__specs">
            <div>
              <dt>Kilometraje</dt>
              <dd>{vehicle.mileage.toLocaleString('es-MX')} km</dd>
            </div>
            <div>
              <dt>Transmisión</dt>
              <dd>{vehicle.transmission || 'No especificada'}</dd>
            </div>
            <div>
              <dt>Combustible</dt>
              <dd>{vehicle.fuel || 'No especificado'}</dd>
            </div>
            <div>
              <dt>Año</dt>
              <dd>{vehicle.year}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  )
}

function CartPage() {
  const { vehicleIds, storageMessage, removeVehicle, removeVehicles } = useCart()
  const [inventory, setInventory] = useState([])
  const [inventoryStatus, setInventoryStatus] = useState('loading')
  const [inventoryError, setInventoryError] = useState('')
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [reviewChanges, setReviewChanges] = useState([])
  const [reviewRequired, setReviewRequired] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitPhase, setSubmitPhase] = useState('idle')
  const [confirmation, setConfirmation] = useState(null)
  const inventoryRequestRef = useRef(0)
  const inventoryControllerRef = useRef(null)
  const submissionLockRef = useRef(false)

  useEffect(() => {
    const requestId = inventoryRequestRef.current + 1
    inventoryRequestRef.current = requestId
    const controller = new AbortController()
    inventoryControllerRef.current = controller

    listPublicVehicles({ signal: controller.signal })
      .then((vehicles) => {
        if (inventoryRequestRef.current === requestId) {
          setInventory(vehicles)
          setInventoryStatus('success')
        }
      })
      .catch((error) => {
        if (
          inventoryRequestRef.current === requestId &&
          error?.name !== 'AbortError'
        ) {
          setInventoryStatus('error')
          setInventoryError(
            'No pudimos consultar el inventario. Tu selección se conserva; intenta cargarlo de nuevo.',
          )
        }
      })
      .finally(() => {
        if (inventoryRequestRef.current === requestId) {
          inventoryControllerRef.current = null
        }
      })

    return () => {
      inventoryRequestRef.current += 1
      inventoryControllerRef.current?.abort()
    }
  }, [])

  const inventoryById = useMemo(
    () => new Map(inventory.map((vehicle) => [vehicle.id, vehicle])),
    [inventory],
  )
  const selectedVehicles = useMemo(
    () =>
      vehicleIds.map(
        (id) =>
          inventoryById.get(id) ?? {
            id,
            missing: inventoryStatus === 'success',
            unresolved: true,
          },
      ),
    [inventoryById, inventoryStatus, vehicleIds],
  )
  const itemCount = vehicleIds.length
  const subtotal = selectedVehicles.reduce(
    (total, vehicle) =>
      total + (Number.isFinite(vehicle.price) ? vehicle.price : 0),
    0,
  )
  const unavailableIds = useMemo(
    () =>
      inventoryStatus === 'success'
        ? vehicleIds.filter(
            (id) => inventoryById.get(id)?.estado !== 'disponible',
          )
        : vehicleIds,
    [inventoryById, inventoryStatus, vehicleIds],
  )
  const canSubmit =
    inventoryStatus === 'success' &&
    vehicleIds.length > 0 &&
    unavailableIds.length === 0 &&
    !isSubmitting

  function removeFromCart(vehicleId) {
    removeVehicle(vehicleId)
    setSelectedVehicle((currentVehicle) =>
      currentVehicle?.id === vehicleId ? null : currentVehicle,
    )
  }

  function updateForm(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
    setFormErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
    setSubmitError('')
  }

  function retryInventory() {
    const requestId = inventoryRequestRef.current + 1
    inventoryRequestRef.current = requestId
    inventoryControllerRef.current?.abort()
    const controller = new AbortController()
    inventoryControllerRef.current = controller
    setInventoryStatus('loading')
    setInventoryError('')

    listPublicVehicles({ signal: controller.signal })
      .then((vehicles) => {
        if (inventoryRequestRef.current === requestId) {
          setInventory(vehicles)
          setInventoryStatus('success')
        }
      })
      .catch((error) => {
        if (
          inventoryRequestRef.current === requestId &&
          error?.name !== 'AbortError'
        ) {
          setInventoryStatus('error')
          setInventoryError(
            'No pudimos consultar el inventario. Tu selección se conserva; intenta cargarlo de nuevo.',
          )
        }
      })
      .finally(() => {
        if (inventoryRequestRef.current === requestId) {
          inventoryControllerRef.current = null
        }
      })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (submissionLockRef.current) {
      return
    }

    const errors = validateForm(form)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    if (inventoryStatus !== 'success') {
      setSubmitError('Carga el inventario antes de enviar la solicitud.')
      return
    }

    const submittedIds = [...new Set(vehicleIds)]
    if (submittedIds.length === 0) {
      setSubmitError('Agrega al menos un vehículo disponible.')
      return
    }

    submissionLockRef.current = true
    setIsSubmitting(true)
    setSubmitPhase('checking')
    setSubmitError('')

    try {
      let latestVehicles

      try {
        latestVehicles = await listPublicVehicles()
      } catch {
        setSubmitError(
          'No se pudo verificar la disponibilidad actual. No se envió la solicitud y tu selección se conservó.',
        )
        return
      }

      const changes = getInventoryChanges(inventory, latestVehicles, submittedIds)
      setInventory(latestVehicles)
      setInventoryStatus('success')
      setInventoryError('')

      if (changes.length > 0) {
        setReviewChanges(changes)
        setReviewRequired(true)
        setSubmitError(
          'El precio o la disponibilidad cambió. Revisa los datos actualizados antes de confirmar.',
        )
        return
      }

      const latestById = new Map(
        latestVehicles.map((vehicle) => [vehicle.id, vehicle]),
      )
      if (
        submittedIds.some(
          (id) => latestById.get(id)?.estado !== 'disponible',
        )
      ) {
        setSubmitError(
          'Uno o más vehículos ya no están disponibles. Retíralos o elige otros antes de enviar.',
        )
        setReviewRequired(false)
        return
      }

      setReviewChanges([])
      setReviewRequired(false)
      setSubmitPhase('sending')

      try {
        const item = await createPurchaseRequest({
          nombre_cliente: form.nombre_cliente.trim(),
          correo_cliente: form.correo_cliente.trim(),
          telefono_cliente: form.telefono_cliente.trim(),
          vehiculos_ids: submittedIds,
          mensaje_cliente: form.mensaje_cliente.trim(),
        })

        setConfirmation(item)
        removeVehicles(submittedIds)
        setForm(EMPTY_FORM)
        setFormErrors({})
        setFormOpen(false)
      } catch (error) {
        if (error instanceof ApiError && [400, 404, 409, 422].includes(error.status)) {
          setSubmitError(
            error.status === 404
              ? 'Uno o más vehículos ya no existen. Tu selección se conservó; revisa el catálogo.'
              : error.message,
          )
        } else {
          setSubmitError(
            'No se pudo confirmar el resultado del envío. La solicitud pudo haberse registrado; no la reenvíes hasta consultar con AutoMarket.',
          )
        }
      }
    } finally {
      submissionLockRef.current = false
      setIsSubmitting(false)
      setSubmitPhase('idle')
    }
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <nav className="cart-breadcrumbs" aria-label="Ruta de navegación">
          <Link to="/">Inicio</Link>
          <span className="material-symbols-outlined" aria-hidden="true">
            chevron_right
          </span>
          <Link to="/autos">Vehículos</Link>
          <span className="material-symbols-outlined" aria-hidden="true">
            chevron_right
          </span>
          <span aria-current="page">Carrito</span>
        </nav>

        <header className="cart-heading">
          <div>
            <span className="cart-eyebrow">Tu próxima elección</span>
            <h1>Carrito de Selección</h1>
            <p>Revisa los vehículos reales que te interesan.</p>
          </div>
          <Link className="cart-back-link" to="/autos">
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
            Seguir explorando
          </Link>
        </header>

        {storageMessage ? (
          <aside className="cart-inventory-notice" role="status">
            <span
              className="material-symbols-outlined cart-inventory-notice__icon"
              aria-hidden="true"
            >
              info
            </span>
            <p>{storageMessage}</p>
          </aside>
        ) : null}

        {inventoryStatus === 'loading' ? (
          <p className="cart-inventory-status" role="status">
            Consultando inventario...
          </p>
        ) : null}
        {inventoryStatus === 'error' ? (
          <div className="cart-inventory-error" role="alert">
            <p>{inventoryError}</p>
            <button type="button" className="cart-secondary-button" onClick={retryInventory}>
              Reintentar
            </button>
          </div>
        ) : null}

        {confirmation ? (
          <section className="cart-confirmation" role="status" aria-live="polite">
            <h2>Solicitud enviada</h2>
            <p>
              Solicitud #{confirmation.id} · Estado: {confirmation.estado}
            </p>
            <p>
              Total estimado recibido del servidor:{' '}
              {String(confirmation.total_estimado)}
            </p>
            <p>
              El envío de una solicitud no constituye un pago ni una reserva
              confirmada.
            </p>
          </section>
        ) : null}

        {itemCount > 0 ? (
          <div className="cart-layout">
            <section className="cart-selection" aria-labelledby="cart-list-title">
              <div className="cart-section-heading">
                <div>
                  <span className="cart-eyebrow">Selección actual</span>
                  <h2 id="cart-list-title">Vehículos seleccionados</h2>
                </div>
                <span className="cart-count">
                  {itemCount} {itemCount === 1 ? 'vehículo' : 'vehículos'}
                </span>
              </div>

              <div className="cart-vehicle-list">
                {selectedVehicles.map((vehicle) => (
                  <article className="cart-vehicle-card" key={vehicle.id}>
                    {vehicle.missing || vehicle.unresolved ? (
                      <div className="cart-missing-vehicle">
                        <span className="material-symbols-outlined" aria-hidden="true">
                          warning
                        </span>
                        <p>
                          {vehicle.missing
                            ? `El vehículo ${vehicle.id} ya no aparece en el inventario actual.`
                            : `No se pudo consultar el vehículo ${vehicle.id}. La selección se conserva.`}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="cart-vehicle-card__image-wrap">
                          {vehicle.imageUrl ? (
                            <img
                              src={vehicle.imageUrl}
                              alt={`${vehicle.brand} ${vehicle.model}`}
                              className="cart-vehicle-card__image"
                            />
                          ) : (
                            <div
                              className="cart-image-placeholder"
                              aria-hidden="true"
                            >
                              Sin fotografía
                            </div>
                          )}
                          <span className="cart-vehicle-card__year">
                            {vehicle.year}
                          </span>
                        </div>
                        <div className="cart-vehicle-card__body">
                          <div className="cart-vehicle-card__top">
                            <div>
                              <span className="cart-vehicle-card__brand">
                                {vehicle.brand}
                              </span>
                              <h3>{vehicle.model}</h3>
                              <span
                                className={`cart-vehicle-status${vehicle.estado === 'disponible' ? '' : ' is-unavailable'}`}
                              >
                                {getStatusLabel(vehicle.estado)}
                              </span>
                            </div>
                            <button
                              className="cart-remove"
                              type="button"
                              onClick={() => removeFromCart(vehicle.id)}
                              aria-label={`Eliminar ${vehicle.brand} ${vehicle.model} del carrito`}
                              title="Eliminar vehículo"
                            >
                              <span className="material-symbols-outlined" aria-hidden="true">
                                delete
                              </span>
                            </button>
                          </div>
                          <dl className="cart-vehicle-specs">
                            <div>
                              <dt>
                                <span className="material-symbols-outlined" aria-hidden="true">
                                  speed
                                </span>
                                Kilometraje
                              </dt>
                              <dd>{vehicle.mileage.toLocaleString('es-MX')} km</dd>
                            </div>
                            <div>
                              <dt>
                                <span className="material-symbols-outlined" aria-hidden="true">
                                  settings
                                </span>
                                Transmisión
                              </dt>
                              <dd>{vehicle.transmission || 'No especificada'}</dd>
                            </div>
                            <div>
                              <dt>
                                <span className="material-symbols-outlined" aria-hidden="true">
                                  local_gas_station
                                </span>
                                Combustible
                              </dt>
                              <dd>{vehicle.fuel || 'No especificado'}</dd>
                            </div>
                          </dl>
                          <div className="cart-vehicle-card__footer">
                            <strong>
                              {formatAmount(vehicle.price)}
                              <span className="cart-price-unit"> · 1 unidad</span>
                            </strong>
                            <button
                              className="cart-details-button"
                              type="button"
                              onClick={() => setSelectedVehicle(vehicle)}
                            >
                              Consultar ficha
                              <span className="material-symbols-outlined" aria-hidden="true">
                                arrow_forward
                              </span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    {vehicle.missing || vehicle.unresolved ? (
                      <button
                        className="cart-remove cart-remove--missing"
                        type="button"
                        onClick={() => removeFromCart(vehicle.id)}
                        aria-label={`Eliminar vehículo ${vehicle.id} del carrito`}
                        title="Eliminar vehículo"
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          delete
                        </span>
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>

            <div className="cart-summary-column">
              <aside
                className={`cart-summary${formOpen ? ' is-form-open' : ''}`}
                aria-labelledby="cart-summary-title"
              >
                <div className="cart-summary__heading">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    receipt_long
                  </span>
                  <h2 id="cart-summary-title">Resumen de selección</h2>
                </div>
                <div className="cart-summary__count">
                  <span>Vehículos seleccionados</span>
                  <strong>{itemCount}</strong>
                </div>
                <div className="cart-summary__line">
                  <span>Total estimado</span>
                  <strong>{formatAmount(subtotal)}</strong>
                </div>
                <p className="cart-summary__note">
                  Valores mostrados según el inventario actual. La moneda no está
                  especificada por el backend.
                </p>
                {unavailableIds.length > 0 &&
                inventoryStatus === 'success' ? (
                  <p className="cart-unavailable-message" role="alert">
                    Retira los vehículos no disponibles para enviar la solicitud.
                  </p>
                ) : null}
                <button
                  className="cart-request-button"
                  type="button"
                  onClick={() => setFormOpen((isOpen) => !isOpen)}
                >
                  {formOpen ? 'Cerrar formulario' : 'Enviar solicitud de compra'}
                  <span className="material-symbols-outlined" aria-hidden="true">
                    {formOpen ? 'close' : 'arrow_forward'}
                  </span>
                </button>
                <p className="cart-summary__secure">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    info
                  </span>
                  Solicitud sin pago ni reserva confirmada
                </p>
              </aside>

              {formOpen ? (
                <section className="cart-request-form" aria-labelledby="request-form-title">
                  <h2 id="request-form-title">Datos de contacto</h2>
                  <p>Completa tus datos para que podamos contactarte.</p>
                  <form onSubmit={handleSubmit} noValidate>
                    <label htmlFor="request-name">
                      Nombre
                      <input
                        id="request-name"
                        name="nombre_cliente"
                        autoComplete="name"
                        minLength={2}
                        maxLength={150}
                        required
                        value={form.nombre_cliente}
                        onChange={updateForm}
                        aria-invalid={Boolean(formErrors.nombre_cliente)}
                        aria-describedby={
                          formErrors.nombre_cliente ? 'request-name-error' : undefined
                        }
                      />
                      {formErrors.nombre_cliente ? (
                        <span id="request-name-error" className="cart-field-error">
                          {formErrors.nombre_cliente}
                        </span>
                      ) : null}
                    </label>
                    <label htmlFor="request-email">
                      Correo electrónico
                      <input
                        id="request-email"
                        name="correo_cliente"
                        type="email"
                        autoComplete="email"
                        required
                        value={form.correo_cliente}
                        onChange={updateForm}
                        aria-invalid={Boolean(formErrors.correo_cliente)}
                        aria-describedby={
                          formErrors.correo_cliente ? 'request-email-error' : undefined
                        }
                      />
                      {formErrors.correo_cliente ? (
                        <span id="request-email-error" className="cart-field-error">
                          {formErrors.correo_cliente}
                        </span>
                      ) : null}
                    </label>
                    <label htmlFor="request-phone">
                      Teléfono
                      <input
                        id="request-phone"
                        name="telefono_cliente"
                        type="tel"
                        autoComplete="tel"
                        maxLength={30}
                        required
                        value={form.telefono_cliente}
                        onChange={updateForm}
                        aria-invalid={Boolean(formErrors.telefono_cliente)}
                        aria-describedby={
                          formErrors.telefono_cliente ? 'request-phone-error' : undefined
                        }
                      />
                      {formErrors.telefono_cliente ? (
                        <span id="request-phone-error" className="cart-field-error">
                          {formErrors.telefono_cliente}
                        </span>
                      ) : null}
                    </label>
                    <label htmlFor="request-message">
                      Mensaje (opcional)
                      <textarea
                        id="request-message"
                        name="mensaje_cliente"
                        maxLength={5000}
                        rows={4}
                        value={form.mensaje_cliente}
                        onChange={updateForm}
                        aria-invalid={Boolean(formErrors.mensaje_cliente)}
                        aria-describedby={
                          formErrors.mensaje_cliente
                            ? 'request-message-error'
                            : undefined
                        }
                      />
                      {formErrors.mensaje_cliente ? (
                        <span id="request-message-error" className="cart-field-error">
                          {formErrors.mensaje_cliente}
                        </span>
                      ) : null}
                    </label>

                    {inventoryStatus !== 'success' ? (
                      <p className="cart-form-notice" role="status">
                        Verifica el inventario antes de enviar la solicitud.
                      </p>
                    ) : null}
                    {reviewChanges.length > 0 ? (
                      <div className="cart-review-changes" role="alert">
                        <strong>Se actualizaron estos datos:</strong>
                        <ul>
                          {reviewChanges.map((change) => (
                            <li key={change.id}>
                              {change.name}: estado{' '}
                              {getStatusLabel(change.previousStatus)} →{' '}
                              {getStatusLabel(change.latestStatus)}
                              {change.previousPrice !== undefined ||
                              change.latestPrice !== undefined
                                ? `; precio ${change.previousPrice === undefined ? 'no disponible' : formatAmount(change.previousPrice)} → ${change.latestPrice === undefined ? 'no disponible' : formatAmount(change.latestPrice)}`
                                : ''}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {submitError ? (
                      <p className="cart-submit-error" role="alert">
                        {submitError}
                      </p>
                    ) : null}
                    <button
                      className="cart-request-button"
                      type="submit"
                      disabled={!canSubmit}
                    >
                      {isSubmitting
                        ? submitPhase === 'checking'
                          ? 'Verificando disponibilidad…'
                          : 'Enviando solicitud…'
                        : reviewRequired
                          ? 'Confirmar y enviar solicitud'
                          : 'Enviar solicitud'}
                    </button>
                  </form>
                </section>
              ) : null}
            </div>
          </div>
        ) : (
          <section className="cart-empty" aria-labelledby="cart-empty-title">
            <span className="material-symbols-outlined" aria-hidden="true">
              directions_car
            </span>
            <h2 id="cart-empty-title">Tu selección está vacía</h2>
            <p>
              Explora el catálogo y agrega los vehículos disponibles que te interesan.
            </p>
            <Link className="cart-request-button" to="/autos">
              Explorar vehículos
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </section>
        )}

        <section className="cart-benefits" aria-labelledby="cart-benefits-title">
          <div className="cart-benefits__heading">
            <span className="cart-eyebrow">Compra con confianza</span>
            <h2 id="cart-benefits-title">Una selección, con respaldo</h2>
          </div>
          <div className="cart-benefits__grid">
            <article className="cart-benefit">
              <span className="material-symbols-outlined" aria-hidden="true">
                fact_check
              </span>
              <div>
                <h3>Información transparente</h3>
                <p>Consulta los datos principales de cada vehículo seleccionado.</p>
              </div>
            </article>
            <article className="cart-benefit">
              <span className="material-symbols-outlined" aria-hidden="true">
                verified
              </span>
              <div>
                <h3>Selección confiable</h3>
                <p>
                  La disponibilidad se comprueba antes del envío, pero no garantiza
                  una reserva ni reemplaza la validación del backend.
                </p>
              </div>
            </article>
            <article className="cart-benefit">
              <span className="material-symbols-outlined" aria-hidden="true">
                support_agent
              </span>
              <div>
                <h3>Acompañamiento cercano</h3>
                <p>Estamos para orientarte mientras exploras tus opciones.</p>
              </div>
            </article>
          </div>
        </section>
      </div>

      {selectedVehicle ? (
        <VehicleDetailsDialog
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      ) : null}
    </div>
  )
}

export default CartPage
