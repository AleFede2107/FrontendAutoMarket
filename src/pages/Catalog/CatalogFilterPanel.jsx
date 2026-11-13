import { useState } from 'react'

function getOptions(vehicles, property) {
  return [...new Set(vehicles.map((vehicle) => vehicle[property]))]
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second, 'es-MX'))
}

function CatalogFilterPanel({ vehicles, filters, isOpen, onApply, onClear }) {
  const [brand, setBrand] = useState(filters.brand)
  const [bodyStyle, setBodyStyle] = useState(filters.bodyStyle)
  const [minPrice, setMinPrice] = useState(filters.minPrice)
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice)
  const [minYear, setMinYear] = useState(filters.minYear)
  const [maxYear, setMaxYear] = useState(filters.maxYear)
  const [transmission, setTransmission] = useState(filters.transmission)
  const [fuel, setFuel] = useState(filters.fuel)
  const [validationMessage, setValidationMessage] = useState('')

  const brands = getOptions(vehicles, 'brand')
  const bodyStyles = getOptions(vehicles, 'bodyStyle')
  const transmissions = getOptions(vehicles, 'transmission')
  const fuels = getOptions(vehicles, 'fuel')

  function handleSubmit(event) {
    event.preventDefault()

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setValidationMessage('El precio mínimo no puede superar al máximo.')
      return
    }

    if (minYear && maxYear && Number(minYear) > Number(maxYear)) {
      setValidationMessage('El año mínimo no puede superar al máximo.')
      return
    }

    setValidationMessage('')
    onApply({
      brand,
      bodyStyle,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      transmission,
      fuel,
    })
  }

  function handleClear() {
    setBrand('')
    setBodyStyle('')
    setMinPrice('')
    setMaxPrice('')
    setMinYear('')
    setMaxYear('')
    setTransmission('')
    setFuel('')
    setValidationMessage('')
    onClear()
  }

  return (
    <aside
      className={`catalog-filter-panel${isOpen ? ' is-open' : ''}`}
      id="catalog-filters"
      aria-labelledby="catalog-filter-title"
    >
      <form onSubmit={handleSubmit}>
        <div className="catalog-filter-panel__heading">
          <div>
            <span className="eyebrow">Refina tu búsqueda</span>
            <h3 id="catalog-filter-title">Filtros</h3>
          </div>
          <span className="catalog-filter-panel__icon" aria-hidden="true">
            ☷
          </span>
        </div>

        <label className="catalog-filter-panel__field" htmlFor="filter-brand">
          <span>Marca</span>
          <select
            id="filter-brand"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          >
            <option value="">Todas las marcas</option>
            {brands.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="catalog-filter-panel__field" htmlFor="filter-body">
          <span>Carrocería</span>
          <select
            id="filter-body"
            value={bodyStyle}
            onChange={(event) => setBodyStyle(event.target.value)}
          >
            <option value="">Todas las carrocerías</option>
            {bodyStyles.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="catalog-filter-panel__group">
          <legend>Rango de precios (USD)</legend>
          <div className="catalog-filter-panel__range">
            <label htmlFor="filter-price-min">
              <span>Mínimo</span>
              <input
                id="filter-price-min"
                type="number"
                min="0"
                step="100"
                placeholder="Sin mínimo"
                value={minPrice}
                onChange={(event) => setMinPrice(event.target.value)}
              />
            </label>
            <label htmlFor="filter-price-max">
              <span>Máximo</span>
              <input
                id="filter-price-max"
                type="number"
                min="0"
                step="100"
                placeholder="Sin máximo"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="catalog-filter-panel__group">
          <legend>Año</legend>
          <div className="catalog-filter-panel__range">
            <label htmlFor="filter-year-min">
              <span>Mínimo</span>
              <input
                id="filter-year-min"
                type="number"
                min="1900"
                max="2100"
                step="1"
                placeholder="Cualquier año"
                value={minYear}
                onChange={(event) => setMinYear(event.target.value)}
              />
            </label>
            <label htmlFor="filter-year-max">
              <span>Máximo</span>
              <input
                id="filter-year-max"
                type="number"
                min="1900"
                max="2100"
                step="1"
                placeholder="Cualquier año"
                value={maxYear}
                onChange={(event) => setMaxYear(event.target.value)}
              />
            </label>
          </div>
        </fieldset>

        <label
          className="catalog-filter-panel__field"
          htmlFor="filter-transmission"
        >
          <span>Transmisión</span>
          <select
            id="filter-transmission"
            value={transmission}
            onChange={(event) => setTransmission(event.target.value)}
          >
            <option value="">Todas las transmisiones</option>
            {transmissions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="catalog-filter-panel__field" htmlFor="filter-fuel">
          <span>Combustible</span>
          <select
            id="filter-fuel"
            value={fuel}
            onChange={(event) => setFuel(event.target.value)}
          >
            <option value="">Todos los combustibles</option>
            {fuels.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        {validationMessage && (
          <p className="catalog-filter-panel__error" role="alert">
            {validationMessage}
          </p>
        )}

        <div className="catalog-filter-panel__actions">
          <button className="catalog-filter-panel__apply" type="submit">
            Aplicar filtros
          </button>
          <button
            className="catalog-filter-panel__clear"
            type="button"
            onClick={handleClear}
          >
            Limpiar filtros
          </button>
        </div>
      </form>
    </aside>
  )
}

export default CatalogFilterPanel
