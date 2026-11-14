const summaryItems = [
  { key: 'total', label: 'Total de vehículos' },
  { key: 'disponible', label: 'Disponibles' },
  { key: 'reservado', label: 'Reservados' },
  { key: 'vendido', label: 'Vendidos' },
]

function InventorySummary({ vehicles }) {
  const counts = vehicles.reduce(
    (result, vehicle) => {
      result.total += 1

      if (vehicle.estado === 'disponible') {
        result.disponible += 1
      } else if (vehicle.estado === 'reservado') {
        result.reservado += 1
      } else if (vehicle.estado === 'vendido') {
        result[vehicle.estado] += 1
      }

      return result
    },
    { total: 0, disponible: 0, reservado: 0, vendido: 0 },
  )

  return (
    <section className="admin-summary" aria-label="Resumen del inventario">
      {summaryItems.map(({ key, label }) => (
        <article className="admin-card admin-summary-card" key={key}>
          <span className="admin-summary-label">{label}</span>
          <strong className="admin-summary-value">{counts[key]}</strong>
          {key === 'vendido' && (
            <span className="admin-summary-note">
              Registros con estado vendido
            </span>
          )}
        </article>
      ))}
    </section>
  )
}

export default InventorySummary
