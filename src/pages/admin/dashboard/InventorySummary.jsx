const numberFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 2,
})

function readNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatNumber(value, fallback = '—') {
  const parsed = readNumber(value)

  if (parsed === null || parsed === undefined) {
    return fallback
  }

  return numberFormatter.format(parsed)
}

function InventorySummary({ summary, vehicles, error }) {
  const vehicleCounts = vehicles.reduce(
    (result, vehicle) => {
      result.total += 1

      if (vehicle.estado === 'disponible') {
        result.disponible += 1
      }

      if (vehicle.estado === 'reservado') {
        result.reservado += 1
      }

      if (vehicle.estado === 'vendido') {
        result.vendido += 1
      }

      return result
    },
    { total: 0, disponible: 0, reservado: 0, vendido: 0 },
  )

  const summaryTotals = summary && typeof summary === 'object' ? summary : {}

  const cardValues = {
    total: readNumber(summaryTotals.vehiculos_total, vehicleCounts.total),
    disponible: readNumber(
      summaryTotals.vehiculos_disponibles,
      vehicleCounts.disponible,
    ),
    reservado: readNumber(
      summaryTotals.vehiculos_reservados,
      vehicleCounts.reservado,
    ),
    vendido: readNumber(summaryTotals.vehiculos_vendidos, vehicleCounts.vendido),
    solicitudesTotal: readNumber(summaryTotals.solicitudes_total),
    pendientes: readNumber(summaryTotals.solicitudes_pendientes),
    contactadas: readNumber(summaryTotals.solicitudes_contactadas),
    confirmadas: readNumber(summaryTotals.solicitudes_confirmadas),
    estimadoTotal: readNumber(summaryTotals.solicitudes_total_estimado),
    estimadoConfirmadas: readNumber(
      summaryTotals.solicitudes_confirmadas_completadas_estimado,
    ),
  }

  const monthSeries = Array.isArray(summaryTotals.solicitudes_por_mes)
    ? summaryTotals.solicitudes_por_mes
        .map((entry) => ({
          anio: readNumber(entry?.anio),
          mes: readNumber(entry?.mes),
          total: readNumber(entry?.total),
        }))
        .filter((entry) => Number.isFinite(entry.anio) && Number.isFinite(entry.mes))
        .map((entry) => ({
          ...entry,
          total: readNumber(entry.total, 0),
          label: new Date(entry.anio, entry.mes - 1, 1).toLocaleString('es-ES', {
            month: 'short',
          }),
        }))
        .slice(-6)
    : []

  const chartMax = Math.max(
    ...monthSeries.map((entry) => Number(entry.total) || 0),
    1,
  )

  return (
    <>
      {error && !summary && (
        <div className="admin-alert admin-alert-info" role="status">
          El resumen del backend no está disponible. El inventario sigue cargado con la última respuesta válida.
        </div>
      )}

      <section className="admin-summary" aria-label="Resumen del inventario y solicitudes">
        <article className="admin-card admin-summary-card" key="vehicles-total">
          <span className="admin-summary-label">Total de vehículos</span>
          <strong className="admin-summary-value">{formatNumber(cardValues.total)}</strong>
          <span className="admin-summary-note">Registros del inventario</span>
        </article>
        <article className="admin-card admin-summary-card" key="vehicles-disponibles">
          <span className="admin-summary-label">Disponibles</span>
          <strong className="admin-summary-value">{formatNumber(cardValues.disponible)}</strong>
          <span className="admin-summary-note">Vehículos activos</span>
        </article>
        <article className="admin-card admin-summary-card" key="vehicles-reservados">
          <span className="admin-summary-label">Reservados</span>
          <strong className="admin-summary-value">{formatNumber(cardValues.reservado)}</strong>
          <span className="admin-summary-note">Sin venta confirmada</span>
        </article>
        <article className="admin-card admin-summary-card" key="vehicles-vendidos">
          <span className="admin-summary-label">Vendidos</span>
          <strong className="admin-summary-value">{formatNumber(cardValues.vendido)}</strong>
          <span className="admin-summary-note">Estado vendido</span>
        </article>
        <article className="admin-card admin-summary-card" key="solicitudes-total">
          <span className="admin-summary-label">Solicitudes</span>
          <strong className="admin-summary-value">{formatNumber(cardValues.solicitudesTotal)}</strong>
          <span className="admin-summary-note">Total de solicitudes</span>
        </article>
        <article className="admin-card admin-summary-card" key="solicitudes-pendientes">
          <span className="admin-summary-label">Pendientes</span>
          <strong className="admin-summary-value">{formatNumber(cardValues.pendientes)}</strong>
          <span className="admin-summary-note">Sin gestionar</span>
        </article>
        <article className="admin-card admin-summary-card" key="solicitudes-confirmadas">
          <span className="admin-summary-label">Confirmadas</span>
          <strong className="admin-summary-value">{formatNumber(cardValues.confirmadas)}</strong>
          <span className="admin-summary-note">En proceso de cierre</span>
        </article>
        <article className="admin-card admin-summary-card" key="estimado-total">
          <span className="admin-summary-label">Total estimado</span>
          <strong className="admin-summary-value">{formatNumber(cardValues.estimadoTotal, '—')}</strong>
          <span className="admin-summary-note">Importes estimados</span>
        </article>
      </section>

      {monthSeries.length > 0 && (
        <section className="admin-card admin-summary-chart" aria-label="Solicitudes mensuales">
          <div className="admin-section-heading">
            <div>
              <h2>Solicitudes por mes</h2>
              <p>Resumen mensual del número de solicitudes recibidas.</p>
            </div>
            <span className="admin-section-count">
              {formatNumber(cardValues.estimadoConfirmadas, '—')} estimado
            </span>
          </div>

          <svg className="admin-month-chart" viewBox="0 0 640 180" role="img" aria-label="Gráfico de solicitudes por mes">
            {monthSeries.map((entry, index) => {
              const barWidth = 52
              const gap = 24
              const x = 38 + index * (barWidth + gap)
              const barHeight = (Number(entry.total) / chartMax) * 110
              const y = 150 - barHeight
              return (
                <g key={`${entry.anio}-${entry.mes}`}>
                  <rect x={x} y={y} width={barWidth} height={barHeight} rx="8" fill="#155eef" opacity="0.9" />
                  <text x={x + barWidth / 2} y="170" textAnchor="middle" fill="#657187" fontSize="11">
                    {entry.label}
                  </text>
                  <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fill="#15243b" fontSize="11">
                    {entry.total}
                  </text>
                </g>
              )
            })}
          </svg>
        </section>
      )}
    </>
  )
}

export default InventorySummary
