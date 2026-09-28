import { useEffect, useRef } from 'react';

export const MONTH_MS = 4200;
// Si el navegador se congela o la pestaña vuelve de segundo plano, no se recupera el tiempo perdido de golpe.
const MAX_FRAME_MS = 250;

/**
 * Reloj del juego basado en requestAnimationFrame con acumulador:
 * - Conserva el progreso del mes en curso al pausar, cambiar de velocidad o abrir un diálogo.
 * - Se detiene solo en segundo plano (el navegador no ejecuta requestAnimationFrame en pestañas ocultas).
 * - No re-renderiza React cada frame: la barra de progreso del mes se actualiza con una ref.
 *
 * Devuelve una ref que se asigna al elemento de la barra (su escala X = progreso del mes).
 */
export function useGameClock({ running, speed, onTick }) {
  const barRef = useRef(null);
  const elapsed = useRef(0);
  const state = useRef({ running, speed, onTick });

  useEffect(() => {
    state.current = { running, speed, onTick };
  });

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const loop = (now) => {
      const delta = Math.min(now - last, MAX_FRAME_MS);
      last = now;
      const { running: isRunning, speed: currentSpeed, onTick: tick } = state.current;
      if (isRunning) {
        elapsed.current += delta * currentSpeed;
        if (elapsed.current >= MONTH_MS) {
          elapsed.current -= MONTH_MS;
          tick();
        }
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, elapsed.current / MONTH_MS)})`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  return barRef;
}
