# Code Empire Tycoon — Guía de pruebas con jugadores

Fase 8 del [plan de producción](./PLAN-PRODUCCION.md). El objetivo es ver jugar a 5–10 personas que no conocen el juego antes del lanzamiento.

## Preparación

- Usar la URL de preview de Cloudflare Pages (ver [DESPLIEGUE.md](./DESPLIEGUE.md)).
- Que al menos la mitad juegue desde el móvil.
- Pedir que exporten la partida al terminar (Opciones → Exportar partida) y la envíen: permite ver en qué punto se quedaron.

## Durante la sesión (20–30 min)

- No explicar nada: solo "es un juego de gestión, juega como quieras".
- Apuntar:
  - En qué momentos dudan o se quedan parados, y cuánto tiempo.
  - Qué botones pulsan esperando algo que no pasa.
  - Si leen los objetivos de la Oficina y los mensajes.
  - Si entienden por qué ganan o pierden dinero (¿abren el balance mensual?).
  - Si llegan a quebrar y si entienden por qué.

## Preguntas al terminar

1. Del 1 al 5, ¿cuánto te ha gustado? ¿Volverías a jugar?
2. ¿Qué era lo que había que hacer para ganar?
3. ¿Hubo algo que no entendieras o que te pareciera injusto?
4. ¿El ritmo te pareció lento, bien o rápido? ¿Usaste la velocidad 2x/4x?
5. ¿Qué decisión te pareció más interesante? ¿Y la más aburrida?
6. ¿Qué echaste de menos?

## Qué medir

| Métrica                                     | Objetivo              |
| ------------------------------------------- | --------------------- |
| Completa los 3 primeros objetivos sin ayuda | 80 % de los jugadores |
| Lanza su primer producto                    | En menos de 5 minutos |
| Quiebra en la primera partida               | Menos del 30 %        |
| Quiere volver a jugar                       | Más del 60 %          |

## Referencia de balance

`npm run simulate` juega partidas automáticas con varios estilos:

| Estilo           | Resultado esperado                                   |
| ---------------- | ---------------------------------------------------- |
| Jugador sensato  | Gana en 120–220 meses de juego (unos 10–15 min a 1x) |
| Derrochador      | Quiebra                                              |
| Spam de campañas | No acelera la partida                                |

`src/game/balance.test.js` comprueba estos rangos en cada cambio. Si las pruebas con personas dicen que el ritmo no es bueno, se ajustan las constantes de `src/game/rules.js` y se actualizan esos rangos.
