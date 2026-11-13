import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import VehicleCard from '../../components/vehicles/VehicleCard.jsx'
import {
  HomeCatalogCta,
  HomeQuickSearch,
  PopularBrands,
  VehicleCategories,
  WhyAutoMarket,
} from '../../components/home/HomeSections.jsx'
import { getVehicles } from '../../services/vehicleService.js'

function HomePage() {
  const [vehicles, setVehicles] = useState([])
  const [featuredVehicles, setFeaturedVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getVehicles()
      .then((result) => {
        if (active) {
          setVehicles(result)
          setFeaturedVehicles(result.filter((vehicle) => vehicle.featured))
        }
      })
      .catch(() => {
        if (active) {
          setError('No pudimos cargar los vehículos. Inténtalo más tarde.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const heroVehicle = featuredVehicles[0] ?? vehicles[0]

  return (
    <div className="home-page">
      <section className="home-hero">
        <div
          className="home-hero__glow home-hero__glow--left"
          aria-hidden="true"
        />
        <div
          className="home-hero__glow home-hero__glow--right"
          aria-hidden="true"
        />
        <div className="home-container home-hero__content">
          <div className="home-hero__grid">
            <div className="home-hero__copy">
              <span className="home-hero__badge">
                <span aria-hidden="true" />
                Encuentra tu próximo auto
              </span>
              <h1>
                El vehículo perfecto para tu{' '}
                <span>próximo destino.</span>
              </h1>
              <p>
                Explora el inventario de AutoMarket y compara marca,
                carrocería y presupuesto en un solo lugar.
              </p>
              <div className="home-hero__actions">
                <Link className="home-button home-button--blue" to="/autos">
                  Explorar vehículos
                  <span className="material-symbols-outlined" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
                <a className="home-button home-button--ghost" href="#ventajas">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    play_circle
                  </span>
                  Cómo funciona
                </a>
              </div>
              <div className="home-hero__metrics" aria-label="Resumen del catálogo">
                <div>
                  <strong>{loading ? '—' : vehicles.length}</strong>
                  <span>Vehículos en catálogo</span>
                </div>
                <div>
                  <strong>{loading ? '—' : featuredVehicles.length}</strong>
                  <span>Opciones destacadas</span>
                </div>
                <div>
                  <strong>{loading ? '—' : new Set(vehicles.map((vehicle) => vehicle.brand)).size}</strong>
                  <span>Marcas disponibles</span>
                </div>
              </div>
            </div>
            <div className="home-hero__visual">
              {heroVehicle ? (
                <img
                  src={heroVehicle.imageUrl}
                  alt={`${heroVehicle.brand} ${heroVehicle.model}`}
                />
              ) : (
                <div className="home-hero__image-placeholder" />
              )}
              <div className="home-hero__visual-shade" />
              {heroVehicle ? (
                <div className="home-hero__vehicle">
                  <div>
                    <span>Destacado de AutoMarket</span>
                    <strong>
                      {heroVehicle.brand} {heroVehicle.model}
                    </strong>
                  </div>
                  <span>{heroVehicle.year}</span>
                </div>
              ) : null}
            </div>
          </div>
          <HomeQuickSearch vehicles={vehicles} />
        </div>
      </section>

      <section className="home-section home-section--featured" id="destacados">
        <div className="home-container">
          <div className="home-section-heading home-section-heading--row">
            <div>
              <span className="home-eyebrow">Selección AutoMarket</span>
              <h2 id="featured-title">Vehículos destacados</h2>
            </div>
            <Link className="home-text-link" to="/autos">
              Ver todo el catálogo
              <span className="material-symbols-outlined" aria-hidden="true">
                arrow_forward
              </span>
            </Link>
          </div>
          {error ? (
            <p className="home-status home-status--error" role="alert">
              {error}
            </p>
          ) : loading ? (
            <p className="home-status" role="status">
              Cargando vehículos destacados...
            </p>
          ) : featuredVehicles.length ? (
            <div className="vehicle-grid home-vehicle-grid">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <p className="home-status">No hay vehículos destacados por el momento.</p>
          )}
        </div>
      </section>

      <VehicleCategories vehicles={vehicles} />
      <div className="home-container">
        <PopularBrands vehicles={vehicles} />
      </div>
      <WhyAutoMarket />
      <HomeCatalogCta />
    </div>
  )
}

export default HomePage
