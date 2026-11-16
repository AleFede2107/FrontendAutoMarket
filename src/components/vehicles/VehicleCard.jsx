import { Link } from 'react-router'

function formatPrice(price) {
  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: 2,
  }).format(price)
}

function getStatusLabel(status) {
  const labels = {
    disponible: 'Disponible',
    reservado: 'Reservado',
    vendido: 'Vendido',
  }

  return labels[status] ?? status
}

function VehicleCard({ vehicle, onDetails, onAdd, isSelected = false }) {
  const isAvailable = vehicle.estado === 'disponible'

  return (
    <article className="vehicle-card">
      <div className="vehicle-card__image-wrap">
        {vehicle.imageUrl ? (
          <img
            className="vehicle-card__image"
            src={vehicle.imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            loading="lazy"
          />
        ) : (
          <div className="vehicle-card__image-placeholder" aria-hidden="true">
            Sin fotografía
          </div>
        )}
        <span className="vehicle-card__year">{vehicle.year}</span>
      </div>
      <div className="vehicle-card__content">
        <p className="vehicle-card__eyebrow">{vehicle.brand}</p>
        <h3>{vehicle.model}</h3>
        <div className="vehicle-card__meta">
          <span>{vehicle.mileage.toLocaleString('es-MX')} km</span>
          <span>{vehicle.transmission}</span>
        </div>
        <div className="vehicle-card__footer">
          <strong aria-label={`Precio ${formatPrice(vehicle.price)}, moneda no especificada`}>
            {formatPrice(vehicle.price)}
          </strong>
          {onDetails ? (
            <button
              className="text-button"
              type="button"
              onClick={() => onDetails(vehicle)}
              aria-label={`Ver detalles de ${vehicle.brand} ${vehicle.model}`}
            >
              Ver detalles
              <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
        {onAdd ? (
          <div className="vehicle-card__cart-actions">
            <span className="vehicle-card__status">
              {getStatusLabel(vehicle.estado)}
            </span>
            {isSelected ? (
              <Link className="vehicle-card__cart-action is-selected" to="/carrito">
                En el carrito
              </Link>
            ) : (
              <button
                className="vehicle-card__cart-action"
                type="button"
                disabled={!isAvailable}
                onClick={() => onAdd(vehicle.id)}
              >
                {isAvailable ? 'Agregar al carrito' : 'No disponible'}
              </button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default VehicleCard
