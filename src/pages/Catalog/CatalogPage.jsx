import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import CatalogFilterPanel from './CatalogFilterPanel.jsx'
import {
  buildCatalogSearchParams,
  filterVehicles,
  getActiveFilters,
  readCatalogFilters,
} from './catalogFilters.js'
import VehicleCard from '../../components/vehicles/VehicleCard.jsx'
import { getVehicles } from '../../services/vehicleService.js'

const PAGE_SIZE = 6

function formatPrice(price) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function VehicleDetailsModal({ vehicle, onClose }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="vehicle-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-modal-title"
      >
        <button
          className="vehicle-modal__close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalles"
        >
          ×
        </button>
        <img
          className="vehicle-modal__image"
          src={vehicle.imageUrl}
          alt={`${vehicle.brand} ${vehicle.model}`}
        />
        <div className="vehicle-modal__content">
          <span className="eyebrow">
            {vehicle.bodyStyle} · {vehicle.year}
          </span>
          <h2 id="vehicle-modal-title">
            {vehicle.brand} {vehicle.model}
          </h2>
          <p className="vehicle-modal__price">{formatPrice(vehicle.price)}</p>
          <p>{vehicle.description}</p>
          <dl className="vehicle-modal__specs">
            <div>
              <dt>Recorrido</dt>
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
          <button
            className="button button--primary"
            type="button"
            onClick={onClose}
          >
            Volver al catálogo
          </button>
        </div>
      </section>
    </div>
  )
}

function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(
    () => readCatalogFilters(searchParams),
    [searchParams],
  )
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    let active = true

    getVehicles()
      .then((result) => {
        if (active) setVehicles(result)
      })
      .catch(() => {
        if (active) {
          setError('No pudimos cargar los vehículos. Inténtalo de nuevo más tarde.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const filteredVehicles = useMemo(() => {
    return filterVehicles(vehicles, filters)
  }, [filters, vehicles])

  const pageCount = Math.ceil(filteredVehicles.length / PAGE_SIZE)
  const activeFilters = useMemo(() => getActiveFilters(filters), [filters])
  const displayedPage = Math.min(currentPage, Math.max(pageCount, 1))
  const pageVehicles = filteredVehicles.slice(
    (displayedPage - 1) * PAGE_SIZE,
    displayedPage * PAGE_SIZE,
  )

  function applyFilters(nextFilters) {
    setCurrentPage(1)
    setSearchParams(buildCatalogSearchParams(nextFilters))
    setMobileFiltersOpen(false)
  }

  function clearFilters() {
    setCurrentPage(1)
    setSearchParams({})
    setMobileFiltersOpen(false)
  }

  function removeFilter(paramsToRemove) {
    const nextSearchParams = new URLSearchParams(searchParams)
    paramsToRemove.forEach((param) => nextSearchParams.delete(param))
    setCurrentPage(1)
    setSearchParams(nextSearchParams)
  }

  function changePage(page) {
    setCurrentPage(page)
  }

  return (
    <div className="catalog-page">
      <section className="catalog-hero">
        <div className="catalog-hero__content">
          <span className="eyebrow">Encuentra el tuyo</span>
          <h1>Un gran camino empieza con el auto correcto.</h1>
          <p>Explora nuestra selección y encuentra el que se adapta a ti.</p>
          <nav className="breadcrumbs" aria-label="Ruta de navegación">
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <span>Catálogo</span>
          </nav>
        </div>
        <div className="catalog-hero__decoration" aria-hidden="true">
          <span>AM</span>
        </div>
      </section>

      <section
        className="catalog-results"
        id="catalog-results"
        aria-labelledby="catalog-title"
      >
        <div className="section-heading catalog-heading">
          <div>
            <span className="eyebrow">Nuestra colección</span>
            <h2 id="catalog-title">Catálogo de autos</h2>
          </div>
          {!loading && !error ? (
            <span className="catalog-count">
              {filteredVehicles.length}{' '}
              {filteredVehicles.length === 1 ? 'vehículo' : 'vehículos'}
            </span>
          ) : null}
        </div>

        <button
          className="catalog-mobile-filter-toggle"
          type="button"
          aria-expanded={mobileFiltersOpen}
          aria-controls="catalog-filters"
          onClick={() => setMobileFiltersOpen((isOpen) => !isOpen)}
        >
          <span aria-hidden="true">☷</span>
          {mobileFiltersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>

        <div className="catalog-layout">
          <CatalogFilterPanel
            key={searchParams.toString()}
            vehicles={vehicles}
            filters={filters}
            isOpen={mobileFiltersOpen}
            onApply={applyFilters}
            onClear={clearFilters}
          />

          <div className="catalog-results__content">
            {activeFilters.length ? (
              <div
                className="catalog-active-filters"
                aria-label="Filtros aplicados"
              >
                {activeFilters.map((filter) => (
                  <button
                    className="catalog-active-filters__item"
                    key={filter.key}
                    type="button"
                    aria-label={`Quitar filtro: ${filter.label}`}
                    onClick={() => removeFilter(filter.params)}
                  >
                    {filter.label}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            ) : null}

            {loading ? (
              <div className="catalog-message" role="status">
                <span className="loading-spinner" aria-hidden="true" />
                Cargando vehículos...
              </div>
            ) : error ? (
              <div
                className="catalog-message catalog-message--error"
                role="alert"
              >
                <span>{error}</span>
                <button
                  className="button button--outline"
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="catalog-message">
                <span className="empty-state-icon" aria-hidden="true">
                  ⌕
                </span>
                <h3>No encontramos vehículos con estos filtros</h3>
                <p>
                  Ajusta los criterios o limpia los filtros para ver todo el
                  catálogo.
                </p>
                <button
                  className="button button--outline"
                  type="button"
                  onClick={clearFilters}
                >
                  Ver todos los autos
                </button>
              </div>
            ) : (
              <>
                <div className="vehicle-grid">
                  {pageVehicles.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onDetails={setSelectedVehicle}
                    />
                  ))}
                </div>
                {pageCount > 1 ? (
                  <nav
                    className="pagination"
                    aria-label="Paginación del catálogo"
                  >
                    <button
                      className="pagination__arrow"
                      type="button"
                      disabled={displayedPage === 1}
                      onClick={() => changePage(displayedPage - 1)}
                      aria-label="Página anterior"
                    >
                      ←
                    </button>
                    {Array.from(
                      { length: pageCount },
                      (_, index) => index + 1,
                    ).map((page) => (
                      <button
                        className={`pagination__page${page === displayedPage ? ' is-active' : ''}`}
                        key={page}
                        type="button"
                        onClick={() => changePage(page)}
                        aria-current={
                          page === displayedPage ? 'page' : undefined
                        }
                        aria-label={`Página ${page}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="pagination__arrow"
                      type="button"
                      disabled={displayedPage === pageCount}
                      onClick={() => changePage(displayedPage + 1)}
                      aria-label="Página siguiente"
                    >
                      →
                    </button>
                  </nav>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>

      {selectedVehicle ? (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      ) : null}
    </div>
  )
}

export default CatalogPage
