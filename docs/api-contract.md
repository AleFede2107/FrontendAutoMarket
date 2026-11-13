# Contrato entre frontend y backend

Este contrato está pendiente de acordar entre ambos equipos. Los puntos siguientes
son preguntas abiertas, no decisiones ni propuestas de endpoints confirmadas:

- URL base y endpoints.
- Modelo de auto y sus campos.
- Si cada auto es una unidad única o existe stock.
- Filtros y paginación.
- Estructura de las respuestas y errores.
- Datos necesarios para crear una orden.
- Moneda y representación de precios.
- Autenticación y sesión del administrador.
- Configuración de CORS.

## Autenticación administrativa

La documentación OpenAPI desplegada en
`https://backendconcesionario.onrender.com/openapi.json` define:

- `POST /api/v1/administradores/IniciarSesion`
- Body JSON requerido:
  - `correo`: email válido.
  - `password`: cadena de 1 a 128 caracteres.
- Respuesta `200`: `ResponseItem[AdministradorResponse]` con `code`, `message`
  e `item`; el item incluye `id`, `nombre`, `correo`, `activo`, `creado_en` y
  `actualizado_en`.
- OpenAPI documenta también `422` para errores de validación.
- Una solicitud de prueba con credenciales inválidas al endpoint desplegado
  respondió `401` con `detail.code: 0` y el mensaje genérico
  `Correo o contraseña incorrectos.`.

El frontend consume este endpoint a través de `src/services/authService.js`,
usando `VITE_API_BASE_URL`. Al recibir HTTP 200 con `code: 1` y un item válido,
navega a `/admin`. Los errores 401, 422, conexión y respuesta inesperada se
muestran en el formulario. La contraseña sólo vive en el estado del formulario
y en el body de la petición; React no la persiste ni valida las credenciales.

OpenAPI no declara esquemas de seguridad, token, endpoint de sesión ni header
`Set-Cookie`; la respuesta exitosa documentada sólo contiene el administrador.
La prueba de credenciales incorrectas tampoco recibió una cookie. No se guarda
ni se inventa un JWT o una sesión en el frontend. Una prueba exitosa no se
realizó con credenciales reales, así que backend debe confirmar si establece
alguna cookie al autenticar correctamente.

La integración desde navegador está bloqueada actualmente por CORS: un
preflight `OPTIONS` desde `http://127.0.0.1:5173` respondió `405` sin
`Access-Control-Allow-Origin`, y el navegador rechazó el POST JSON. Backend
debe habilitar CORS para los orígenes reales de desarrollo y producción,
incluyendo `POST`, `OPTIONS` y el header `Content-Type`. El frontend no puede
sortear esta política ni usar `no-cors`, porque necesita leer el resultado de
autenticación.

La ruta React `/admin` existe, pero no hay evidencia de protección de ruta o
sesión persistente en este contrato. El backend debe documentar e implementar
un mecanismo de sesión/autorización para proteger las páginas administrativas
y sus APIs; el redirect del frontend no es una medida de seguridad.

## Reglas de integración

- Las peticiones se centralizarán en `src/services`.
- Los datos de prueba irán en `src/mocks`.
- El frontend no se conectará directamente con la base de datos.
- El backend validará precios, disponibilidad, totales y permisos.
- Los cambios del contrato se coordinarán entre ambos equipos.
- Las páginas administrativas actuales no tienen protección. La autenticación y
  autorización deberán implementarse y validarse también en el backend.
