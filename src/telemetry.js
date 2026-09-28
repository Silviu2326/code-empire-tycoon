// Estadísticas anónimas e informes de errores, opcionales y sin cookies.
// Solo se activan si se configuran en el build:
//   VITE_ANALYTICS_ENDPOINT=https://…   eventos de uso (POST JSON)
//   VITE_ERROR_ENDPOINT=https://…       errores de JavaScript (POST JSON)
// Nunca se envía nada si el jugador lo desactiva en Opciones o tiene activado «No rastrear».

const PREF_KEY = 'code-empire-tycoon-telemetry';
const analyticsEndpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
const errorEndpoint = import.meta.env.VITE_ERROR_ENDPOINT;
// Identificador aleatorio solo para esta visita: no se guarda y no permite seguir al jugador entre sesiones.
const session = Math.random().toString(36).slice(2, 10);

export const telemetryConfigured = Boolean(analyticsEndpoint || errorEndpoint);

function doNotTrack() {
  return typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || window.doNotTrack === '1');
}

export function telemetryEnabled() {
  if (!telemetryConfigured || doNotTrack()) return false;
  try {
    return window.localStorage.getItem(PREF_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setTelemetryEnabled(enabled) {
  try {
    window.localStorage.setItem(PREF_KEY, enabled ? 'on' : 'off');
  } catch {
    // Sin almacenamiento no se puede recordar la preferencia.
  }
}

function send(endpoint, payload) {
  if (!endpoint || !telemetryEnabled()) return;
  const body = JSON.stringify({ ...payload, session, version: __APP_VERSION__, at: new Date().toISOString() });
  try {
    if (navigator.sendBeacon?.(endpoint, new Blob([body], { type: 'application/json' }))) return;
    fetch(endpoint, { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  } catch {
    // La telemetría nunca debe romper el juego.
  }
}

export function track(event, props = {}) {
  send(analyticsEndpoint, { type: 'event', event, props });
}

export function reportError(error, context = {}) {
  send(errorEndpoint, {
    type: 'error',
    message: String(error?.message || error).slice(0, 500),
    stack: String(error?.stack || '').slice(0, 4000),
    path: window.location.pathname,
    ...context
  });
}

let installed = false;
export function installErrorHandlers() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (event) => reportError(event.error || event.message, { source: 'window.error' }));
  window.addEventListener('unhandledrejection', (event) => reportError(event.reason, { source: 'unhandledrejection' }));
}

/** Eventos de juego que interesan para el embudo: se derivan de los cambios de estado. */
export function gameEvents(previous, game) {
  if (!previous || previous === game) return [];
  const events = [];
  const launched = (g) => g.projects.filter((project) => project.status === 'completed').length;
  if (game.level > previous.level) events.push(['level_up', { level: game.level }]);
  for (const goal of (game.goalsDone || []).filter((id) => !(previous.goalsDone || []).includes(id))) {
    events.push(['goal_completed', { goal, month: game.elapsed }]);
  }
  if (launched(game) > launched(previous)) events.push(['product_launched', { total: launched(game), month: game.elapsed }]);
  if (game.gameOver && !previous.gameOver) events.push(['bankruptcy', { level: game.level, month: game.elapsed }]);
  if (game.won && !previous.won) events.push(['victory', { month: game.elapsed }]);
  return events;
}
