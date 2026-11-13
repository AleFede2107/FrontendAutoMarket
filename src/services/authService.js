const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '')
const LOGIN_PATH = '/api/v1/administradores/IniciarSesion'

export async function loginAdmin({ correo, password }) {
  if (!API_BASE_URL) {
    throw new Error('Configura VITE_API_BASE_URL para conectar con AutoMarket API.')
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}${LOGIN_PATH}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo, password }),
    })
  } catch {
    throw new Error(
      'No se pudo conectar con AutoMarket API. Verifica la conexión y la configuración CORS.',
    )
  }

  let payload

  try {
    payload = await response.json()
  } catch {
    throw new Error('AutoMarket API devolvió una respuesta no válida.')
  }

  if (response.status === 401) {
    throw new Error(
      payload?.detail?.message ?? 'Correo o contraseña incorrectos.',
    )
  }

  if (response.status === 422) {
    throw new Error('Revisa el formato del correo y vuelve a intentarlo.')
  }

  if (!response.ok) {
    throw new Error(
      `No fue posible iniciar sesión (HTTP ${response.status}). Inténtalo nuevamente.`,
    )
  }

  if (
    payload?.code !== 1 ||
    !payload.item ||
    typeof payload.item.id !== 'number' ||
    typeof payload.item.activo !== 'boolean'
  ) {
    throw new Error(
      payload?.message || 'AutoMarket API devolvió datos de administrador no válidos.',
    )
  }

  return payload.item
}
