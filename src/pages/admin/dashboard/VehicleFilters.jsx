function VehicleFilters({
  search,
  statusFilter,
  conditionFilter,
  onSearchChange,
  onStatusChange,
  onConditionChange,
  onClear,
}) {
  return (
    <section className="admin-filters" aria-label="Filtros de inventario">
      <label className="admin-field admin-search-field">
        <span>Buscar por marca, modelo o ID</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Ej. Toyota, Corolla o 12"
        />
      </label>
      <label className="admin-field">
        <span>Estado</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="">Todos</option>
          <option value="disponible">Disponible</option>
          <option value="reservado">Reservado</option>
          <option value="vendido">Vendido</option>
        </select>
      </label>
      <label className="admin-field">
        <span>Condición</span>
        <select
          value={conditionFilter}
          onChange={(event) => onConditionChange(event.target.value)}
        >
          <option value="">Todas</option>
          <option value="nuevo">Nuevo</option>
          <option value="usado">Usado</option>
        </select>
      </label>
      <button className="admin-button admin-button-secondary" onClick={onClear}>
        Limpiar filtros
      </button>
    </section>
  )
}

export default VehicleFilters
