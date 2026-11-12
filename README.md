# AutoMarket

Frontend académico para una aplicación de venta de autos. El backend se
desarrolla en un repositorio independiente.

## Tecnologías

- React con JavaScript (sin TypeScript).
- Vite 8 para desarrollo y compilación.
- React Router para la navegación.
- CSS global básico.

## Requisitos

La versión instalada de Vite requiere Node.js `^20.19.0` o `>=22.12.0`.
Comprueba tu versión con `node --version`. También necesitas npm, incluido con
Node.js.

## Instalación y ejecución

Desde un clon del repositorio, instala las dependencias registradas en el lockfile:

```sh
npm ci
```

Inicia el servidor de desarrollo:

```sh
npm run dev
```

Comprobaciones disponibles:

```sh
npm run lint
npm run build
```

## Rutas

| Vista | Ruta |
| --- | --- |
| Inicio | `/` |
| Catálogo de autos | `/autos` |
| Carrito | `/carrito` |
| Login de administrador | `/admin/login` |
| Panel de administración | `/admin` |
| Listado de órdenes | `/admin/ordenes` |

Las vistas de inicio, catálogo, carrito y login siguen provisionales. El panel
administrativo ya consulta el inventario y permite agregar y eliminar registros;
la pantalla de solicitudes consulta el listado disponible en el backend. La
edición de vehículos permanece deshabilitada hasta que backend defina un formato
de actualización compatible.

## Estructura de carpetas

- `public/`: archivos estáticos públicos.
- `src/assets/`: recursos importados por el frontend.
- `src/components/shared/`: componentes compartidos.
- `src/layouts/`: estructuras de navegación pública y administrativa.
- `src/pages/`: una página por archivo y vista.
- `src/services/`: punto central futuro para las peticiones al backend.
- `src/mocks/`: datos de prueba futuros.
- `docs/api-contract.md`: preguntas pendientes para coordinar el contrato con
  backend.

## Variables de entorno

Copia `.env.example` a `.env.local` y establece `VITE_API_BASE_URL` con el
origen acordado del backend, por ejemplo `http://localhost:8000` para un entorno
local. El frontend agrega `/api/v1` a las rutas; no incluyas ese prefijo en la
variable. El valor de ejemplo está vacío porque la URL real debe acordarse con
backend. No se reemplazan archivos locales de entorno.

Las variables con prefijo `VITE_` se exponen en el código enviado al navegador:
son públicas y nunca deben contener contraseñas, tokens ni otros secretos.
Los archivos locales de entorno están excluidos de Git; `.env.example` sí se
conserva en el repositorio.

## Estado actual y seguridad

Las vistas públicas de inicio, catálogo y carrito, y el login, siguen siendo
provisionales. Las páginas administrativas tampoco están protegidas por el
frontend. El backend debe validar los permisos para cada operación; ocultar o
restringir una vista en el navegador no es una medida de seguridad suficiente.

Las operaciones verificadas, sus limitaciones y los acuerdos pendientes están
en [docs/api-contract.md](docs/api-contract.md). El frontend no se conecta
directamente con la base de datos. El contrato de importes no define una
moneda, por lo que la interfaz muestra cantidades sin símbolo ni conversión.

Al desplegar, el servidor web deberá redirigir las rutas del navegador a
`index.html` para que las rutas de React Router funcionen al abrirlas
directamente.

## Colaboración

1. Mantener `main` funcionando.
2. Desarrollar cada tarea en una rama `feat/nombre-de-tarea`.
3. Revisar cada cambio antes de incorporarlo mediante un Pull Request.
4. Coordinar cambios que afecten rutas, layouts, estilos globales o dependencias.
5. Conservar `package-lock.json` en el repositorio y actualizarlo al cambiar
   dependencias.

Las páginas administrativas y sus estilos están aislados en
`src/pages/admin/` y `src/pages/admin/admin.css`. Coordina con el equipo los
cambios en rutas, layouts, estilos globales y dependencias.
