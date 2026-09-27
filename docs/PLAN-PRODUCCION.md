# Code Empire Tycoon — Plan para salir a producción

Estado de partida: **v0.1.0**, un único commit. La interfaz está muy trabajada, pero buena parte de la jugabilidad es solo apariencia. Este documento recoge **todo** lo que hay que hacer para publicar el juego, organizado en fases. Cada tarea lleva una casilla para ir marcándola.

> Las referencias `App.jsx:NNN` apuntan a `src/App.jsx` en el commit `abeeaed`.

> **Estado (v0.5.0):** las fases 0 a 9 están implementadas. Lo que queda abierto en ellas está sin marcar y con una nota.

---

## Resumen de fases

| Fase | Objetivo                                                           | Bloquea el lanzamiento |
| ---- | ------------------------------------------------------------------ | ---------------------- |
| 0    | Base técnica: dependencias, estructura, lint, tests, CI            | Sí                     |
| 1    | Corregir bugs de lógica y economía                                 | Sí                     |
| 2    | Revisar todos los botones: que ninguno esté muerto ni haga trampas | Sí                     |
| 3    | Completar mecánicas (progresión, eventos, gemas, fin de partida)   | Sí                     |
| 4    | Guardado robusto                                                   | Sí                     |
| 5    | Rendimiento y assets (47 MB de PNG)                                | Sí                     |
| 6    | UX, accesibilidad y responsive                                     | Sí                     |
| 7    | Legal y marcas                                                     | Sí                     |
| 8    | QA y balance                                                       | Sí                     |
| 9    | Despliegue e infraestructura                                       | Sí                     |
| 10   | Lanzamiento y post-lanzamiento                                     | No                     |

---

## Fase 0 — Base técnica

- [x] **Fijar versiones de las dependencias.** `package.json` usa `"latest"` en react, react-dom, vite y @vitejs/plugin-react: cualquier `npm install` puede romper el build. Hay que poner versiones concretas (`^x.y.z`) y confiar en el `package-lock.json`.
- [x] Mover `vite` y `@vitejs/plugin-react` a `devDependencies`.
- [x] Añadir `engines.node` en `package.json` y un `.nvmrc`.
- [x] **Dividir `App.jsx`** (786 líneas, todo en un archivo):
  - `src/data/` — catálogos: proyectos, IA, candidatos, campañas, etapas, eventos.
  - `src/game/` — lógica pura sin React: `advanceMonth`, economía, acciones (contratar, comprar, crear proyecto…).
  - `src/screens/` — una pantalla por archivo (Office, Projects, CreateProject, ProjectDetail, AiScreen, Employees, Store, StartScreen).
  - `src/components/` — piezas reutilizables (Stat, Avatar, ToolRow, ScreenTitle, BottomNav…).
- [x] Pasar el estado a un `useReducer` con acciones con nombre (`HIRE`, `BUY_AI`, `CREATE_PROJECT`, `TICK`…). Así toda la lógica vive en un único sitio y se puede testear.
- [x] Añadir ESLint (con `eslint-plugin-react-hooks`) y Prettier.
- [x] Añadir Vitest para la lógica y Playwright para pruebas de extremo a extremo.
- [ ] Opcional, pero recomendado: migrar a TypeScript o, como mínimo, tipar el estado con JSDoc.
- [x] CI con GitHub Actions: `install → lint → test → build` en cada PR.
- [x] `README.md` con la descripción del juego, los requisitos y los comandos (`dev`, `build`, `serve`, `test`).
- [ ] Borrar `.commandcode/` (es un archivo vacío de otra herramienta) o añadirlo a `.gitignore`. _(Pendiente: decidir si se sigue usando CommandCode)._

---

## Fase 1 — Bugs de lógica y economía

### Economía

- [x] **Salario cobrado dos veces.** `hire()` (`App.jsx:260`) cobra el salario al contratar, y `advanceMonth` lo vuelve a cobrar ese mismo mes. Hay que elegir entre pagar solo mensualmente o cobrar una prima de contratación separada y claramente indicada.
- [x] **Precio de la IA incoherente.** El botón dice `$20/mes`, pero `buyAi()` (`App.jsx:249`) cobra `price * 40` ($800) de golpe y además la cuota mensual. Hay que mostrar el coste real o cobrar solo la cuota.
- [x] **Los proyectos solo pagan una vez.** Al llegar al 100 % se cobra un pago único, aunque el mensaje diga "ya genera ingresos". Hay que implementar ventas recurrentes que vayan bajando con el tiempo, basadas en calidad, fans y lista de deseados.
- [x] **No existe la bancarrota.** `money` se queda en `Math.max(0, …)` (`App.jsx:212`). Faltan saldo negativo, deuda o aviso, y un game over o rescate.
- [x] `salesForecast` y `wishlist` crecen, pero no afectan a nada. Deben alimentar las ventas del lanzamiento.
- [x] `monthlyIncome` se calcula en dos sitios (`App.jsx:169` y `App.jsx:235`). Hay que unificarlo y mostrar el **neto** (ingresos − salarios − IA), no solo los ingresos brutos.

### Proyectos

- [x] **Los servidores no se liberan.** `createProject` resta un servidor, pero nada lo devuelve al completar el proyecto. Hay que liberarlo en `advanceMonth` cuando `completedNow`.
- [x] `createProject` (`App.jsx:271`) no comprueba el dinero ni los servidores; solo lo hace el botón. La validación debe estar dentro de la acción.
- [x] **El equipo queda congelado al crear el proyecto.** Se asignan `staff.slice(0, 3)` y `ownedAi.slice(0, 2)`, y no se pueden cambiar después. Hay que poder asignar y quitar empleados e IA en cada proyecto.
- [x] Un mismo empleado puede estar en varios proyectos a la vez y rinde al 100 % en todos. Hay que repartir su dedicación o limitarle a un proyecto.
- [x] La fecha límite está fija (`'Dic 2025'`). Debe calcularse a partir de la fecha del juego y la velocidad estimada.
- [x] La calidad inicial es fija (48) y no depende del género, el estilo ni las tecnologías.
- [x] Las tecnologías no afectan a nada salvo a la recompensa, y el botón "+" solo añade "Multijugador" (ver fase 2).
- [x] El proyecto "idea" `p3` (Cyber Streets) no se puede iniciar. Al pulsarlo va a la pantalla de crear, pero con los valores por defecto, no con los suyos.
- [x] El icono del proyecto se elige solo por género y cae en `terminal` para Aventura y Estrategia. Hacen falta iconos por género. _(v0.3: iconos por género con las 3 ilustraciones y `sheet-products.png`)._
- [x] `ProjectDetail` usa `game.projects[0]` si no encuentra el proyecto, y peta si no hay ninguno.

### Personal

- [x] **Límite de 4 desarrolladores no aplicado.** La oficina muestra `staff.length/4`, pero se puede contratar a los 5 candidatos. Hay que aplicar la capacidad según el nivel de oficina.
- [x] No se puede despedir a nadie.
- [x] Solo hay 5 candidatos fijos. Hace falta un pool que se regenere.
- [ ] `avatarIndex.devE` reutiliza el retrato de `devA`, y en `aiToolIndex` hay sprites repetidos (Copilot = ChatGPT, Unity = Claude). Faltan retratos e iconos. _(Pendiente: requiere arte nuevo)._

### Tiempo y progresión

- [x] Solo se puede subir **un nivel por mes**: la XP se queda en 100 con `clamp`, y el sobrante se pierde.
- [x] La XP no depende de lo que haces. Suma un +6 fijo más un bonus por **todos** los proyectos completados de la historia, cada mes, así que se acumula sin límite.
- [x] Los mensajes siempre dicen "Hoy". Hay que guardar la fecha del juego y mostrarla relativa.

### Bugs de React

- [x] Varios botones leen `game` del cierre en lugar del estado actual. Por ejemplo, "Mejorar" en la oficina (`App.jsx:368`): si el tick mensual llega entre el render y el clic, se pierden cambios. Todas las acciones deben usar el updater (`setGame(current => …)`) o el reducer.
- [x] `JSON.parse` del guardado sin `try/catch` (`App.jsx:225`): un guardado corrupto rompe el juego en blanco (ver fase 4).
- [x] Se escribe en `localStorage` en cada cambio de estado, incluido el cambio de pestaña. Hay que limitar la frecuencia (debounce) o guardar en cada tick o acción.
- [x] No hay límite de error (error boundary): cualquier excepción deja la pantalla en blanco.

---

## Fase 2 — Revisión de todos los botones

Inventario completo de los elementos pulsables que hay en `App.jsx`.

> **v0.2.0:** todas las filas de estas tablas están resueltas. En v0.3.0 (fase 3) también funcionan Expansión, Eventos, Managers, las decisiones de los mensajes y las gemas.

**Leyenda:**

- ✅ Funciona.
- ⚠️ Funciona, pero con errores.
- ❌ No hace nada o es falso.

### Pantalla de inicio (`StartScreen`)

| Botón          | Estado | Problema                                                                            | Qué hacer                                                                                                   |
| -------------- | ------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| ⚙ (engranaje)  | ❌     | No tiene `onClick`                                                                  | Abrir el menú de opciones                                                                                   |
| Nueva partida  | ⚠️     | Borra el guardado sin avisar                                                        | Pedir confirmación si hay una partida guardada                                                              |
| Cargar partida | ⚠️     | Siempre está activo, aunque no haya guardado; en ese caso arranca una partida nueva | Desactivarlo si no hay guardado y mostrar la fecha y el nivel de la partida                                 |
| Opciones       | ❌     | No tiene `onClick`                                                                  | Pantalla de opciones: volumen, velocidad por defecto, idioma, borrar partida, exportar e importar, créditos |
| (falta)        | —      | No se puede volver al menú desde la partida                                         | Añadir menú de pausa o "Salir al menú"                                                                      |

### Barra superior (`TopBar`)

| Botón                                 | Estado | Problema                                | Qué hacer                                                      |
| ------------------------------------- | ------ | --------------------------------------- | -------------------------------------------------------------- |
| "+" junto a las gemas                 | ❌     | **Regala 25 gemas gratis en cada clic** | Quitarlo, o convertirlo en tienda de gemas o recompensa diaria |
| Pausa / ▶                             | ✅     | —                                       | Añadir atajo de teclado (espacio) y `aria-label`               |
| 1x / 2x / 4x                          | ✅     | —                                       | Añadir `aria-label`                                            |
| Pastillas de nivel, dinero e ingresos | —      | Solo informan                           | Mostrar el detalle al pulsarlas (desglose del mes)             |

### Oficina (`Office`)

| Botón                 | Estado | Problema                                                                                 | Qué hacer                                     |
| --------------------- | ------ | ---------------------------------------------------------------------------------------- | --------------------------------------------- |
| Mejorar $5.000        | ⚠️     | No se desactiva sin dinero; usa estado viejo; el precio no escala; no tiene nivel máximo | Coste creciente, botón desactivado y feedback |
| Crear proyecto        | ✅     | —                                                                                        | —                                             |
| Marketing             | ✅     | Lleva a la pestaña "Tienda"                                                              | Unificar el nombre (ver Tienda)               |
| Huecos "+" del equipo | ✅     | Muestra 4 huecos fijos                                                                   | Mostrar la capacidad real según la oficina    |

### Proyectos (`Projects`)

| Botón                   | Estado | Problema                                         | Qué hacer                                         |
| ----------------------- | ------ | ------------------------------------------------ | ------------------------------------------------- |
| + Nuevo Proyecto        | ✅     | —                                                | —                                                 |
| Pestaña "En desarrollo" | ❌     | Es un `<span>` y se muestran todos los proyectos | Filtros reales                                    |
| Pestaña "Completados"   | ❌     | Es un `<span>`                                   | Filtrar los completados                           |
| Pestaña "Cancelados"    | ❌     | No existe la cancelación                         | Implementar cancelar proyecto o quitar la pestaña |
| Tarjeta de proyecto     | ⚠️     | Una idea abre la pantalla de crear sin sus datos | Precargar la plantilla                            |

### Crear proyecto (`CreateProject`)

| Botón                                 | Estado | Problema                                              | Qué hacer                                                     |
| ------------------------------------- | ------ | ----------------------------------------------------- | ------------------------------------------------------------- |
| ‹ Volver                              | ✅     | —                                                     | —                                                             |
| Selectores de género, estilo y tamaño | ✅     | Solo cambian el coste y la dificultad                 | Que el género y el estilo influyan en la calidad y la demanda |
| "+" de tecnologías                    | ⚠️     | Solo añade "Multijugador"; no se puede quitar ninguna | Selector real de tecnologías con coste y efecto               |
| Chips de tecnologías                  | ❌     | No son interactivos                                   | Permitir quitarlas                                            |
| Crear proyecto                        | ⚠️     | El mensaje de error es genérico                       | Decir qué falta (dinero, servidor o nombre)                   |

### Detalle de proyecto (`ProjectDetail`)

| Botón                                       | Estado | Problema                                           | Qué hacer                                                     |
| ------------------------------------------- | ------ | -------------------------------------------------- | ------------------------------------------------------------- |
| ‹ Volver                                    | ✅     | —                                                  | —                                                             |
| Pestañas Resumen, Tareas, Equipo y Análisis | ❌     | Son `<span>`                                       | Implementar las 4 vistas o dejar solo Resumen                 |
| Huecos "+" del equipo                       | ❌     | Son `<span>`                                       | Asignar empleados al proyecto                                 |
| Continuar desarrollo                        | ⚠️     | Solo quita la pausa y **pone la velocidad a 4x**   | Quitar la pausa sin cambiar la velocidad, o eliminar el botón |
| (falta)                                     | —      | No se puede cancelar, lanzar antes ni hacer crunch | Añadir acciones de proyecto                                   |

### IA (`AiScreen`)

| Botón               | Estado | Problema                                                       | Qué hacer                                     |
| ------------------- | ------ | -------------------------------------------------------------- | --------------------------------------------- |
| Comprar herramienta | ⚠️     | El precio mostrado no es el cobrado; no avisa si no hay dinero | Precio real, botón desactivado y confirmación |
| "Activo"            | ⚠️     | No se puede cancelar la suscripción                            | Permitir darla de baja                        |
| Pastilla de gemas   | —      | Las gemas no sirven para nada                                  | Ver fase 3                                    |

### Empleados (`Employees`)

| Botón               | Estado | Problema                                                         | Qué hacer                              |
| ------------------- | ------ | ---------------------------------------------------------------- | -------------------------------------- |
| + Contratar         | ❌     | No tiene `onAction`                                              | Abrir el pool de candidatos o quitarlo |
| Salario / Contratar | ⚠️     | Cobro doble; sin límite de plazas; sin aviso por falta de dinero | Ver fase 1                             |
| "En equipo"         | ⚠️     | No hace nada                                                     | Mostrar la ficha y permitir despedir   |

### Tienda / Marketing (`Store`)

| Botón                         | Estado | Problema                                                     | Qué hacer                                                         |
| ----------------------------- | ------ | ------------------------------------------------------------ | ----------------------------------------------------------------- |
| Pestaña "Tienda"              | ⚠️     | Abre una pantalla titulada "Marketing"                       | Renombrar la pestaña a "Marketing" o crear una tienda real        |
| Botón de precio de la campaña | ⚠️     | Efecto instantáneo; se puede pulsar sin límite; sin feedback | Campañas con duración, tiempo de espera y rendimiento decreciente |
| Título "Campañas activas"     | ❌     | Lista el catálogo, no campañas activas                       | Separar catálogo y campañas en curso                              |
| Gráfica                       | ❌     | Barras pseudoaleatorias                                      | Historial real de fans e ingresos                                 |
| Expansión, Eventos y Managers | ❌     | Imágenes decorativas                                         | Ver fase 3                                                        |
| Mensajes                      | ❌     | No se pueden abrir                                           | Bandeja con detalle y decisiones (aceptar o rechazar ofertas)     |

### Navegación inferior (`BottomNav`)

| Botón                                     | Estado | Problema                                                       | Qué hacer          |
| ----------------------------------------- | ------ | -------------------------------------------------------------- | ------------------ |
| Oficina, Proyectos, IA, Empleados, Tienda | ✅     | Los iconos son caracteres Unicode que cambian según el sistema | Iconos SVG propios |

### Transversal a todos los botones

- [x] Todos los botones sin acción deben desactivarse (`disabled`) cuando la acción no sea posible.
- [x] Añadir `aria-label` a los botones que solo tienen un icono (⚙, +, ‹, ▶, Ⅱ).
- [x] Añadir `type="button"` en todos los botones.
- [x] Dar feedback a cada acción: toast, animación o sonido.
- [x] Pedir confirmación en las acciones caras o destructivas.

---

## Fase 3 — Completar las mecánicas

> **Hecho en v0.3.0:**
>
> - Nueva partida desde cero ("Coder de habitación", solo el fundador y la idea Code Quest), con bienvenida y 7 objetivos-tutorial que dan gemas.
> - Las 5 etapas desbloquean plazas, servidores, tamaños de proyecto (Grande en nivel 3, AAA en nivel 10) y candidatos mejores; la escena de la oficina cambia con la etapa.
> - 6 managers (retratos de `sheet-executives.png`), 5 mejoras permanentes (iconos de `sheet-upgrades.png`), iconos de producto por género (`sheet-products.png`).
> - 5 eventos de imperio que llegan como mensajes con decisiones (inversión con cesión de participación, gira, adquisición, premios, salida a bolsa).
> - Gemas: sprint (+10% de progreso) y búsqueda de talento.
> - Victoria al llegar al nivel 15; derrota por bancarrota. Gráficas de seguidores y de balance mensual.

- [x] **Etapas del imperio.** Ahora solo cambian una etiqueta. Deben desbloquear cosas reales: más plazas, servidores, tamaños de proyecto (AAA solo en HQ) y candidatos mejores. Además, la escena de la oficina debe cambiar según la etapa (los assets `stage-*.png` ya existen).
- [x] **Eventos especiales** (ronda de inversión, lanzamiento mundial, salida a bolsa, adquisición, premios): son imágenes con texto. Hay que implementar sus disparadores, sus decisiones y sus recompensas reales.
- [x] **Expansión** (mercado global, data center): convertirla en mejoras que se puedan comprar.
- [x] **Hojas de upgrades, productos y managers:** ahora son imágenes sueltas. Hay que convertirlas en sistemas o quitarlas.
- [x] **Gemas:** definir para qué sirven (acelerar proyectos, contratar talento raro, cosméticos) o eliminarlas.
- [x] **Mensajes con decisiones:** ofertas de inversores, clientes y prensa con consecuencias.
- [x] **Objetivo y final:** condición de victoria (llegar a "Imperio tecnológico" o a una valoración X) y derrota (bancarrota).
- [x] **Tutorial / onboarding** de las primeras partidas: qué hacer, cómo se gana y cómo se pierde.
- [x] **Estado inicial coherente:** hoy la partida empieza en nivel 3, con $15.430, 8.920 fans y proyectos ya al 65 %. Hay que decidir si se empieza desde cero ("Coder de habitación") como cuenta la narrativa.
- [x] **Cancelar proyecto**, con recuperación parcial del gasto.
- [x] **Estadísticas e historial:** ingresos por mes y ventas por proyecto. _(v0.3: gráficas de seguidores y balance mensual, y análisis por proyecto)._
- [ ] Opcional: sonido y música con controles de volumen.

---

## Fase 4 — Guardado robusto

- [x] Envolver lectura y escritura de `localStorage` en `try/catch`: en modo privado o con almacenamiento lleno ahora mismo falla.
- [x] Validar el guardado al cargarlo. Si está corrupto, avisar y ofrecer una partida nueva en vez de dejar la pantalla en blanco.
- [x] Añadir un número de versión dentro del guardado (`saveVersion`) y funciones de migración. Hoy cualquier cambio en el estado rompe las partidas existentes. _(v0.3: `saveVersion`, validación y migración v2 → v3 en `save.js`)._
- [x] No guardar el estado de la interfaz (`activeTab`, `paused`) como si fuera parte de la partida.
- [x] Exportar e importar la partida como archivo o código. _(v0.4: Opciones → Exportar/Importar partida, con validación y migración)._
- [ ] Opcional: varias ranuras de guardado y guardado en la nube (requiere backend y cuentas). _(Descartado por ahora: el guardado en la nube necesita backend y cuentas (fase 9 / Modo Pro))._
- [ ] Opcional: progreso mientras el juego está cerrado, calculando los meses transcurridos. _(Descartado: el estudio podría quebrar mientras no juegas, y eso es injusto para el jugador)._

---

## Fase 5 — Rendimiento y assets

- [x] **`public/assets` pesa 47 MB** (26 PNG, varios de más de 2,5 MB). En móvil es inaceptable. _(v0.4: WebP redimensionado con `npm run images`: 40 MB → 1,1 MB; originales en `assets-src/`)._
  - Convertir a WebP o AVIF, con PNG como alternativa si hace falta.
  - Redimensionar al tamaño real en pantalla (1x/2x).
  - Objetivo: menos de 3 MB en total y menos de 1 MB para la primera pantalla.
- [x] Carga diferida (`loading="lazy"`) en las imágenes que no se ven al abrir (etapas, eventos, expansión).
- [x] Precargar solo `hero-start.png` y `office-scene.png`. _(v0.4: se precarga `hero-start.webp`; la escena de la oficina lleva `fetchPriority="high"`)._
- [x] Dimensiones `width`/`height` en las imágenes para evitar saltos de maquetación.
- [x] Dividir el código de las pantallas con `React.lazy` si el bundle crece (hoy son 68 kB gzip, que está bien). _(v0.4: todas las pantallas salvo la Oficina se cargan bajo demanda y se precargan al empezar)._
- [x] Revisar con Lighthouse: Performance mayor que 90 en móvil. _(v0.4, móvil: Rendimiento 93, Accesibilidad 100, Buenas prácticas 100, SEO 92. Falta compresión gzip en el servidor (fase 9))._

---

## Fase 6 — UX, accesibilidad y responsive

- [x] Textos alternativos (`alt`) útiles en las imágenes con contenido. Ahora todas tienen `alt=""`. _(v0.4: la escena de la oficina, los retratos y los avatares tienen texto; las imágenes decorativas junto a texto mantienen `alt=""` a propósito)._
- [x] Navegación completa con teclado y estilos `:focus-visible` (no hay ninguno en `styles.css`). _(v0.4: `:focus-visible`, foco atrapado en los diálogos y Esc cierra solo el de arriba)._
- [x] Contraste AA en los textos pequeños y apagados. _(v0.4: texto oscuro en los botones verdes y rojo más claro; todas las combinaciones revisadas ≥ 4,5:1)._
- [x] Respetar `prefers-reduced-motion` en las animaciones.
- [x] Probar en 320 px, 375 px, 430 px, tablet y escritorio. Hoy solo hay dos media queries (`max-width: 430px` y `min-width: 900px`). _(v0.4: revisado en 320, 375, 430, 820 y 1280 px sin desbordes horizontales)._
- [x] Estados vacíos: sin proyectos, sin empleados, sin IA.
- [x] Unificar el formato de números y moneda (hoy es `en-US` en un juego en español). Usar `Intl.NumberFormat('es-ES')` o la configuración del idioma.
- [ ] **Internacionalización:** sacar todos los textos a archivos de idioma (es, y en si se quiere llegar a más gente). _(Pendiente: decidir si se lanza también en inglés; si es así, sacar los textos a `src/i18n/`)._
- [x] Favicon, `apple-touch-icon` y `manifest.webmanifest`.
- [x] Metadatos `description` y Open Graph para compartir. _(v0.4: falta poner una URL absoluta en `og:image` cuando haya dominio (fase 9))._
- [x] La versión `v0.1.0` está escrita a mano en `StartScreen`. Debe salir de `package.json`.

---

## Fase 7 — Legal y marcas

- [x] **Nombres de productos reales:** ChatGPT, Claude, Midjourney, Runway, GitHub Copilot y Unity son marcas registradas, y se usan con sus precios. Sustituirlos por parodias o nombres ficticios, o conseguir permiso. _(v0.5: nombres ficticios e iconos genéricos; tabla en `docs/LEGAL.md`)._
- [x] **Personajes con nombres protegidos:** "Diana Prince" es Wonder Woman (DC Comics). Cambiarlo. _(v0.2: renombrada a Diana Prieto)._
- [ ] Revisar el origen y la licencia de todas las imágenes de `public/assets`. Si son generadas por IA, revisar los términos de la herramienta usada. _(Pendiente del titular: indicar el origen y la licencia en `docs/LEGAL.md`, apartado 2)._
- [x] Añadir un archivo `LICENSE` y una pantalla de créditos. _(v0.5: `LICENSE` con todos los derechos reservados; créditos en Opciones)._
- [x] Política de privacidad y aviso de cookies si se añaden analíticas (RGPD). _(v0.5: `public/privacidad.html`; sin cookies no hace falta aviso. Falta un correo de contacto real)._
- [x] Si se publica en tiendas de apps: clasificación por edades y cumplir sus políticas. _(v0.5: no aplica por ahora; recomendación PEGI 3 y requisitos en `docs/LEGAL.md`)._

---

## Fase 8 — QA y balance

### Tests unitarios (Vitest)

- [x] `advanceMonth`: progreso, calidad, pagos, subida de nivel y cambio de año de diciembre a enero.
- [x] Todas las acciones: contratar, comprar IA, crear proyecto, campañas, mejorar oficina.
- [x] Casos límite: dinero insuficiente, sin servidores, plazas llenas, guardado corrupto.

### Tests de extremo a extremo (Playwright)

- [x] Nueva partida → crear proyecto → completarlo → cobrar.
- [x] Guardar → recargar la página → cargar partida.
- [x] Pulsar cada botón del inventario de la fase 2 y comprobar su efecto. _(v0.5: recorrido por todas las pantallas y diálogos comprobando nombres accesibles y errores, más pruebas específicas de cada acción)._

### Balance

- [x] Simular partidas completas con un script y graficar dinero y nivel en el tiempo. _(Primera simulación v0.3 con un bot sensato: gana en ~58 meses de juego y acaba con más de $1M; el final es demasiado fácil y casi nunca se llega a calidad 90 para el evento de premios)._ _(v0.5: `npm run simulate` (añade `-- --csv` para gráficas) con 5 estilos de juego)._
- [x] Definir la duración objetivo de una partida. _(v0.5: un jugador sensato gana en 120–220 meses de juego (unos 10–15 min a 1x); vigilado por `src/game/balance.test.js`)._
- [x] Ajustar costes y recompensas para que no haya estrategias rotas (por ejemplo, spamear campañas). _(v0.5: saturación del mercado, curva de experiencia más larga y calidad alcanzable; spamear campañas no acelera la partida)._

### Otras pruebas

- [x] Navegadores: Chrome, Firefox, Safari (incluido iOS) y Edge. _(v0.5: la CI ejecuta los e2e en Chrome, Firefox y Safari (iPhone); en local solo se ha podido probar Chromium)._
- [ ] Prueba con jugadores reales (5–10 personas), recogiendo sus opiniones. _(Pendiente: guía en `docs/PLAYTEST.md`)._

---

## Fase 9 — Despliegue e infraestructura

- [x] **Elegir hosting.** Es una web estática, así que lo recomendable es Netlify, Vercel, Cloudflare Pages o GitHub Pages. Con eso sobra `server.mjs`. _(v0.5: recomendado Cloudflare Pages, con `public/_headers`; pasos en `docs/DESPLIEGUE.md`)._
- [x] Si se mantiene `server.mjs`, hay que arreglarlo: _(v0.5: reescrito y cubierto por `test/server.test.js`; `Dockerfile` incluido, sin probar por falta de Docker)._
  - Escucha solo en `127.0.0.1`: en un contenedor tiene que escuchar en `0.0.0.0`.
  - Devuelve `200` con `index.html` para cualquier archivo que no existe, incluidas imágenes y JS. Debe devolver `404` para archivos con extensión.
  - Pone `Cache-Control: no-store` en todo. Los assets con hash deben llevar `max-age=31536000, immutable`, e `index.html` `no-cache`.
  - Falta compresión (gzip/brotli).
  - Falta el tipo `.webp` / `.avif` en `types`.
  - Faltan cabeceras de seguridad: `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`.
- [ ] Dominio y HTTPS. _(Pendiente del titular: comprar el dominio y conectarlo en Cloudflare Pages (el HTTPS es automático))._
- [x] Pipeline de despliegue: _(v0.5: CI con lint, tests, build y e2e en 3 navegadores; las previews por PR y el despliegue de `main` los hace Cloudflare Pages al conectar el repo)._
  - Cada PR genera un despliegue de preview.
  - `main` despliega a producción.
- [x] Monitorización de errores (Sentry o similar). _(v0.5: `src/telemetry.js` envía errores si se configura `VITE_ERROR_ENDPOINT`; se puede cambiar por Sentry)._
- [x] Analíticas anónimas respetuosas con la privacidad: embudo del tutorial, duración de las partidas, dónde abandona la gente. _(v0.5: eventos del embudo si se configura `VITE_ANALYTICS_ENDPOINT`; sin cookies, respeta «No rastrear» y se puede desactivar en Opciones)._
- [ ] Opcional: PWA (instalable y jugable sin conexión) con `vite-plugin-pwa`. _(Opcional, no hecho: el manifest ya existe; falta el service worker)._
- [ ] Opcional: empaquetar para móvil con Capacitor, o para escritorio con Tauri o Electron, si se quiere publicar en tiendas o en Steam. _(Opcional, no hecho)._

---

## Fase 10 — Lanzamiento y post-lanzamiento

- [ ] Versión 1.0.0 con changelog (`CHANGELOG.md`) y etiqueta de git.
- [ ] Página de presentación con capturas y tráiler.
- [ ] Canal de feedback: formulario, Discord o issues.
- [ ] Plan de parches: corregir bugs críticos en menos de 48 h.
- [ ] Ideas para después del lanzamiento: logros, ranking, más géneros, eventos de temporada, más idiomas.
- [ ] Modo Pro: proyectos reales construidos con IA. Ver el análisis en [MODO-PRO.md](./MODO-PRO.md).

---

## Criterios de "listo para producción"

1. Ningún botón visible está muerto ni regala recursos.
2. El dinero cobrado coincide siempre con el precio mostrado.
3. Una partida se puede ganar y perder.
4. El guardado sobrevive a recargas, a actualizaciones del juego y a datos corruptos.
5. La primera carga en móvil 4G tarda menos de 3 s, con menos de 3 MB de assets.
6. Lint, tests y build pasan en CI.
7. No hay marcas ni personajes de terceros sin permiso.
8. Está desplegado con HTTPS, caché correcta y monitorización de errores.
