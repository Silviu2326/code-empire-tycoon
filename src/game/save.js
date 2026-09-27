import { SAVE_VERSION } from './initialState.js';

export const STORAGE_KEY = 'code-empire-tycoon-save-v2';
const LEGACY_KEYS = ['code-empire-tycoon-save-v1'];

const REQUIRED_FIELDS = {
  month: 'number',
  year: 'number',
  level: 'number',
  xp: 'number',
  money: 'number',
  officeLevel: 'number',
  maxServers: 'number',
  fans: 'number',
  wishlist: 'number',
  staff: 'object',
  ownedAi: 'object',
  projects: 'object',
  messages: 'object',
  activeCampaigns: 'object',
  history: 'object'
};

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
    const data = JSON.parse(raw);
    return isValidSave(data) ? { game: data, status: 'ok' } : { game: null, status: 'corrupt' };
  } catch {
    return { game: null, status: 'corrupt' };
  }
}

export function writeSave(game) {
  const store = storage();
  if (!store) return false;
  // eslint-disable-next-line no-unused-vars
  const { feedback, ...persisted } = game;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(persisted));
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
