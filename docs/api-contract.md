# Contrato entre frontend y backend

## Fuente revisada

Se comprobó el documento OpenAPI desplegado en
`https://backendconcesionario.onrender.com/openapi.json` y se comparó con el
estado local del frontend. El backend desplegado ya incluye varias operaciones de
administración que no estaban documentadas en el código GitHub que se revisó en
el repositorio local.

## Convenciones compartidas

- El frontend usa `VITE_API_BASE_URL` como origen del backend y agrega
  `/api/v1` a cada ruta. La variable no debe incluir ese prefijo.
- La URL recomendada para el despliegue es
  `https://backendconcesionario.onrender.com`.
- Las llamadas protegidas usan `Authorization: Bearer <token>`.
- Las respuestas del backend mantienen la convención `code`, `message` y
  `item`/`items` según el caso.
- El frontend no conecta directamente con la base de datos ni guarda la
  contraseña del administrador.

## Autenticación

El backend expone `POST /api/v1/administradores/IniciarSesion` con JSON:

```json
{
  "correo": "admin@automarket.com",
  "password": "secret"
}
```

La respuesta devuelve `code`, `message`, `item`, `access_token`, `token_type` y
`expires_in` en minutos. El frontend guarda el administrador y el token en
`sessionStorage`, sin persistencia extra ni renovación automática.

## Vehículos

El backend desplegado expone estas rutas bajo `/api/v1/vehiculos`:

- `GET /ListarVehiculos`
- `GET /ObtenerVehiculo/{vehiculo_id}`
- `POST /CrearVehiculo`
- `PUT /ActualizarVehiculo/{vehiculo_id}`
- `DELETE /EliminarVehiculo/{vehiculo_id}`

El esquema `VehiculoResponse` incluye:
`id`, `condicion`, `marca`, `modelo`, `anio`, `precio`, `kilometraje`,
`transmision`, `combustible`, `descripcion`, `fotoauto`, `estado`, `creado_en` y
`actualizado_en`.

La operación de actualización sigue estando documentada como multipart/form-data
con un esquema `Body_actualizar_vehiculo_api_v1_vehiculos_ActualizarVehiculo__vehiculo_id__put`
que combina `body` y `fotoauto`. El formato no es compatible con un JSON plano
ni con el flujo de creación y, por eso, la edición de vehículos queda
bloqueada en la interfaz hasta que el backend defina una variante consistente.

## Estadísticas

El backend ofrece `GET /api/v1/estadisticas/Resumen`.

Los campos documentados incluyen:

- `vehiculos_total`
- `vehiculos_disponibles`
- `vehiculos_reservados`
- `vehiculos_vendidos`
- `solicitudes_total`
- `solicitudes_pendientes`
- `solicitudes_contactadas`
- `solicitudes_confirmadas`
- `solicitudes_rechazadas`
- `solicitudes_canceladas`
- `solicitudes_completadas`
- `solicitudes_total_estimado`
- `solicitudes_confirmadas_completadas_estimado`
- `solicitudes_por_mes` con `{ anio, mes, total }`

Los importes se muestran como estimados, sin asumir moneda, y se tratan como
valores numéricos/decimales que pueden llegar como cadenas.

## Solicitudes de compra

El backend desplegado expone:

- `GET /api/v1/solicitudes/ListarSolicitudes`
- `PATCH /api/v1/solicitudes/ActualizarEstado/{solicitud_id}`
- `PATCH /api/v1/solicitudes/ActualizarNotas/{solicitud_id}`

La actualización de estado usa JSON:

```json
{ "estado": "contactado" }
```

La actualización de notas usa JSON:

```json
{ "notas_administrador": "Texto" }
```

El campo `notas_administrador` acepta null para limpiar el texto y tiene un
máximo de 5000 caracteres.

## Diferencias con el backend de GitHub

El código local del frontend estaba preparado para un backend más antiguo, que no
definía autenticación ni operaciones de administración. El servidor desplegado ya
incluye:

- login de administrador
- token JWT con `access_token`
- resumen estadístico del panel
- listado y gestión de solicitudes de compra
- rutas protegidas con `Authorization`

Además, el backend desplegado documenta un formato multipart para la edición del
vehículo que sigue sin ser compatible con el flujo de actualización del
frontend, por lo que esa acción sigue deshabilitada por diseño.

## Limitaciones pendientes

- El backend debe permitir el origen real del frontend en CORS y los headers
  necesarios (`Authorization`, `Content-Type`, `Accept`) si el navegador bloquea
  la petición.
- La edición de vehículos requiere que el backend defina y publique un formato
  de actualización compatible; no se debe simular éxito ni inventar rutas.
- La renovación automática del token queda fuera de este alcance.

## Verificación del cliente

El cliente centraliza el acceso HTTP en `src/services` y valida:

- el origen del backend en `.env.example`
- la sesión del administrador en `sessionStorage`
- la presencia del token antes de peticiones protegidas
- `code`, `status` y mensajes de negocio
- manejo de 401/404/409/422 con mensajes comprensibles para el usuario
