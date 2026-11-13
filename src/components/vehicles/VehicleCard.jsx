function formatPrice(price) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function VehicleCard({ vehicle, onDetails }) {
  return (
    <article className="vehicle-card">
      <div className="vehicle-card__image-wrap">
        <img
          className="vehicle-card__image"
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
          loading="lazy"
        />
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
          <strong>{formatPrice(vehicle.price)}</strong>
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
      </div>
    </article>
  )
}

export default VehicleCard
