# Code Empire Tycoon

Juego de gestión para el navegador: empiezas programando en tu habitación y construyes un imperio tecnológico. Ganas al llegar al nivel 15 («Imperio tecnológico»); pierdes si pasas 3 meses seguidos en números rojos. Creas proyectos, contratas un equipo, activas herramientas de IA, lanzas campañas de marketing y vigilas que las cuentas no acaben en números rojos.

## Requisitos

- Node.js 22 (ver `.nvmrc`; mínimo 20.19)

## Comandos

| Comando            | Qué hace                                                              |
| ------------------ | --------------------------------------------------------------------- |
| `npm install`      | Instala las dependencias                                              |
| `npm run dev`      | Servidor de desarrollo en http://127.0.0.1:5173                       |
| `npm run build`    | Compila a `dist/`                                                     |
| `npm run serve`    | Sirve `dist/` con `server.mjs`                                        |
| `npm run lint`     | ESLint                                                                |
| `npm run format`   | Formatea con Prettier (`format:check` solo comprueba)                 |
| `npm test`         | Tests unitarios de la lógica (Vitest)                                 |
| `npm run test:e2e` | Tests de extremo a extremo (Playwright; compila y arranca la preview) |
| `npm run images`   | Regenera las imágenes WebP de `public/assets` desde `assets-src/`     |
| `npm run check`    | Lint + formato + tests + build (lo mismo que la CI, salvo e2e)        |

Los tests e2e necesitan Chromium: `npx playwright install chromium`, o apuntar a uno ya instalado con `PLAYWRIGHT_CHROMIUM_PATH=/ruta/a/chrome`.

## Estructura

```
src/
  data/        catálogos: proyectos, IA, candidatos, campañas, assets
  game/        lógica pura, sin React
    rules.js         fórmulas de economía, progreso, capacidad…
    tick.js          avance de un mes (advanceMonth)
    reducer.js       todas las acciones del jugador
    events.js        eventos de imperio con decisiones
    goals.js         objetivos-tutorial
    save.js          guardado en localStorage con validación y migraciones
    initialState.js  partida inicial
  components/  piezas reutilizables (barra superior, diálogos, UI)
  screens/     una pantalla por archivo
assets-src/    imágenes originales en PNG (no se publican)
scripts/       optimize-images.mjs: genera WebP e iconos de la app
e2e/           tests de Playwright
docs/          plan de producción y análisis del Modo Pro
```

Toda la lógica de la partida pasa por `gameReducer` y se puede testear sin navegador (`src/game/game.test.js`).

## Documentación

- [Plan de salida a producción](docs/PLAN-PRODUCCION.md)
- [Modo Pro: análisis de viabilidad](docs/MODO-PRO.md)
