# AutoMarket

Frontend académico para una aplicación de venta de autos. El backend se
desarrolla en un repositorio independiente.
## Integrantes

-Federico José Alegría Castro
-Renzo Alexander Genovez Gomez
-Werner Alejandro Toledo Diaz
-German Enrique Valeriano
-Gustavo Adolfo Pineda Montes

## Tecnologías

- React con JavaScript (sin TypeScript).
- Vite 8 para desarrollo y compilación.
- React Router para la navegación.
- CSS responsive propio.

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

La página de inicio conserva secciones de muestra. El catálogo consulta los
vehículos públicos del backend y el carrito permite enviar solicitudes de compra
reales; el panel administrativo consulta el inventario y permite agregar y
eliminar registros. La pantalla de solicitudes obtiene los estados del catálogo
del backend y filtra localmente el listado recibido. La edición de vehículos
permanece deshabilitada hasta que backend defina un formato de actualización
compatible.

## Estructura de carpetas

- `public/`: archivos estáticos públicos.
- `src/assets/`: recursos importados por el frontend.
- `src/components/shared/`: componentes compartidos.
- `src/components/home/`: secciones reutilizables de Inicio.
- `src/components/vehicles/`: tarjetas reutilizables para vehículos.
- `src/context/`: selección compartida y persistente del carrito.
- `src/layouts/`: estructuras de navegación pública y administrativa.
- `src/pages/`: una página por archivo y vista.
- `src/services/`: acceso centralizado a vehículos.
- `src/mocks/`: vehículos de prueba utilizados mientras se acuerda el contrato.
- `docs/api-contract.md`: preguntas pendientes para coordinar el contrato con
  backend.

## Variables de entorno

Copia `.env.example` a `.env.local`. `VITE_API_BASE_URL` apunta al backend
desplegado de AutoMarket y se puede reemplazar por la URL del entorno que se
esté utilizando.

Las variables con prefijo `VITE_` se exponen en el código enviado al navegador:
son públicas y nunca deben contener contraseñas, tokens ni otros secretos.
Los archivos locales de entorno están excluidos de Git; `.env.example` sí se
conserva en el repositorio.

## Sesión y autenticación

El login de administrador conserva la sesión del usuario en `sessionStorage` para
mantenerla mientras la pestaña sigue abierta. No se almacena la contraseña y no
se activa la opción de "recordarme" persistente. El frontend valida los datos
recuperados antes de usarlos y los demás endpoints protegidos requieren un
`Authorization: Bearer <token>` enviado por el cliente.

## Estado actual y seguridad

El login administrativo consume `POST /api/v1/administradores/IniciarSesion`
mediante `src/services/authService.js`; el detalle está en
[docs/api-contract.md](docs/api-contract.md). El contrato publicado no define
un token ni una sesión persistente. Las rutas administrativas de React siguen
sin protección, por lo que navegar a `/admin` no constituye autorización.

El catálogo público obtiene los vehículos reales de
`GET /api/v1/vehiculos/ListarVehiculos`. La selección del carrito guarda solo
IDs de vehículos en `localStorage` con la clave versionada
`automarket-cart-v1`; al mostrarla, usa los datos actuales recibidos del
backend. El formulario envía `POST /api/v1/solicitudes/CrearSolicitud` sin
autenticación administrativa. El backend calcula el total y mantiene el estado
inicial de la solicitud. Una solicitud no es un pago ni una reserva confirmada.

La comprobación de precio y disponibilidad del frontend es informativa y no
garantiza una reserva ni reemplaza validaciones transaccionales del backend. La
moneda no se etiqueta porque el contrato consultado no la define. La página de
inicio todavía puede mostrar los vehículos de muestra de `src/mocks/vehicles.js`.

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
