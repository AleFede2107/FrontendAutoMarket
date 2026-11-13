# Contrato entre frontend y backend

## Fuente revisada

Se revisó el código del backend
[AutoMarket](https://github.com/WernerToledoSv/backendConcesionario) en el
commit [`2b3ea2586b489b28b5d9bb7dcd971d4824c2d1de`](https://github.com/WernerToledoSv/backendConcesionario/commit/2b3ea2586b489b28b5d9bb7dcd971d4824c2d1de).
La aplicación genera su OpenAPI en `/openapi.json`; las rutas y esquemas de esta
sección corresponden al código de ese commit. No había una URL desplegada del
backend ni un proceso local disponible para consultar el documento generado o
ejecutar peticiones reales.

## Convenciones compartidas

- Las peticiones HTTP se centralizan en `src/services`.
- El frontend usa `VITE_API_BASE_URL` como origen del backend y agrega
  `/api/v1` a cada ruta. La variable no debe incluir ese prefijo.
- Los datos de prueba, si se agregan en el futuro, irán en `src/mocks`. La
  aplicación actual no incluye datos simulados.
- El frontend no se conecta directamente con la base de datos.
- El backend debe validar precios, disponibilidad, totales y permisos.
- Los cambios del contrato se coordinan entre ambos equipos.

## Vehículos

El router vigente expone estas operaciones bajo `/api/v1/vehiculos`:

| Método | Ruta | Respuesta de éxito |
| --- | --- | --- |
| `GET` | `/ListarVehiculos` | `code`, `message`, `items` |
| `GET` | `/ObtenerVehiculo/{vehiculo_id}` | `code`, `message`, `item` |
| `POST` | `/CrearVehiculo` | `code`, `message`, `item` |
| `PUT` | `/ActualizarVehiculo/{vehiculo_id}` | `code`, `message` |
| `DELETE` | `/EliminarVehiculo/{vehiculo_id}` | `code`, `message` |

El esquema de respuesta contiene `id`, `condicion`, `marca`, `modelo`, `anio`,
`precio`, `kilometraje`, `transmision`, `combustible`, `descripcion`, `fotoauto`,
`estado`, `creado_en` y `actualizado_en`.

La creación es `multipart/form-data`: `condicion` (`nuevo` o `usado`, por
defecto `usado`), `marca` (obligatoria, máximo 80 caracteres), `modelo`
(obligatorio, máximo 100), `anio` (entero desde 1900), `precio` (decimal no
negativo), `kilometraje` (entero no negativo, por defecto 0), `transmision`
(`manual`, `automatica` u `otra`), `combustible` (`gasolina`, `diesel`,
`hibrido`, `electrico` u `otro`), `estado` (`disponible`, `reservado` o
`vendido`), `descripcion` opcional y `fotoauto` opcional. El cliente deja que el
navegador genere el encabezado multipart. El backend puede rechazar imágenes que
superen `MAX_IMAGE_SIZE_MB` (30 MB por defecto en el código revisado); el
frontend no impone un límite propio.

La búsqueda por marca, modelo e ID, los filtros por estado y condición, y la
paginación son locales: se aplican en el navegador al listado completo que
devuelve el backend. “Vendidos” en el resumen es el conteo de registros cuyo
estado es `vendido`, no ventas de un periodo.

### Actualización no disponible en la interfaz

El handler actual declara simultáneamente `body: VehiculoUpdateRequest` y
`fotoauto: UploadFile = File(None)`. Esto genera una solicitud multipart que
incluye el modelo anidado `body`, mientras que el modelo de actualización es un
cuerpo JSON ordinario; el esquema `VehiculoUpdateRequest` tampoco define
`fotoauto`. No hay un formato de petición que la interfaz pueda enviar y
validar de forma fiable para todos los campos. Por eso el botón de edición está
deshabilitado y no se simula el guardado. Backend debe definir una solicitud
compatible y actualizar el OpenAPI antes de habilitarla.

La eliminación borra el registro (no lo desactiva). La interfaz pide
confirmación con los datos del vehículo y vuelve a consultar el listado después
de una respuesta exitosa.

## Solicitudes de compra

El router actual solo expone lectura:

| Método | Ruta | Respuesta de éxito |
| --- | --- | --- |
| `GET` | `/api/v1/solicitudes/ListarSolicitudes` | `code`, `message`, `items` |

Cada registro incluye `id`, `nombre_cliente`, `correo_cliente`,
`telefono_cliente`, `estado`, `total_estimado`, `mensaje_cliente`,
`notas_administrador`, `creado_en`, `actualizado_en` y `detalles`. Cada detalle
incluye `id`, `vehiculo_id`, `precio_unitario`, `marca`, `modelo`, `anio` y
`fotoauto`. La pantalla es de solo lectura; el backend revisado no define
operaciones de creación, aprobación o rechazo.

El backend también expone `GET /api/v1/estadisticas/Resumen`, con estadísticas
de vehículos y solicitudes. Para el resumen de inventario, el frontend cuenta
los registros del listado de vehículos y no presenta montos, ventas mensuales o
comparaciones calculados a partir de esos datos.

## Pendientes de coordinación

- Acordar y configurar la URL de backend por entorno.
- El esquema no especifica moneda ni representación de precios. La interfaz
  muestra importes numéricos sin asumir una moneda.
- Definir el formato de actualización de vehículo compatible con el OpenAPI.
- Definir operaciones para gestionar solicitudes de compra si se requieren;
  hasta entonces solo se listan.
- Definir autenticación y sesión del administrador. Las páginas administrativas
  del frontend no están protegidas y las rutas revisadas no muestran una
  dependencia de autorización; los permisos deben validarse en el backend.
- `app/main.py` del commit revisado no configura middleware CORS. Para desarrollo
  y despliegue, backend debe permitir los orígenes reales del frontend y los
  métodos/encabezados necesarios. Un error CORS no se trata como una lista vacía.
- La estructura uniforme de respuestas usa `code` y `message`; HTTP y `code`
  deben comprobarse en cada petición.
