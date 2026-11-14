import { useState } from 'react'

function VehicleForm({ onClose, onCreate }) {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const photoInput = form.elements.namedItem('fotoauto')

    if (!photoInput.files?.length) {
      formData.delete('fotoauto')
    }

    setError('')
    setIsSaving(true)

    try {
      await onCreate(formData)
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="admin-modal-backdrop">
      <section
        className="admin-modal admin-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-form-title"
      >
        <div className="admin-modal-heading">
          <div>
            <p className="admin-eyebrow">Inventario</p>
            <h2 id="vehicle-form-title">Agregar vehículo</h2>
          </div>
          <button
            className="admin-icon-button"
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <form className="admin-vehicle-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Marca</span>
              <input name="marca" required maxLength={80} />
            </label>
            <label className="admin-field">
              <span>Modelo</span>
              <input name="modelo" required maxLength={100} />
            </label>
            <label className="admin-field">
              <span>Año</span>
              <input name="anio" type="number" min={1900} step={1} required />
            </label>
            <label className="admin-field">
              <span>Precio (moneda por definir)</span>
              <input
                name="precio"
                type="number"
                min={0}
                step="any"
                required
              />
            </label>
            <label className="admin-field">
              <span>Kilometraje</span>
              <input
                name="kilometraje"
                type="number"
                min={0}
                step={1}
                defaultValue={0}
                required
              />
            </label>
            <label className="admin-field">
              <span>Condición</span>
              <select name="condicion" defaultValue="usado" required>
                <option value="nuevo">Nuevo</option>
                <option value="usado">Usado</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Transmisión</span>
              <select name="transmision" defaultValue="automatica" required>
                <option value="manual">Manual</option>
                <option value="automatica">Automática</option>
                <option value="otra">Otra</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Combustible</span>
              <select name="combustible" defaultValue="gasolina" required>
                <option value="gasolina">Gasolina</option>
                <option value="diesel">Diésel</option>
                <option value="hibrido">Híbrido</option>
                <option value="electrico">Eléctrico</option>
                <option value="otro">Otro</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Estado</span>
              <select name="estado" defaultValue="disponible" required>
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
              </select>
            </label>
            <label className="admin-field admin-form-full">
              <span>Descripción (opcional)</span>
              <textarea name="descripcion" rows={3} />
            </label>
            <label className="admin-field admin-form-full">
              <span>Fotografía (opcional)</span>
              <input name="fotoauto" type="file" accept="image/*" />
            </label>
          </div>

          {error && (
            <p className="admin-alert admin-alert-error" role="alert">
              {error}
            </p>
          )}

          <div className="admin-modal-actions">
            <button
              className="admin-button admin-button-secondary"
              type="button"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              className="admin-button admin-button-primary"
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Guardando…' : 'Guardar vehículo'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default VehicleForm
