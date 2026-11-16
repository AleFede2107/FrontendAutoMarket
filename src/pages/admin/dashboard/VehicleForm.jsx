import { useEffect, useRef, useState } from 'react'

function VehicleForm({ mode = 'create', vehicle, onClose, onSave }) {
  const isEditing = mode === 'edit'
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef(null)
  const isSavingRef = useRef(false)

  useEffect(() => {
    const dialog = dialogRef.current
    const previouslyFocusedElement = document.activeElement
    const focusableSelector =
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)'
    const focusableElements = () => [
      ...dialog.querySelectorAll(focusableSelector),
    ]

    dialog.querySelector('[data-autofocus]')?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (!isSavingRef.current) {
          onClose()
        }
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const elements = focusableElements()
      const firstElement = elements[0]
      const lastElement = elements.at(-1)

      if (!firstElement || !lastElement) {
        event.preventDefault()
        dialog.focus()
      } else if (
        event.shiftKey &&
        (document.activeElement === firstElement ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus()
      }
    }
  }, [onClose])

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSavingRef.current) {
      return
    }

    const form = event.currentTarget
    const formData = new FormData(form)
    const photoInput = form.elements.namedItem('fotoauto')

    if (!photoInput.files?.length) {
      formData.delete('fotoauto')
    }

    setError('')
    isSavingRef.current = true
    setIsSaving(true)

    try {
      await onSave(formData)
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }

  return (
    <div className="admin-modal-backdrop">
      <section
        ref={dialogRef}
        className="admin-modal admin-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="vehicle-form-title"
        tabIndex={-1}
      >
        <div className="admin-modal-heading">
          <div>
            <p className="admin-eyebrow">Inventario</p>
            <h2 id="vehicle-form-title">
              {isEditing ? 'Editar vehículo' : 'Agregar vehículo'}
            </h2>
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
              <input
                name="marca"
                required
                maxLength={80}
                defaultValue={vehicle?.marca ?? ''}
                data-autofocus
              />
            </label>
            <label className="admin-field">
              <span>Modelo</span>
              <input
                name="modelo"
                required
                maxLength={100}
                defaultValue={vehicle?.modelo ?? ''}
              />
            </label>
            <label className="admin-field">
              <span>Año</span>
              <input
                name="anio"
                type="number"
                min={1900}
                step={1}
                required
                defaultValue={vehicle?.anio ?? ''}
              />
            </label>
            <label className="admin-field">
              <span>Precio (moneda por definir)</span>
              <input
                name="precio"
                type="number"
                min={0}
                step="any"
                required
                defaultValue={vehicle?.precio ?? ''}
              />
            </label>
            <label className="admin-field">
              <span>Kilometraje</span>
              <input
                name="kilometraje"
                type="number"
                min={0}
                step={1}
                defaultValue={vehicle?.kilometraje ?? 0}
                required
              />
            </label>
            <label className="admin-field">
              <span>Condición</span>
              <select
                name="condicion"
                defaultValue={vehicle?.condicion ?? 'usado'}
                required
              >
                <option value="nuevo">Nuevo</option>
                <option value="usado">Usado</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Transmisión</span>
              <select
                name="transmision"
                defaultValue={vehicle?.transmision ?? 'automatica'}
                required
              >
                <option value="manual">Manual</option>
                <option value="automatica">Automática</option>
                <option value="otra">Otra</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Combustible</span>
              <select
                name="combustible"
                defaultValue={vehicle?.combustible ?? 'gasolina'}
                required
              >
                <option value="gasolina">Gasolina</option>
                <option value="diesel">Diésel</option>
                <option value="hibrido">Híbrido</option>
                <option value="electrico">Eléctrico</option>
                <option value="otro">Otro</option>
              </select>
            </label>
            <label className="admin-field">
              <span>Estado</span>
              <select
                name="estado"
                defaultValue={vehicle?.estado ?? 'disponible'}
                required
              >
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
              </select>
            </label>
            <label className="admin-field admin-form-full">
              <span>Descripción (opcional)</span>
              <textarea
                name="descripcion"
                rows={3}
                defaultValue={vehicle?.descripcion ?? ''}
              />
            </label>
            {isEditing && vehicle?.fotoauto && (
              <div className="admin-field admin-form-full">
                <span>Fotografía actual</span>
                <img
                  className="admin-edit-current-photo"
                  src={vehicle.fotoauto}
                  alt={`Fotografía actual de ${vehicle.marca} ${vehicle.modelo}`}
                />
              </div>
            )}
            <label className="admin-field admin-form-full">
              <span>
                {isEditing
                  ? 'Fotografía nueva (opcional)'
                  : 'Fotografía (opcional)'}
              </span>
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
              {isSaving
                ? 'Guardando…'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Guardar vehículo'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default VehicleForm
