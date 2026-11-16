---
name: automarket-frontend
description: Implementar y corregir vistas React e integraciones con FastAPI en el frontend AutoMarket, conservando el diseño, la sesión compartida y el flujo catálogo, carrito y solicitudes.
---

# Frontend AutoMarket

## Cuándo aplicar

Utiliza esta skill para cambios en las vistas, componentes, servicios HTTP y estado compartido del frontend AutoMarket. No modifica por sí misma el backend ni autoriza publicaciones o escrituras de prueba en servidores compartidos.

## Contexto y exploración

El proyecto utiliza React, JavaScript, Vite, React Router y CSS. Comprueba las versiones y scripts en package.json; conserva las herramientas existentes.

Antes de editar, lee las instrucciones locales, revisa Git e identifica los archivos afectados. Reutiliza componentes, servicios y convenciones. Respeta cambios pendientes y limita el trabajo a la tarea solicitada.

Rutas de referencia: `/`, `/autos`, `/carrito`, `/login`, `/admin/login`, `/admin` y `/admin/ordenes`. Verifica el router actual antes de cambiarlas.

Puntos de entrada habituales:
- `src/services/apiClient.js`: peticiones y errores compartidos.
- `src/services/authService.js`: autenticación y sesión.
- `src/services/vehicleService.js`: vehículos públicos y administrativos.
- `src/services/purchaseRequestService.js`: solicitudes.
- `src/pages/admin/`: panel y solicitudes.
- `src/pages/Catalog/` y `src/pages/Cart/`: selección y envío público.

Estas ubicaciones son referencias: adapta la solución si el proyecto evolucionó.

## Contrato e integración

Consulta docs/api-contract.md, los servicios actuales y, cuando esté disponible, el OpenAPI del servidor configurado. Contrasta el código del backend si hay diferencias; no inventes rutas, campos, filtros ni formatos multipart.

VITE_API_BASE_URL representa el origen HTTP del backend. Comprueba cómo se añade `/api/v1` para evitar duplicarlo. Nunca configures una conexión PostgreSQL ni secretos en variables VITE_.

Centraliza peticiones en el cliente existente. Conserva estados HTTP y mensajes de negocio, incluyendo respuestas con `code`, `message`, `item` o `items` cuando ese sea el contrato confirmado. Combina headers sin perder Authorization. Para FormData, deja que el navegador establezca Content-Type.

Las operaciones protegidas utilizan el token de la sesión compartida mediante `Authorization: Bearer ...`. Las operaciones públicas no deben exigir login administrativo. Respeta el manejo existente de 401; no reintentes indefinidamente ni imprimas tokens. Verifica las unidades de expiración del contrato.

## Reglas del producto

### Catálogo y carrito

- Conserva una única selección compartida de IDs reales y únicos; no relaciones mocks con registros por posición o nombre.
- Mantén la selección al navegar y recargar mediante el mecanismo existente. No borres selecciones por un error de red.
- No inventes cantidades si cada ID representa un vehículo y la API solo admite IDs únicos.
- Antes del envío, verifica los datos actuales disponibles; una selección no equivale a reserva.
- Envía únicamente los campos admitidos para crear la solicitud. Los precios, totales y estado inicial los determina el backend.
- Limpia la selección enviada solo tras confirmar éxito. Si la respuesta se pierde, informa que el resultado es incierto; no reintentes automáticamente el POST.
- No persistas datos personales del formulario por anticipado.

### Administración

- Diferencia estado del vehículo y estado de la solicitud. No sincronices ambos con escrituras adicionales sin una regla confirmada.
- Obtén opciones de catálogos cuando existan. Para filtros, comprueba si el servidor admite parámetros; si filtras localmente, conserva el listado original y filtra antes de paginar.
- Respeta las transiciones del backend al cambiar estados; un catálogo de estados no implica que todos sean destinos permitidos.
- Tras una mutación exitosa, actualiza las consultas afectadas sin perder filtros. Distingue fallo de guardado de fallo posterior de recarga.
- Presenta totales estimados como estimaciones, no como ingresos. No deduzcas ventas mensuales de actualizado_en ni inventes moneda.

## Carga, errores e imágenes

Mantén separados los estados de inventario y estadísticas para que una consulta no bloquee a la otra. Distingue carga, recarga, error, lista vacía y resultados filtrados vacíos.

Conserva StrictMode. Cancela o ignora consultas obsoletas y garantiza que la siguiente ejecución pueda terminar. No uses un bloqueo de petición que permanezca activo tras cancelarla. Evita envíos duplicados y respuestas antiguas que sobrescriban datos nuevos.

Usa la URL fotoauto real mediante el adaptador correspondiente. Si falta o falla, muestra una alternativa accesible; reinicia el error cuando cambie la URL. No inventes fotografías ni conviertas rutas locales en URLs públicas.

Investiga fallos de red, autenticación y CORS por separado. No uses no-cors ni desactives seguridad para ocultar errores.

## Interfaz y comprobación

Conserva el diseño y acota estilos para no alterar vistas ajenas. Incluye etiquetas, estados de envío, mensajes comprensibles y foco/teclado en diálogos.

Ejecuta los scripts reales de lint y build. Comprueba el flujo afectado, incluyendo éxito, error, vacío y cancelación cuando corresponda. Usa pruebas o respuestas interceptadas para los casos relevantes. Las escrituras de prueba deben limitarse a datos locales autorizados; no uses registros compartidos por defecto.

## Entrega y evidencia

Explica el comportamiento resultante, archivos afectados, contrato utilizado y verificaciones ejecutadas. Separa implementación, pruebas simuladas y pruebas contra servidor real. Documenta bloqueos sin simular éxito.

Para evidencia académica, registra la tarea en que se aplicó esta skill, decisiones que orientó, cambios revisados por una persona y resultados de pruebas. No atribuyas a la skill trabajos realizados antes de utilizarla ni inventes evidencias.
