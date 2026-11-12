# Venta de autos

Esqueleto académico de frontend para una aplicación de venta de autos. El equipo
de frontend trabaja en este repositorio y el backend tendrá un repositorio
independiente.

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

Cada vista muestra su título y que está pendiente de implementación. Los enlaces
de navegación permiten recorrerlas y existe una página para rutas inexistentes.

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

Copia `.env.example` a `.env.local` y completa `VITE_API_BASE_URL` cuando el
equipo acuerde la URL base. No se inventa una URL en este esqueleto.

Las variables con prefijo `VITE_` se exponen en el código enviado al navegador:
son públicas y nunca deben contener contraseñas, tokens ni otros secretos.
Los archivos locales de entorno están excluidos de Git; `.env.example` sí se
conserva en el repositorio.

## Estado actual y seguridad

Este proyecto es solo un esqueleto: no tiene funcionalidades, conexión al
backend ni autenticación. Las rutas administrativas tampoco están protegidas.
Al implementar autorización, el backend deberá validar permisos en cada
operación; ocultar o restringir una vista en el frontend no es una medida de
seguridad suficiente.

Las preguntas de integración están en [docs/api-contract.md](docs/api-contract.md).
El frontend no se conectará directamente con la base de datos.

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

No se han creado ramas de trabajo para las vistas.
