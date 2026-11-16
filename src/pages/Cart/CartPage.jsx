import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import './CartPage.css'

const demoVehicles = [
  {
    id: 'toyota-corolla-2023',
    brand: 'Toyota',
    model: 'Corolla SE',
    year: 2023,
    price: 28900,
    mileage: 18400,
    transmission: 'Automática',
    fuel: 'Gasolina',
    bodyStyle: 'Sedán',
    description:
      'Un sedán cómodo y eficiente, con cámara de reversa, pantalla multimedia y amplio espacio para viajar.',
    imageUrl:
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'honda-civic-2022',
    brand: 'Honda',
    model: 'Civic Touring',
    year: 2022,
    price: 31500,
    mileage: 22100,
    transmission: 'Automática',
    fuel: 'Gasolina',
    bodyStyle: 'Sedán',
    description:
      'Diseño deportivo, interiores premium y tecnología de asistencia para disfrutar cada trayecto.',
    imageUrl:
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'mazda-cx5-2024',
    brand: 'Mazda',
    model: 'CX-5 Grand Touring',
    year: 2024,
    price: 36900,
    mileage: 9600,
    transmission: 'Automática',
    fuel: 'Gasolina',
    bodyStyle: 'SUV',
    description:
      'SUV versátil con acabados cuidados, conducción ágil y espacio para acompañarte en nuevas rutas.',
    imageUrl:
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85',
  },
]

function formatPrice(price) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
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
        <img
          className="cart-dialog__image"
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
        />
        <div className="cart-dialog__content">
          <span className="cart-eyebrow">
            {vehicle.bodyStyle} · {vehicle.year}
          </span>
          <h2 id="cart-dialog-title">
            {vehicle.brand} {vehicle.model}
          </h2>
          <p className="cart-dialog__price">{formatPrice(vehicle.price)}</p>
          <p>{vehicle.description}</p>
          <dl className="cart-dialog__specs">
            <div>
              <dt>Kilometraje</dt>
              <dd>{vehicle.mileage.toLocaleString('es-MX')} km</dd>
            </div>
            <div>
              <dt>Transmisión</dt>
              <dd>{vehicle.transmission}</dd>
            </div>
            <div>
              <dt>Combustible</dt>
              <dd>{vehicle.fuel}</dd>
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
  const [vehicles, setVehicles] = useState(() =>
    demoVehicles.map((vehicle) => ({ ...vehicle, quantity: 1 })),
  )
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const itemCount = useMemo(
    () => vehicles.reduce((total, vehicle) => total + vehicle.quantity, 0),
    [vehicles],
  )
  const subtotal = useMemo(
    () =>
      vehicles.reduce(
        (total, vehicle) => total + vehicle.price * vehicle.quantity,
        0,
      ),
    [vehicles],
  )

  function updateQuantity(vehicleId, change) {
    setVehicles((currentVehicles) =>
      currentVehicles.map((vehicle) =>
        vehicle.id === vehicleId
          ? { ...vehicle, quantity: Math.max(1, vehicle.quantity + change) }
          : vehicle,
      ),
    )
  }

  function removeVehicle(vehicleId) {
    setVehicles((currentVehicles) =>
      currentVehicles.filter((vehicle) => vehicle.id !== vehicleId),
    )
    setSelectedVehicle((currentVehicle) =>
      currentVehicle?.id === vehicleId ? null : currentVehicle,
    )
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
            <p>Revisa y ajusta los vehículos que te interesan.</p>
          </div>
          <Link className="cart-back-link" to="/autos">
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_back
            </span>
            Seguir explorando
          </Link>
        </header>

        <aside className="cart-inventory-notice" aria-label="Aviso de inventario">
          <span
            className="material-symbols-outlined cart-inventory-notice__icon"
            aria-hidden="true"
          >
            info
          </span>
          <p>
            <strong>Catálogo de demostración.</strong> Los vehículos y precios
            son datos locales de muestra; no representan disponibilidad real.
          </p>
        </aside>

        {vehicles.length > 0 ? (
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
                {vehicles.map((vehicle) => (
                  <article className="cart-vehicle-card" key={vehicle.id}>
                    <div className="cart-vehicle-card__image-wrap">
                      <img
                        src={vehicle.imageUrl}
                        alt={`${vehicle.brand} ${vehicle.model}`}
                        className="cart-vehicle-card__image"
                      />
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
                        </div>
                        <button
                          className="cart-remove"
                          type="button"
                          onClick={() => removeVehicle(vehicle.id)}
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
                          <dd>{vehicle.transmission}</dd>
                        </div>
                        <div>
                          <dt>
                            <span className="material-symbols-outlined" aria-hidden="true">
                              local_gas_station
                            </span>
                            Combustible
                          </dt>
                          <dd>{vehicle.fuel}</dd>
                        </div>
                      </dl>
                      <div className="cart-vehicle-card__footer">
                        <strong>{formatPrice(vehicle.price * vehicle.quantity)}</strong>
                        <div className="cart-quantity" aria-label="Cantidad">
                          <button
                            type="button"
                            onClick={() => updateQuantity(vehicle.id, -1)}
                            disabled={vehicle.quantity === 1}
                            aria-label={`Reducir cantidad de ${vehicle.brand} ${vehicle.model}`}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">
                              remove
                            </span>
                          </button>
                          <span aria-live="polite">{vehicle.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(vehicle.id, 1)}
                            aria-label={`Aumentar cantidad de ${vehicle.brand} ${vehicle.model}`}
                          >
                            <span className="material-symbols-outlined" aria-hidden="true">
                              add
                            </span>
                          </button>
                        </div>
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
                  </article>
                ))}
              </div>
            </section>

            <aside className="cart-summary" aria-labelledby="cart-summary-title">
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
                <span>Subtotal estimado</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="cart-summary__note">
                Precios referenciales de demostración, sujetos a confirmación.
              </p>
              <div className="cart-summary__total">
                <span>Total estimado</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <Link className="cart-request-button" to="/autos">
                Seguir explorando
                <span className="material-symbols-outlined" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>
              <p className="cart-summary__secure">
                <span className="material-symbols-outlined" aria-hidden="true">
                  info
                </span>
                Vista demostrativa, sin solicitudes ni reservas
              </p>
            </aside>
          </div>
        ) : (
          <section className="cart-empty" aria-labelledby="cart-empty-title">
            <span className="material-symbols-outlined" aria-hidden="true">
              directions_car
            </span>
            <h2 id="cart-empty-title">Tu selección está vacía</h2>
            <p>
              Explora el catálogo y agrega los vehículos que quieras comparar.
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
                <p>Vehículos presentados con información clara para comparar.</p>
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
