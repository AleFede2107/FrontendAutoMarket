import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

const PRICE_FILTERS = [
  { value: 'under30000', label: 'Hasta $30,000 USD' },
  { value: '30000to35000', label: '$30,000 – $35,000 USD' },
  { value: 'over35000', label: 'Más de $35,000 USD' },
]

const CATEGORY_ICONS = {
  SUV: 'directions_car',
  Sedán: 'commute',
  Coupé: 'speed',
  Hatchback: 'minor_crash',
}

function SectionHeading({ eyebrow, title, description, centered = false }) {
  return (
    <div className={`home-section-heading${centered ? ' is-centered' : ''}`}>
      <span className="home-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  )
}

export function HomeQuickSearch({ vehicles }) {
  const [brand, setBrand] = useState('')
  const [bodyStyle, setBodyStyle] = useState('')
  const [budget, setBudget] = useState('')
  const navigate = useNavigate()
  const brands = [...new Set(vehicles.map((vehicle) => vehicle.brand))].sort()
  const bodyStyles = [...new Set(vehicles.map((vehicle) => vehicle.bodyStyle))]

  function handleSubmit(event) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (brand) params.set('marca', brand)
    if (bodyStyle) params.set('carroceria', bodyStyle)
    if (budget) params.set('presupuesto', budget)
    const query = params.toString()
    navigate(query ? `/autos?${query}` : '/autos')
  }

  return (
    <form className="home-quick-search" onSubmit={handleSubmit}>
      <div className="home-quick-search__field">
        <label htmlFor="home-brand">Marca</label>
        <select
          id="home-brand"
          value={brand}
          onChange={(event) => setBrand(event.target.value)}
        >
          <option value="">Todas las marcas</option>
          {brands.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div className="home-quick-search__field">
        <label htmlFor="home-body-style">Carrocería</label>
        <select
          id="home-body-style"
          value={bodyStyle}
          onChange={(event) => setBodyStyle(event.target.value)}
        >
          <option value="">Cualquier tipo</option>
          {bodyStyles.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>
      <div className="home-quick-search__field">
        <label htmlFor="home-budget">Presupuesto</label>
        <select
          id="home-budget"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
        >
          <option value="">Cualquier presupuesto</option>
          {PRICE_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>
      <button className="home-button home-button--blue" type="submit">
        <span className="material-symbols-outlined" aria-hidden="true">
          search
        </span>
        Buscar autos
      </button>
    </form>
  )
}

export function VehicleCategories({ vehicles }) {
  const categories = [...new Set(vehicles.map((vehicle) => vehicle.bodyStyle))]

  return (
    <section className="home-section home-section--tinted" id="categorias">
      <div className="home-container">
        <SectionHeading
          centered
          eyebrow="Encuentra tu estilo"
          title="Explora por categoría"
          description="Elige el tipo de vehículo que mejor acompaña tus planes."
        />
        <div className="home-category-grid">
          {categories.map((category) => {
            const count = vehicles.filter(
              (vehicle) => vehicle.bodyStyle === category,
            ).length

            return (
              <Link
                className="home-category-card"
                key={category}
                to={`/autos?carroceria=${encodeURIComponent(category)}`}
              >
                <span
                  className="home-category-card__icon material-symbols-outlined"
                  aria-hidden="true"
                >
                  {CATEGORY_ICONS[category] ?? 'directions_car'}
                </span>
                <span className="home-category-card__title">{category}</span>
                <span className="home-category-card__count">
                  {count} {count === 1 ? 'vehículo' : 'vehículos'}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function PopularBrands({ vehicles }) {
  const brands = [...new Set(vehicles.map((vehicle) => vehicle.brand))].sort()

  return (
    <section className="home-brands" id="marcas">
      <p className="home-brands__label">Marcas disponibles</p>
      <div className="home-brands__list">
        {brands.map((brand) => (
          <Link
            key={brand}
            to={`/autos?marca=${encodeURIComponent(brand)}`}
          >
            {brand}
          </Link>
        ))}
      </div>
    </section>
  )
}

export function WhyAutoMarket() {
  const benefits = [
    {
      icon: 'manage_search',
      title: 'Busca a tu manera',
      description:
        'Filtra el catálogo por marca, carrocería y presupuesto desde un solo lugar.',
    },
    {
      icon: 'fact_check',
      title: 'Información a la vista',
      description:
        'Consulta año, recorrido, transmisión, combustible y precio de cada vehículo.',
    },
    {
      icon: 'devices',
      title: 'Explora donde quieras',
      description:
        'Navega por el catálogo desde escritorio, tableta o teléfono.',
    },
  ]

  return (
    <section className="home-section" id="ventajas">
      <div className="home-container">
        <SectionHeading
          centered
          eyebrow="Una mejor forma de buscar"
          title="¿Por qué AutoMarket?"
          description="Herramientas sencillas para encontrar y comparar vehículos."
        />
        <div className="home-benefit-grid">
          {benefits.map((benefit) => (
            <article className="home-benefit-card" key={benefit.title}>
              <span
                className="home-benefit-card__icon material-symbols-outlined"
                aria-hidden="true"
              >
                {benefit.icon}
              </span>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HomeCatalogCta() {
  return (
    <section className="home-cta-wrap">
      <div className="home-cta">
        <div>
          <span className="home-eyebrow">Tu próximo destino</span>
          <h2>¿Listo para encontrar tu próximo auto?</h2>
          <p>Explora los vehículos disponibles en AutoMarket.</p>
        </div>
        <Link className="home-button home-button--light" to="/autos">
          Ir al catálogo
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_forward
          </span>
        </Link>
      </div>
    </section>
  )
}
