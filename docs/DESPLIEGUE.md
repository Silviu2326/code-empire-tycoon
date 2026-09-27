# Code Empire Tycoon — Despliegue

El juego es una web estática: `npm run build` genera la carpeta `dist/` y basta con servirla. Hay tres formas preparadas; la recomendada es la primera.

## Opción recomendada: Cloudflare Pages

Es gratis, con HTTPS y CDN incluidos. Crea un despliegue de preview en cada PR sin configurar nada más, y lee las cabeceras de `public/_headers` (seguridad y caché).

1. En Cloudflare → **Workers & Pages → Create → Pages → Connect to Git**, elige `silviu2326/code-empire-tycoon`.
2. Configuración de build:
   - **Production branch:** `master`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Variables de entorno:** `NODE_VERSION = 22`
3. Guardar. Cada push a `master` publica en producción y cada PR recibe su propia URL de preview.
4. **Dominio:** en _Custom domains_, añade tu dominio. Cloudflare crea el certificado HTTPS automáticamente.
5. Cuando tengas dominio, cambia en `index.html` la etiqueta `og:image` por la URL absoluta: `https://tu-dominio/icon-512.png`.

**Netlify** sirve igual: build `npm run build`, publicar `dist`, y también lee `public/_headers`.

## Opción con servidor propio: Docker

```bash
docker build -t code-empire-tycoon .
docker run -p 8080:8080 code-empire-tycoon
```

La imagen compila el juego y lo sirve con `server.mjs`, que incluye:

- Compresión brotli/gzip.
- Caché larga para los JS y CSS con hash; revalidación para el HTML.
- 404 reales para archivos que no existen.
- Cabeceras de seguridad: CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Protección contra rutas fuera de `dist/`.

Delante hace falta un proxy con HTTPS (Caddy, Traefik, o el balanceador del proveedor).

> El `Dockerfile` no se ha podido probar en el entorno de desarrollo (no había Docker). `server.mjs` sí está cubierto por `test/server.test.js`.

## Opción mínima: cualquier hosting estático

Sube el contenido de `dist/` (GitHub Pages, S3 + CloudFront, un servidor nginx…). Hay que configurar a mano las cabeceras equivalentes a `public/_headers`.

## Estadísticas y errores (opcional)

El juego trae telemetría propia, anónima y sin cookies (`src/telemetry.js`), **apagada por defecto**. Para activarla, define estas variables en el build (en Cloudflare: _Settings → Environment variables_):

| Variable                  | Qué recibe                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `VITE_ANALYTICS_ENDPOINT` | `POST` JSON con eventos: `game_start`, `game_load`, `goal_completed`, `level_up`, `product_launched`, `bankruptcy`, `victory` |
| `VITE_ERROR_ENDPOINT`     | `POST` JSON con errores de JavaScript: mensaje, stack, ruta y versión                                                         |

- Cada envío incluye la versión del juego, la fecha y un identificador aleatorio de la visita, que no se guarda.
- El destino puede ser cualquier endpoint que acepte JSON: un Cloudflare Worker que escriba en Analytics Engine o D1, un webhook, una función serverless…
- Si prefieres Sentry, instala `@sentry/browser` y llama a `Sentry.captureException` dentro de `reportError`.
- Antes de activarla, revisa la política de privacidad (`public/privacidad.html`) y `docs/LEGAL.md`.

## Antes de cada lanzamiento

- [ ] `npm run check` y `npm run test:e2e` en verde (la CI también prueba Firefox y Safari).
- [ ] Subir la versión en `package.json` y anotar los cambios en `CHANGELOG.md`.
- [ ] Probar la preview del PR en un móvil real.
- [ ] Si cambia la estructura de la partida guardada: subir `SAVE_VERSION` y añadir la migración en `src/game/save.js`.
