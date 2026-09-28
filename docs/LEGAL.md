# Code Empire Tycoon — Revisión legal

Estado de la fase 7 del [plan de producción](./PLAN-PRODUCCION.md). **No es asesoramiento legal:** antes de cobrar o publicar en tiendas, conviene que lo revise un abogado.

## 1. Marcas y nombres

| Antes                 | Ahora                | Dónde                      |
| --------------------- | -------------------- | -------------------------- |
| ChatGPT Plus          | PromptPal Plus       | `src/data/catalog.js` (IA) |
| Claude Pro            | Sage Pro             | ídem                       |
| Midjourney            | DreamCanvas          | ídem                       |
| Runway                | ClipForge            | ídem                       |
| GitHub Copilot        | CodeBuddy            | ídem                       |
| Unity Pro             | Nova Engine Pro      | ídem                       |
| Unity (tecnología)    | Motor de juegos      | ídem (tecnologías)         |
| Tráiler en YouTube    | Tráiler en vídeo     | ídem (campañas)            |
| Publicación en Reddit | Publicación en foros | ídem (campañas)            |
| Diana Prince          | Diana Prieto         | ídem (candidatos)          |

- Los identificadores internos (`chatgpt`, `claude`…) no cambian para no romper las partidas guardadas; no se muestran al jugador.
- **Iconos:** dos iconos de `ai-tools.png` imitaban logotipos reales (el remolino dentro de un bocadillo y el velero). Ya no se usan: las herramientas usan iconos genéricos de las hojas de productos y mejoras.
- **Pendiente:** antes de lanzar, comprobar en la base de datos de marcas de la EUIPO y la OEPM que "Code Empire Tycoon" y los nombres ficticios no chocan con marcas registradas en la clase 9/41 (videojuegos).

## 2. Imágenes

Las 26 ilustraciones originales están en `assets-src/`. **Pendiente de confirmar por el titular del proyecto:**

- [ ] ¿Quién las hizo o con qué herramienta se generaron?
- [ ] Si se generaron con IA, ¿los términos de la herramienta permiten uso comercial? Guardar una copia de esos términos con la fecha.
- [ ] Si las hizo una persona, ¿hay un contrato o cesión de derechos por escrito?
- [ ] Añadir la autoría en el apartado de créditos (Opciones → Créditos y avisos legales).

## 3. Licencias

- **Código y arte del juego:** `LICENSE` en la raíz, "todos los derechos reservados". Si se quiere publicar el código como open source, cambiarlo por la licencia elegida (por ejemplo MIT) **sin incluir el arte**, que puede tener otra licencia.
- **Dependencias que acaban en el juego publicado:** React y React DOM (MIT). Se citan en los créditos.
- **Herramientas de desarrollo** (no se publican): Vite, ESLint, Prettier, Vitest, Playwright, sharp. sharp incluye libvips (LGPL-3.0), pero solo se usa para generar las imágenes, no se distribuye con el juego.

## 4. Privacidad (RGPD)

- El juego **no usa cookies ni pide datos personales**. La partida se guarda en `localStorage`, que es almacenamiento estrictamente necesario para el servicio: no requiere banner de consentimiento.
- La telemetría (fase 9) está **desactivada por defecto**: solo se activa si en el build se configuran `VITE_ANALYTICS_ENDPOINT` o `VITE_ERROR_ENDPOINT`. Cuando está activa:
  - No envía cookies, identificadores persistentes ni datos personales. Solo un identificador aleatorio por visita, que no se guarda.
  - Respeta "No rastrear" y se puede desactivar en Opciones.
- La política de privacidad está en `public/privacidad.html` y enlazada desde Opciones.
- [ ] **Pendiente:** poner un correo de contacto real en la política de privacidad antes del lanzamiento.
- [ ] **Pendiente:** si el servicio de estadísticas o de errores guarda direcciones IP, figurarlo en la política y firmar el contrato de encargado de tratamiento (DPA) con ese proveedor.

## 5. Clasificación por edades

No hay violencia, lenguaje malsonante, apuestas con dinero real ni compras dentro del juego (las gemas no se pueden comprar). Encaja en **PEGI 3 / IARC 3+**.

- [ ] Si se publica en Google Play o en la Microsoft Store, rellenar el cuestionario IARC, que es gratuito y da la clasificación.
- [ ] Si se añaden compras con dinero real, anuncios o el Modo Pro, la clasificación y las obligaciones cambian (ver [MODO-PRO.md](./MODO-PRO.md)).

## 6. Tiendas de apps

Por ahora el juego es una web y no se publica en tiendas. Si se empaqueta para móvil más adelante:

- **Apple:**
  - Cuenta de desarrollador de 99 $/año.
  - Directriz 4.2 (funcionalidad mínima): una web envuelta sin nada propio puede ser rechazada, así que conviene añadir sonido, notificaciones o logros nativos.
- **Google Play:**
  - Cuenta de 25 $ en un único pago.
  - Formulario de seguridad de datos.
  - Clasificación IARC.
