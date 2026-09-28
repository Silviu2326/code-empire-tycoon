# Code Empire Tycoon — Modo Pro (análisis de viabilidad)

**Idea:** un modo en el que lo que haces en el juego ocurre de verdad. Cuando creas un proyecto, unos agentes de IA construyen un juego o una app real, que se publica y puede generar ingresos. El jugador puede ganar dinero con sus productos, y la plataforma gana como intermediaria.

**Conclusión:**

- **Técnicamente es viable hoy.** Lo difícil no es construir los productos, sino **venderlos**.
- **El "todos ganamos" es la parte con más riesgo legal.** El modo Pro funciona si se plantea como **"construye productos reales con IA desde un juego"**, y no como **"gana dinero jugando"**.

> Requisito previo: tener el juego base listo para producción (fases 0 a 4 de [PLAN-PRODUCCION.md](./PLAN-PRODUCCION.md)).

---

## 1. Qué se vuelve real

| En el juego                             | En el modo Pro                                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Crear proyecto (género, estilo, tamaño) | Un agente de IA programa un juego o app web real y entrega una URL jugable                                                              |
| Empleados con habilidades               | Agentes especializados: programación, arte, pruebas y revisión. La "habilidad" del empleado es el modelo y el nivel de esfuerzo que usa |
| Herramientas IA                         | Servicios reales de texto, imagen y audio, que tienen coste                                                                             |
| Servidores                              | Hosting real de los productos publicados                                                                                                |
| Barra de progreso y calidad             | Progreso real del agente y puntuación de sus pruebas automáticas                                                                        |
| Marketing                               | Publicar en la galería o en redes. Los anuncios de pago solo con aprobación explícita del jugador y un tope de gasto                    |
| Tienda                                  | Marketplace donde otros juegan, compran o dejan propinas                                                                                |
| Mensajes                                | Opiniones reales de jugadores, estadísticas y avisos de moderación                                                                      |

El gran atractivo: la barra de progreso deja de ser simulada y muestra el trabajo real del agente en directo.

### Diferencias con el modo normal

- **El tiempo es real.** Un proyecto tarda de minutos a horas, no meses del juego acelerados.
- **Los resultados no están garantizados.** Un build puede fallar, y hay que reintentarlo o devolver los créditos.
- **Cada acción cuesta dinero real.** Por eso todo lo que gasta pasa por créditos, límites y confirmaciones.

---

## 2. Costes estimados

Estimación para un juego HTML5 pequeño: entre 30 y 60 pasos de agente, con caché activada y algunas rondas de corrección. Precios oficiales de Anthropic por millón de tokens a fecha del documento.

| Modelo          | Precio entrada / salida (por millón de tokens) | Coste aproximado por proyecto pequeño |
| --------------- | ---------------------------------------------- | ------------------------------------- |
| Claude Sonnet 5 | $2 / $10                                       | 1 – 5 $                               |
| Claude Opus 5   | $5 / $25                                       | 3 – 15 $                              |

**Otros costes:**

| Concepto                           | Coste aproximado                             |
| ---------------------------------- | -------------------------------------------- |
| Hosting de cada producto publicado | Céntimos al mes                              |
| Generación de imágenes y audio     | Según el servicio, por cada recurso generado |
| Comisión de Stripe                 | Alrededor de 1,5–3 % + 0,25 € por cobro      |
| Proyectos grandes o "AAA"          | 10 veces o más el coste de uno pequeño       |

**Cómo recortar costes:**

- Usar Sonnet para los agentes que hacen tareas sencillas.
- Reservar Opus para planificar y revisar.
- Aprovechar la caché de prompts.
- Poner un límite de gasto por proyecto.

> Estas cifras hay que **medirlas en la fase A** con proyectos reales antes de fijar precios.

### Cómo se ejecutan los agentes

| Opción                    | Ventajas                                                                                                 | Inconvenientes                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **Claude Managed Agents** | Anthropic ejecuta el agente y le da un entorno aislado para trabajar. Es lo más rápido para el prototipo | Menos control sobre la infraestructura              |
| **Claude Agent SDK**      | Más control y más barato a gran escala                                                                   | Hay que mantener tú los servidores y el aislamiento |

**Recomendación:** empezar con Managed Agents en la fase A y reevaluar al escalar.

---

## 3. Modelo de negocio

| Quién             | Cómo gana                                                                                                        | Qué tan seguro es                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| **La plataforma** | Margen sobre los créditos. Ejemplo: 10 € de créditos, unos 3–4 € de IA y hosting, unos 5 € de margen tras Stripe | **Seguro.** Es el ingreso principal    |
| **La plataforma** | Comisión del 10–20 % sobre las ventas y propinas del marketplace                                                 | Depende de que los productos vendan    |
| **La plataforma** | Suscripción Pro mensual (créditos incluidos, prioridad en la cola, modelos mejores)                              | Ingreso recurrente                     |
| **El jugador**    | Ventas, propinas o anuncios de sus productos                                                                     | **Nada seguro:** la mayoría ganará 0 € |

**Realidad del mercado:** ya hay muchísimos juegos y apps hechos con IA, y lo difícil es conseguir usuarios, no escribir el código. Si se vende como "ganas dinero", la mayoría pagará más de lo que ingresa, se sentirá engañada y habrá reclamaciones.

Lo que de verdad se le ofrece al jugador es:

- la experiencia del tycoon con consecuencias reales;
- ser dueño de productos reales, con código exportable;
- aprender a crear y lanzar productos;
- la _posibilidad_, no la promesa, de ingresos.

---

## 4. Riesgos legales

> Hay que validarlo todo con un abogado antes de cobrar a nadie, sobre todo los puntos 4.1 y 4.3.

### 4.1 Que se considere una inversión

Si alguien paga esperando beneficios que dependen sobre todo del trabajo de otros (la plataforma y la IA), puede considerarse un producto de inversión regulado: CNMV en España, SEC en EE. UU. (test de Howey).

**Para evitarlo:**

- No prometer ni mostrar rentabilidades ("invierte 10 € y gana…").
- Que el jugador sea el dueño del producto y tome las decisiones: qué construir, dónde publicar, qué precio poner.
- No juntar el dinero de varios usuarios ni repartir beneficios comunes.
- No crear tokens ni participaciones.

### 4.2 Publicidad engañosa

Frases como "gana dinero jugando" o "ingresos pasivos" chocan con la normativa de protección al consumidor de la UE. Los textos de marketing deben hablar de crear productos, no de ganar dinero.

### 4.3 Cobros y pagos entre usuarios

- Usar **Stripe Connect**: la plataforma no custodia el dinero de los creadores.
- Verificar la identidad (KYC) de quien cobra.
- **Solo mayores de 18 años** en el modo Pro con pagos.
- **DAC7:** en la UE, las plataformas deben declarar a Hacienda lo que cobra cada vendedor.
- Gestionar el IVA de las ventas digitales (OSS en la UE).

### 4.4 Parecido a una apuesta

Si pagas y el resultado depende del azar con un premio en dinero, se acerca a las apuestas o a las loot boxes. El resultado tiene que depender de las decisiones del jugador y de la calidad del producto, no de tiradas aleatorias.

### 4.5 Responsabilidad por lo que se genera

- **Propiedad intelectual:** rechazar peticiones de clonar marcas ("hazme un Mario") y revisar lo generado.
- **Mal uso:** webs de phishing, malware o contenido ilegal. Hay que moderar antes de publicar.
- Tener un proceso para atender reclamaciones de derechos de autor (DMCA), términos de uso y política de contenido.
- Indicar que el contenido está generado con IA donde la ley lo exija (Reglamento de IA de la UE).

### 4.6 Tiendas de apps

Apple (norma 4.3, spam) y Google Play rechazan o banean las apps generadas en masa. Hay que publicar en el marketplace propio o en la web, o con **las cuentas del propio jugador**. Nunca en masa desde una cuenta de la plataforma.

---

## 5. Arquitectura necesaria

El juego actual funciona solo en el navegador y guarda en `localStorage`. El modo Pro necesita un backend completo:

```
[Juego React] ──► [API backend] ──► [Cola de trabajos] ──► [Ejecutor de agentes]
      ▲                 │                                         │
      │   progreso en   │                                         ▼
      └── tiempo real ──┤                                 [Almacenamiento de builds]
                        │                                         │
                        ├──► [Base de datos]                      ▼
                        ├──► [Stripe / Connect]           [Moderación y escaneo]
                        └──► [Contabilidad de costes]             │
                                                                  ▼
                                                  [Hosting en dominio aislado]
```

| Pieza                           | Para qué                                                                                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Autenticación                   | Cuentas de usuario y verificación de edad                                                                                                                              |
| Base de datos (p. ej. Postgres) | Usuarios, proyectos, créditos, ventas, costes                                                                                                                          |
| Pagos                           | Stripe para los créditos y suscripciones; Stripe Connect para pagar a los creadores                                                                                    |
| Cola de trabajos                | Ejecutar los proyectos sin bloquear la web, con reintentos                                                                                                             |
| Ejecutor de agentes             | Managed Agents o Agent SDK, con límite de gasto por proyecto                                                                                                           |
| Progreso en tiempo real         | Enviar al juego el avance real del agente                                                                                                                              |
| Almacenamiento (S3 / R2)        | Código y builds de cada proyecto                                                                                                                                       |
| **Hosting en dominio separado** | Los juegos generados se sirven en otro dominio (p. ej. `*.juegos-usuarios.com`) con reglas de seguridad estrictas, para que su código no pueda atacar la web principal |
| Moderación                      | Revisar contenido y código antes de publicar                                                                                                                           |
| Observabilidad                  | Registros, alertas y un panel de costes                                                                                                                                |
| Límites                         | Topes de gasto por usuario, por día y globales, para que un error no cueste miles de euros                                                                             |

### Control del gasto

- Los créditos se reservan al empezar el proyecto y se descuentan según el consumo real.
- El proyecto se detiene automáticamente si se pasa del presupuesto.
- Si el build falla por culpa de la plataforma, se devuelven los créditos.
- Cualquier gasto externo (anuncios, dominios) requiere confirmación explícita y tiene un tope.

---

## 6. Fases

### Fase A — Prueba de concepto (sin dinero real)

- [ ] Backend mínimo: autenticación, base de datos, cola y ejecutor con Managed Agents.
- [ ] "Crear proyecto" genera un juego HTML5 real con un solo agente.
- [ ] Progreso real en la barra del juego.
- [ ] Publicación en una galería propia, en un dominio aislado.
- [ ] Moderación básica.
- [ ] Créditos gratis limitados por usuario.
- **Qué medir:** % de juegos que funcionan, coste medio por proyecto, tiempo de generación, si los usuarios vuelven, valoración de los juegos.
- **Para pasar a la siguiente fase:** más del 70 % de los juegos funcionan y el coste medio es menor de 5 $.

### Fase B — Créditos de pago (gana la plataforma)

- [ ] Stripe: paquetes de créditos y suscripción Pro.
- [ ] Varios agentes por proyecto (los "empleados"); tamaños mayores.
- [ ] Iterar un proyecto ("mejora el nivel 2", "cambia el arte").
- [ ] Exportar el código del proyecto.
- [ ] Términos de uso, política de privacidad y de contenido.
- **Qué medir:** margen por proyecto, conversión de gratis a pago, pérdida de clientes.

### Fase C — Marketplace (ganan todos)

- [ ] Ventas, propinas y (opcional) anuncios en los productos.
- [ ] Stripe Connect para los pagos a creadores, con verificación de identidad y solo mayores de 18.
- [ ] Declaración DAC7 e IVA.
- [ ] Comisión de la plataforma (10–20 %).
- [ ] Rankings y descubrimiento dentro del juego (es el "marketing" real).
- [ ] Proceso DMCA y de reportes.
- **Qué medir:** ventas por proyecto, % de creadores con algún ingreso, fraude.

### Fase D — Publicación fuera de la plataforma

- [ ] Publicar en itch.io o en dominios propios con **las cuentas del jugador**.
- [ ] Marketing real (anuncios) con aprobación explícita y topes.
- [ ] Estadísticas del producto dentro del juego.
- **Qué medir:** retorno de lo invertido por el jugador.

---

## 7. Riesgos de negocio y cómo mitigarlos

| Riesgo                                         | Mitigación                                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------------------------- |
| Juegos generados de baja calidad               | Plantillas y géneros acotados, agente de pruebas y revisión, iteración                  |
| Coste de IA mayor que lo que se cobra          | Medirlo en la fase A, límites de gasto por proyecto, modelos más baratos para subtareas |
| Productos que no venden y jugadores frustrados | No prometer ingresos; valor en la experiencia y en ser dueño del producto               |
| Abuso (phishing, malware, plagio)              | Moderación, dominio aislado, reportes, baneos                                           |
| Problemas regulatorios                         | Asesoría legal antes de la fase B; nada de rentabilidades ni fondos comunes             |
| Dependencia de un solo proveedor de IA         | Separar el ejecutor de agentes del resto del backend                                    |
| Menores usando pagos                           | Verificación de edad y KYC antes de cobrar o recibir pagos                              |

---

## 8. Recomendación final

1. Terminar primero el juego base (plan de producción).
2. Hacer la **fase A sin dinero real** para comprobar dos cosas: que los juegos generados son lo bastante buenos y cuánto cuestan de verdad.
3. Presentarlo como **"estudio de IA gamificado"**, parecido a Lovable o Bolt pero con la experiencia del tycoon. Nunca como "gana dinero jugando".
4. Ingresos de la plataforma: margen de créditos + suscripción + comisión del marketplace.
5. Consultar con un abogado antes de activar cualquier cobro o pago (fases B y C).
