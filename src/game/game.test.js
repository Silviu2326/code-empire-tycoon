import { describe, expect, it } from 'vitest';
import { aiTools, candidates, findById } from '../data/catalog.js';
import { addMonths, currency, relativeTime } from './format.js';
import { createInitialGame } from './initialState.js';
import { gameReducer } from './reducer.js';
import {
  BANKRUPTCY_MONTHS,
  availableCandidates,
  computeEconomy,
  draftProblems,
  freeServers,
  projectFromDraft,
  staffCapacity,
  upgradeCost,
  xpToNext
} from './rules.js';
import { isValidSave } from './save.js';
import { advanceMonth } from './tick.js';

const run = (state, ...actions) => actions.reduce(gameReducer, state);
const project = (game, id) => game.projects.find((item) => item.id === id);
const draft = (overrides = {}) => ({
  name: 'Test Game',
  genre: 'RPG',
  style: 'Pixel Art',
  size: 'Pequeño',
  techs: [],
  ...overrides
});

describe('formato y fechas', () => {
  it('pasa de diciembre a enero del año siguiente', () => {
    expect(addMonths({ month: 12, year: 2025 }, 1)).toEqual({ month: 1, year: 2026 });
    const game = advanceMonth({ ...createInitialGame(), month: 12, year: 2025 });
    expect(game.month).toBe(1);
    expect(game.year).toBe(2026);
  });

  it('formatea moneda negativa y fechas relativas', () => {
    expect(currency(-1500)).toMatch(/^-\$1.?500$/);
    expect(relativeTime({ month: 5, year: 2025 }, { month: 5, year: 2025 })).toBe('Este mes');
    expect(relativeTime({ month: 4, year: 2025 }, { month: 5, year: 2025 })).toBe('Hace 1 mes');
  });
});

describe('economía mensual', () => {
  it('cobra salarios e IA una sola vez al mes y los resta del dinero', () => {
    const game = createInitialGame();
    const economy = computeEconomy(game);
    const next = advanceMonth(game);
    expect(next.money).toBe(game.money + economy.net);
    expect(economy.salaries).toBe(3200 + 2800);
    expect(economy.aiCost).toBe(20 + 30);
  });

  it('contratar no cobra por adelantado; el salario llega con el mes', () => {
    const game = createInitialGame();
    const hired = run(game, { type: 'HIRE', staffId: availableCandidates(game)[0].id });
    expect(hired.money).toBe(game.money);
    expect(hired.staff).toHaveLength(3);
  });

  it('la IA cobra el alta mostrada y después la cuota mensual', () => {
    const game = createInitialGame();
    const tool = findById(aiTools, 'claude');
    const bought = run(game, { type: 'BUY_AI', toolId: 'claude' });
    expect(bought.money).toBe(game.money - tool.setup);
    expect(computeEconomy(bought).aiCost).toBe(computeEconomy(game).aiCost + tool.price);
  });

  it('mejorar la oficina tiene coste creciente y da servidores y plazas', () => {
    const game = { ...createInitialGame(), money: 100000 };
    const upgraded = run(game, { type: 'UPGRADE_OFFICE' });
    expect(upgraded.money).toBe(100000 - upgradeCost(1));
    expect(upgraded.maxServers).toBe(game.maxServers + 1);
    expect(staffCapacity(upgraded.officeLevel)).toBe(staffCapacity(1) + 2);
    expect(upgradeCost(2)).toBeGreaterThan(upgradeCost(1));
  });

  it('no mejora la oficina sin dinero ni por encima del máximo', () => {
    const poor = run({ ...createInitialGame(), money: 10 }, { type: 'UPGRADE_OFFICE' });
    expect(poor.officeLevel).toBe(1);
    expect(poor.feedback.tone).toBe('red');
    const maxed = run({ ...createInitialGame(), money: 1e7, officeLevel: 5 }, { type: 'UPGRADE_OFFICE' });
    expect(maxed.officeLevel).toBe(5);
  });
});

describe('proyectos', () => {
  it('valida dinero, servidores y nombre dentro de la acción', () => {
    const game = createInitialGame();
    expect(draftProblems(draft({ name: 'ab' }), game)).toHaveLength(1);
    const broke = run({ ...game, money: 0 }, { type: 'CREATE_PROJECT', draft: draft() });
    expect(broke.projects).toHaveLength(game.projects.length);
    const noServers = { ...game, maxServers: 2 };
    expect(freeServers(noServers)).toBe(0);
    expect(run(noServers, { type: 'CREATE_PROJECT', draft: draft() }).projects).toHaveLength(game.projects.length);
  });

  it('crea el proyecto con los números del formulario y cobra su coste', () => {
    const game = createInitialGame();
    const expected = projectFromDraft(draft({ techs: ['unity', 'multiplayer'] }));
    const next = run(game, { type: 'CREATE_PROJECT', draft: draft({ techs: ['unity', 'multiplayer'] }) });
    const created = project(next, `p${game.nextId}`);
    expect(created.cost).toBe(expected.cost);
    expect(created.speedBonus).toBeCloseTo(0.1);
    expect(next.money).toBe(game.money - expected.cost);
    expect(freeServers(next)).toBe(freeServers(game) - 1);
  });

  it('desarrollar una idea la sustituye por el proyecto nuevo', () => {
    const game = createInitialGame();
    const next = run(game, {
      type: 'CREATE_PROJECT',
      ideaId: 'p3',
      draft: { name: 'Cyber Streets', genre: 'Acción', style: '3D', size: 'Pequeño', techs: [] }
    });
    expect(project(next, 'p3')).toBeUndefined();
    expect(next.projects.filter((item) => item.name === 'Cyber Streets')).toHaveLength(1);
  });

  it('al completarse libera el servidor, paga el lanzamiento y deja ventas mensuales decrecientes', () => {
    let game = createInitialGame();
    game = { ...game, projects: game.projects.map((item) => (item.id === 'p1' ? { ...item, progress: 99.5 } : item)) };
    const before = freeServers(game);
    const launched = advanceMonth(game);
    const p1 = project(launched, 'p1');
    expect(p1.status).toBe('completed');
    expect(freeServers(launched)).toBe(before + 1);
    expect(p1.launchRevenue).toBeGreaterThan(0);
    expect(p1.monthlySales).toBeGreaterThan(0);
    expect(launched.money).toBe(game.money + computeEconomy(game).net + p1.launchRevenue);

    const later = advanceMonth(launched);
    expect(project(later, 'p1').monthlySales).toBeLessThan(p1.monthlySales);
    expect(computeEconomy(launched).productIncome).toBe(p1.monthlySales);
  });

  it('cancelar devuelve parte de lo invertido y libera equipo y servidor', () => {
    const game = createInitialGame();
    const next = run(game, { type: 'CANCEL_PROJECT', projectId: 'p1' });
    expect(project(next, 'p1').status).toBe('cancelled');
    expect(project(next, 'p1').team).toEqual([]);
    expect(next.money).toBe(game.money + Math.round(2400 * 0.3));
    expect(freeServers(next)).toBe(freeServers(game) + 1);
  });

  it('cada empleado trabaja en un solo proyecto', () => {
    const game = createInitialGame();
    const next = run(game, { type: 'TOGGLE_STAFF_ON_PROJECT', projectId: 'p2', staffId: 'alice' });
    expect(project(next, 'p2').team).toContain('alice');
    expect(project(next, 'p1').team).not.toContain('alice');
  });

  it('despedir quita al empleado de su proyecto', () => {
    const next = run(createInitialGame(), { type: 'FIRE', staffId: 'alice' });
    expect(next.staff).not.toContain('alice');
    expect(project(next, 'p1').team).not.toContain('alice');
  });
});

describe('personal', () => {
  it('respeta el límite de plazas', () => {
    let game = { ...createInitialGame(), money: 1e6 };
    for (const person of candidates) game = run(game, { type: 'HIRE', staffId: person.id });
    expect(game.staff).toHaveLength(staffCapacity(1));
  });

  it('rota los candidatos disponibles con el tiempo', () => {
    const game = createInitialGame();
    const now = availableCandidates(game).map((person) => person.id);
    const later = availableCandidates({ ...game, elapsed: 3 }).map((person) => person.id);
    expect(now).not.toEqual(later);
    expect(now.some((id) => game.staff.includes(id))).toBe(false);
  });
});

describe('progresión', () => {
  it('puede subir varios niveles en un mes sin perder la experiencia sobrante', () => {
    const game = { ...createInitialGame(), level: 1, xp: xpToNext(1) + xpToNext(2) + 5 };
    const next = advanceMonth(game);
    expect(next.level).toBe(3);
    expect(next.xp).toBeGreaterThan(5);
    expect(next.gems).toBe(game.gems + 150);
  });

  it('las campañas duran varios meses y rinden menos al repetirlas', () => {
    let game = { ...createInitialGame(), money: 1e6 };
    game = run(game, { type: 'START_CAMPAIGN', campaignId: 'youtube' });
    expect(run(game, { type: 'START_CAMPAIGN', campaignId: 'youtube' }).feedback.tone).toBe('red');
    for (let i = 0; i < 3; i += 1) game = advanceMonth(game);
    expect(game.activeCampaigns).toHaveLength(0);
    game = run(game, { type: 'START_CAMPAIGN', campaignId: 'youtube' });
    expect(game.activeCampaigns[0].effectiveness).toBeLessThan(1);
  });
});

describe('bancarrota', () => {
  it('permite saldo negativo y termina la partida tras varios meses en rojo', () => {
    let game = { ...createInitialGame(), money: -1, projects: [] };
    for (let i = 0; i < BANKRUPTCY_MONTHS; i += 1) game = advanceMonth(game);
    expect(game.money).toBeLessThan(0);
    expect(game.gameOver).toBe(true);
    expect(advanceMonth(game)).toBe(game);
  });

  it('salir de números rojos reinicia el contador', () => {
    const game = advanceMonth({ ...createInitialGame(), money: 1e6, debtMonths: 2 });
    expect(game.debtMonths).toBe(0);
  });
});

describe('guardado', () => {
  it('acepta una partida válida y rechaza datos corruptos o antiguos', () => {
    expect(isValidSave(createInitialGame())).toBe(true);
    expect(isValidSave({ ...createInitialGame(), saveVersion: 1 })).toBe(false);
    expect(isValidSave({ money: 'mucho' })).toBe(false);
    expect(isValidSave(null)).toBe(false);
  });
});
