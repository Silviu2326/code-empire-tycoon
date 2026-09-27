# Cambios

## 0.5.0

- **Legal:** nombres ficticios en lugar de marcas reales (IA, motor, campañas) e iconos genéricos en vez de los que imitaban logotipos. `LICENSE`, créditos, política de privacidad y `docs/LEGAL.md`.
- **Balance:**
  - Saturación del mercado: muchos lanzamientos seguidos venden menos.
  - Curva de experiencia más larga y más peso del equipo en la calidad.
  - Un jugador sensato gana en unos 160 meses de juego.
  - Nuevo `npm run simulate` y tests de balance.
- **Pruebas:** flujo completo hasta cobrar un lanzamiento, recorrido por todas las pantallas y CI con Chrome, Firefox y Safari.
- **Despliegue:**
  - `server.mjs` con compresión, caché, 404, CSP y cabeceras de seguridad.
  - `public/_headers` para Cloudflare Pages o Netlify, `Dockerfile` y `docs/DESPLIEGUE.md`.
  - Telemetría opcional y anónima.

## 0.4.0

- Exportar e importar la partida.
- Imágenes en WebP: de 40 MB a 1,1 MB.
- Carga diferida de pantallas.
- Accesibilidad: foco en los diálogos, contraste AA y diseño adaptado de 320 px a escritorio.
- Favicon, manifest y metadatos para compartir.

## 0.3.0

- Partida desde cero con tutorial y objetivos.
- Etapas con efectos reales.
- Managers, mejoras y eventos con decisiones.
- Gemas útiles, victoria en el nivel 15 y migración de partidas guardadas.

## 0.2.0

- Base técnica: módulos, reducer, ESLint, Prettier, Vitest, Playwright y CI.
- Economía corregida y todos los botones funcionales.
