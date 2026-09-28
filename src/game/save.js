import { FOUNDER_ID } from '../data/catalog.js';
import { goals } from './goals.js';
import { SAVE_VERSION } from './initialState.js';

export const STORAGE_KEY = 'code-empire-tycoon-save-v2';
const LEGACY_KEYS = ['code-empire-tycoon-save-v1'];
const EXPORT_FORMAT = 'code-empire-tycoon-save';

const REQUIRED_FIELDS = {
  month: 'number',
  year: 'number',
  level: 'number',
  xp: 'number',
  money: 'number',
  officeLevel: 'number',
  fans: 'number',
  wishlist: 'number',
  staff: 'object',
  ownedAi: 'object',
  projects: 'object',
  messages: 'object',
  activeCampaigns: 'object',
  history: 'object'
};

/** Migraciones entre versiones del guardado: cada una pasa de la versión N a la N+1. */
const migrations = {
  2: (data) => {
    // eslint-disable-next-line no-unused-vars
    const { maxServers, ...rest } = data;
    return {
      ...rest,
      saveVersion: 3,
      staff: [FOUNDER_ID, ...data.staff.filter((id) => id !== FOUNDER_ID)],
      managers: [],
      upgrades: [],
      firedEvents: [],
      // Las partidas antiguas ya han pasado el tutorial: no se regalan gemas al cargar.
      goalsDone: goals.map((goal) => goal.id),
      won: false,
      victorySeen: false,
      introSeen: true,
      equitySold: 0,
      bonusSlots: 0,
      candidateShift: 0
    };
  }
};

export function migrateSave(data) {
  let current = data;
  while (current && typeof current === 'object' && current.saveVersion < SAVE_VERSION && migrations[current.saveVersion]) {
    current = migrations[current.saveVersion](current);
  }
  return current;
}

export function isValidSave(data) {
  if (!data || typeof data !== 'object' || data.saveVersion !== SAVE_VERSION) return false;
  return Object.entries(REQUIRED_FIELDS).every(([key, type]) => typeof data[key] === type && data[key] !== null);
}

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Devuelve `{ game, status }` donde status es 'ok', 'empty', 'outdated' o 'corrupt'. */
export function loadSave() {
  const store = storage();
  if (!store) return { game: null, status: 'empty' };
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = LEGACY_KEYS.some((key) => store.getItem(key));
      return { game: null, status: legacy ? 'outdated' : 'empty' };
    }
    const data = migrateSave(JSON.parse(raw));
    return isValidSave(data) ? { game: data, status: 'ok' } : { game: null, status: 'corrupt' };
  } catch {
    return { game: null, status: 'corrupt' };
  }
}

function serialize(game) {
  // eslint-disable-next-line no-unused-vars
  const { feedback, ...persisted } = game;
  return { ...persisted, savedAt: Date.now() };
}

export function writeSave(game) {
  const store = storage();
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(serialize(game)));
    return true;
  } catch {
    return false;
  }
}

export function clearSave() {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach((key) => store.removeItem(key));
  } catch {
    // Sin acceso al almacenamiento no hay nada que borrar.
  }
}

/** Texto JSON de la partida, para descargarlo como archivo. */
export function exportSave(game) {
  return JSON.stringify({ format: EXPORT_FORMAT, game: serialize(game) }, null, 2);
}

export const exportFileName = (game) => `code-empire-nivel${game.level}-${game.year}-${String(game.month).padStart(2, '0')}.json`;

/** Lee un archivo exportado (o un guardado en bruto). Devuelve `{ game }` o `{ error }`. */
export function importSave(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { error: 'El archivo no es un JSON válido.' };
  }
  const game = migrateSave(data?.format === EXPORT_FORMAT ? data.game : data);
  if (!isValidSave(game)) return { error: 'El archivo no contiene una partida de Code Empire Tycoon compatible.' };
  return { game };
}

export function downloadSave(game) {
  const blob = new Blob([exportSave(game)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportFileName(game);
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
