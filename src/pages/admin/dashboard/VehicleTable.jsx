import { useState } from 'react'

const numberFormatter = new Intl.NumberFormat('es', {
  maximumFractionDigits: 2,
})

const stateLabels = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  vendido: 'Vendido',
}

const conditionLabels = {
  nuevo: 'Nuevo',
  usado: 'Usado',
}

const transmissionLabels = {
  manual: 'Manual',
  automatica: 'Automática',
  otra: 'Otra',
}

function formatNumber(value) {
  const number = Number(value)
  return value !== null && value !== undefined && Number.isFinite(number)
    ? numberFormatter.format(number)
    : '—'
}

function VehiclePhoto({ photo, name }) {
  const [hasError, setHasError] = useState(false)

  if (!photo || hasError) {
    return (
      <span className="admin-photo-placeholder" aria-label="Sin fotografía">
        Sin foto
      </span>
    )
  }

  return (
    <img
      className="admin-vehicle-photo"
      src={photo}
      alt={`Fotografía de ${name}`}
      onError={() => setHasError(true)}
    />
  )
}

function VehicleTable({
  vehicles,
  page,
  pageSize,
  onPageChange,
  onDelete,
  deletingId,
}) {
  const totalPages = Math.ceil(vehicles.length / pageSize)
  const visibleVehicles = vehicles.slice((page - 1) * pageSize, page * pageSize)
  const firstItem = vehicles.length === 0 ? 0 : (page - 1) * pageSize + 1
  const lastItem = Math.min(page * pageSize, vehicles.length)

  if (vehicles.length === 0) {
    return (
      <div className="admin-empty-state">
        <h3>No hay vehículos en el inventario</h3>
        <p>Cuando el backend devuelva registros, aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Vehículo</th>
              <th scope="col">Precio (moneda por definir)</th>
              <th scope="col">Kilometraje</th>
              <th scope="col">Transmisión</th>
              <th scope="col">Condición</th>
              <th scope="col">Estado</th>
              <th scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {visibleVehicles.map((vehicle) => {
              const vehicleName = `${vehicle.marca} ${vehicle.modelo}`

              return (
                <tr key={vehicle.id}>
                  <td>
                    <div className="admin-vehicle-cell">
                      <VehiclePhoto photo={vehicle.fotoauto} name={vehicleName} />
                      <div>
                        <strong>
                          {vehicleName} · {vehicle.anio}
                        </strong>
                        <span>ID {vehicle.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>{formatNumber(vehicle.precio)}</td>
                  <td>{formatNumber(vehicle.kilometraje)} km</td>
                  <td>
                    {transmissionLabels[vehicle.transmision] ??
                      vehicle.transmision}
                  </td>
                  <td>{conditionLabels[vehicle.condicion] ?? vehicle.condicion}</td>
                  <td>
                    <span
                      className={`admin-status admin-status-${vehicle.estado}`}
                    >
                      {stateLabels[vehicle.estado] ?? vehicle.estado}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        className="admin-button admin-button-small admin-button-secondary"
                        type="button"
                        disabled
                        title="El contrato actual no define una solicitud de actualización válida."
                      >
                        Editar (no disponible)
                      </button>
                      <button
                        className="admin-button admin-button-small admin-button-danger"
                        type="button"
                        onClick={() => onDelete(vehicle)}
                        disabled={deletingId !== null}
                      >
                        {deletingId === vehicle.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="admin-pagination">
        <span>
          Mostrando {firstItem}–{lastItem} de {vehicles.length} vehículos
        </span>
        <div className="admin-pagination-actions">
          <button
            className="admin-button admin-button-secondary"
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            className="admin-button admin-button-secondary"
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  )
}

export default VehicleTable
