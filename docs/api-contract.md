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

## Reglas de integración

- Las peticiones se centralizarán en `src/services`.
- Los datos de prueba irán en `src/mocks`.
- El frontend no se conectará directamente con la base de datos.
- El backend validará precios, disponibilidad, totales y permisos.
- Los cambios del contrato se coordinarán entre ambos equipos.
- Las páginas administrativas actuales no tienen protección. La autenticación y
  autorización deberán implementarse y validarse también en el backend.
