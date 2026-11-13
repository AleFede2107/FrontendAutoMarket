const LEGACY_BUDGET_FILTERS = {
  under30000: {
    label: 'Hasta $30,000 USD',
    maxPrice: '30000',
    matches: (price) => price < 30000,
  },
  '30000to35000': {
    label: '$30,000 – $35,000 USD',
    minPrice: '30000',
    maxPrice: '35000',
    matches: (price) => price >= 30000 && price <= 35000,
  },
  over35000: {
    label: 'Más de $35,000 USD',
    minPrice: '35000',
    matches: (price) => price > 35000,
  },
}

function getLegacyBudgetFilter(budget) {
  return Object.prototype.hasOwnProperty.call(LEGACY_BUDGET_FILTERS, budget)
    ? LEGACY_BUDGET_FILTERS[budget]
    : null
}

function readCatalogFilters(searchParams) {
  const budget = searchParams.get('presupuesto') ?? ''
  const budgetFilter = getLegacyBudgetFilter(budget)
  const urlMinPrice = searchParams.get('precioMin') ?? ''
  const urlMaxPrice = searchParams.get('precioMax') ?? ''
  const hasExplicitPrice = Boolean(urlMinPrice || urlMaxPrice)

  return {
    brand: searchParams.get('marca') ?? '',
    bodyStyle: searchParams.get('carroceria') ?? '',
    minPrice:
      urlMinPrice ||
      (!hasExplicitPrice ? (budgetFilter?.minPrice ?? '') : ''),
    maxPrice:
      urlMaxPrice ||
      (!hasExplicitPrice ? (budgetFilter?.maxPrice ?? '') : ''),
    minYear: searchParams.get('anioMin') ?? '',
    maxYear: searchParams.get('anioMax') ?? '',
    transmission: searchParams.get('transmision') ?? '',
    fuel: searchParams.get('combustible') ?? '',
    budget,
    hasExplicitPrice,
  }
}

function filterVehicles(vehicles, filters) {
  const term = filters.brand.trim().toLocaleLowerCase('es-MX')
  const legacyBudget =
    filters.budget && !filters.hasExplicitPrice
      ? getLegacyBudgetFilter(filters.budget)
      : null

  return vehicles.filter((vehicle) => {
    if (
      term &&
      !vehicle.brand.toLocaleLowerCase('es-MX').includes(term)
    ) {
      return false
    }

    if (filters.bodyStyle && vehicle.bodyStyle !== filters.bodyStyle) {
      return false
    }

    if (legacyBudget && !legacyBudget.matches(vehicle.price)) {
      return false
    }

    if (!legacyBudget) {
      if (filters.minPrice && vehicle.price < Number(filters.minPrice)) {
        return false
      }

      if (filters.maxPrice && vehicle.price > Number(filters.maxPrice)) {
        return false
      }
    }

    if (filters.minYear && vehicle.year < Number(filters.minYear)) {
      return false
    }

    if (filters.maxYear && vehicle.year > Number(filters.maxYear)) {
      return false
    }

    if (
      filters.transmission &&
      vehicle.transmission !== filters.transmission
    ) {
      return false
    }

    if (filters.fuel && vehicle.fuel !== filters.fuel) {
      return false
    }

    return true
  })
}

function buildCatalogSearchParams(filters) {
  const params = new URLSearchParams()
  const entries = [
    ['marca', filters.brand],
    ['carroceria', filters.bodyStyle],
    ['precioMin', filters.minPrice],
    ['precioMax', filters.maxPrice],
    ['anioMin', filters.minYear],
    ['anioMax', filters.maxYear],
    ['transmision', filters.transmission],
    ['combustible', filters.fuel],
  ]

  entries.forEach(([key, value]) => {
    if (value) params.set(key, value)
  })

  return params
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function getActiveFilters(filters) {
  const activeFilters = []

  if (filters.brand) {
    activeFilters.push({
      key: 'marca',
      label: `Marca: ${filters.brand}`,
      params: ['marca'],
    })
  }

  if (filters.bodyStyle) {
    activeFilters.push({
      key: 'carroceria',
      label: `Carrocería: ${filters.bodyStyle}`,
      params: ['carroceria'],
    })
  }

  const legacyBudget =
    filters.budget && !filters.hasExplicitPrice
      ? getLegacyBudgetFilter(filters.budget)
      : null

  if (legacyBudget) {
    activeFilters.push({
      key: 'precio',
      label: `Presupuesto: ${legacyBudget.label}`,
      params: ['presupuesto', 'precioMin', 'precioMax'],
    })
  } else if (filters.minPrice || filters.maxPrice) {
    const range = [
      filters.minPrice ? formatPrice(Number(filters.minPrice)) : 'Sin mínimo',
      filters.maxPrice ? formatPrice(Number(filters.maxPrice)) : 'Sin máximo',
    ]
    activeFilters.push({
      key: 'precio',
      label: `Precio: ${range.join(' – ')}`,
      params: ['presupuesto', 'precioMin', 'precioMax'],
    })
  }

  if (filters.minYear || filters.maxYear) {
    const range = [
      filters.minYear || 'Cualquier año',
      filters.maxYear || 'Cualquier año',
    ]
    activeFilters.push({
      key: 'anio',
      label: `Año: ${range.join(' – ')}`,
      params: ['anioMin', 'anioMax'],
    })
  }

  if (filters.transmission) {
    activeFilters.push({
      key: 'transmision',
      label: `Transmisión: ${filters.transmission}`,
      params: ['transmision'],
    })
  }

  if (filters.fuel) {
    activeFilters.push({
      key: 'combustible',
      label: `Combustible: ${filters.fuel}`,
      params: ['combustible'],
    })
  }

  return activeFilters
}

export {
  buildCatalogSearchParams,
  filterVehicles,
  getActiveFilters,
  readCatalogFilters,
}
