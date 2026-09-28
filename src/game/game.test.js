import { describe, expect, it } from 'vitest';
import { FOUNDER_ID, VICTORY_LEVEL, aiTools, candidates, findById } from '../data/catalog.js';
import { empireEvents } from './events.js';
import { addMonths, currency, relativeTime } from './format.js';
import { goals } from './goals.js';
import { SAVE_VERSION, createInitialGame } from './initialState.js';
import { gameReducer } from './reducer.js';
import {
  BANKRUPTCY_MONTHS,
  SPRINT_GEMS,
  availableCandidates,
  computeEconomy,
  draftProblems,
  freeServers,
  hiredStaff,
  monthlyGain,
  projectFromDraft,
  serverCapacity,
  staffCapacity,
  upgradeCost,
  xpToNext
} from './rules.js';
import { exportSave, importSave, isValidSave, migrateSave } from './save.js';
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
const rich = (overrides = {}) => ({ ...createInitialGame(), money: 1e6, introSeen: true, ...overrides });

/** Partida con un proyecto en desarrollo (p100) y dos empleados contratados. */
function studio(overrides = {}) {
  let game = rich(overrides);
  game = run(game, { type: 'CREATE_PROJECT', draft: draft(), ideaId: 'p1' });
  for (const person of availableCandidates(game).slice(0, 2)) game = run(game, { type: 'HIRE', staffId: person.id });
  return { ...game, feedback: undefined };
}

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

describe('partida inicial', () => {
  it('empieza como coder de habitación: nivel 1, solo el fundador y una idea', () => {
    const game = createInitialGame();
    expect(game.level).toBe(1);
    expect(game.staff).toEqual([FOUNDER_ID]);
    expect(hiredStaff(game)).toHaveLength(0);
    expect(game.projects.map((item) => item.status)).toEqual(['idea']);
    expect(computeEconomy(game).net).toBeGreaterThan(0);
  });

  it('el fundador no se puede despedir y trabaja en los proyectos', () => {
    const game = run(rich(), { type: 'FIRE', staffId: FOUNDER_ID });
    expect(game.staff).toContain(FOUNDER_ID);
    const next = run(game, { type: 'CREATE_PROJECT', draft: draft() });
    expect(project(next, `p${game.nextId}`).team).toContain(FOUNDER_ID);
  });
});

describe('economía mensual', () => {
  it('cobra salarios e IA una sola vez al mes y los resta del dinero', () => {
    const game = studio();
    const economy = computeEconomy(game);
    const next = advanceMonth(game);
    expect(next.money).toBe(game.money + economy.net);
    expect(economy.salaries).toBe(staffMemberSalaries(game));
  });

  it('contratar no cobra por adelantado; el salario llega con el mes', () => {
    const game = rich();
    const hired = run(game, { type: 'HIRE', staffId: availableCandidates(game)[0].id });
    expect(hired.money).toBe(game.money);
    expect(hiredStaff(hired)).toHaveLength(1);
  });

  it('la IA cobra el alta mostrada y después la cuota mensual', () => {
    const game = rich();
    const tool = findById(aiTools, 'claude');
    const bought = run(game, { type: 'BUY_AI', toolId: 'claude' });
    expect(bought.money).toBe(game.money - tool.setup);
    expect(computeEconomy(bought).aiCost).toBe(computeEconomy(game).aiCost + tool.price);
  });

  it('mejorar la oficina tiene coste creciente y da servidores y plazas', () => {
    const game = rich({ money: 100000 });
    const upgraded = run(game, { type: 'UPGRADE_OFFICE' });
    expect(upgraded.money).toBe(100000 - upgradeCost(1));
    expect(serverCapacity(upgraded)).toBe(serverCapacity(game) + 1);
    expect(staffCapacity(upgraded)).toBe(staffCapacity(game) + 1);
    expect(upgradeCost(2)).toBeGreaterThan(upgradeCost(1));
  });

  it('no mejora la oficina sin dinero ni por encima del máximo', () => {
    const poor = run(rich({ money: 10 }), { type: 'UPGRADE_OFFICE' });
    expect(poor.officeLevel).toBe(1);
    expect(poor.feedback.tone).toBe('red');
    const maxed = run(rich({ officeLevel: 5 }), { type: 'UPGRADE_OFFICE' });
    expect(maxed.officeLevel).toBe(5);
  });
});

function staffMemberSalaries(game) {
  return game.staff.reduce((sum, id) => sum + findById(candidates, id).salary, 0);
}

describe('proyectos', () => {
  it('valida dinero, servidores, tamaño y nombre dentro de la acción', () => {
    const game = rich();
    expect(draftProblems(draft({ name: 'ab' }), game)).toHaveLength(1);
    expect(draftProblems(draft({ size: 'AAA' }), game)[0]).toMatch(/AAA/);
    const broke = run({ ...game, money: 0 }, { type: 'CREATE_PROJECT', draft: draft() });
    expect(broke.projects).toHaveLength(game.projects.length);
    let full = game;
    while (freeServers(full) > 0) full = run(full, { type: 'CREATE_PROJECT', draft: draft() });
    expect(run(full, { type: 'CREATE_PROJECT', draft: draft() }).projects).toHaveLength(full.projects.length);
  });

  it('crea el proyecto con los números del formulario y cobra su coste', () => {
    const game = rich();
    const chosen = draft({ techs: ['unity', 'multiplayer'] });
    const expected = projectFromDraft(chosen, game);
    const next = run(game, { type: 'CREATE_PROJECT', draft: chosen });
    const created = project(next, `p${game.nextId}`);
    expect(created.cost).toBe(expected.cost);
    expect(created.speedBonus).toBeCloseTo(0.1);
    expect(next.money).toBe(game.money - expected.cost);
    expect(freeServers(next)).toBe(freeServers(game) - 1);
  });

  it('desarrollar una idea la sustituye por el proyecto nuevo', () => {
    const next = run(rich(), { type: 'CREATE_PROJECT', ideaId: 'p1', draft: draft({ name: 'Code Quest' }) });
    expect(project(next, 'p1')).toBeUndefined();
    expect(next.projects.filter((item) => item.name === 'Code Quest')).toHaveLength(1);
  });

  it('al completarse libera el servidor, paga el lanzamiento y deja ventas mensuales decrecientes', () => {
    let game = studio();
    game = { ...game, projects: game.projects.map((item) => (item.status === 'dev' ? { ...item, progress: 99.5 } : item)) };
    const id = game.projects.find((item) => item.status === 'dev').id;
    const before = freeServers(game);
    const launched = advanceMonth(game);
    const done = project(launched, id);
    expect(done.status).toBe('completed');
    expect(freeServers(launched)).toBe(before + 1);
    expect(done.launchRevenue).toBeGreaterThan(0);
    expect(done.monthlySales).toBeGreaterThan(0);

    const later = advanceMonth(launched);
    expect(project(later, id).monthlySales).toBeLessThan(done.monthlySales);
    expect(computeEconomy(launched).productIncome).toBe(done.monthlySales);
  });

  it('cancelar devuelve parte de lo invertido y libera equipo y servidor', () => {
    const game = studio();
    const id = game.projects[0].id;
    const next = run(game, { type: 'CANCEL_PROJECT', projectId: id });
    expect(project(next, id).status).toBe('cancelled');
    expect(project(next, id).team).toEqual([]);
    expect(next.money).toBe(game.money + Math.round(project(game, id).spent * 0.3));
    expect(freeServers(next)).toBe(freeServers(game) + 1);
  });

  it('cada empleado trabaja en un solo proyecto', () => {
    let game = run(studio(), { type: 'CREATE_PROJECT', draft: draft({ name: 'Segundo' }) });
    const [second, first] = game.projects;
    game = run(game, { type: 'TOGGLE_STAFF_ON_PROJECT', projectId: second.id, staffId: FOUNDER_ID });
    expect(project(game, second.id).team).toContain(FOUNDER_ID);
    expect(project(game, first.id).team).not.toContain(FOUNDER_ID);
  });

  it('despedir quita al empleado de su proyecto', () => {
    const game = studio();
    const staffId = hiredStaff(game)[0];
    const withTeam = run(game, { type: 'TOGGLE_STAFF_ON_PROJECT', projectId: game.projects[0].id, staffId });
    const next = run(withTeam, { type: 'FIRE', staffId });
    expect(next.staff).not.toContain(staffId);
    expect(next.projects[0].team).not.toContain(staffId);
  });
});

describe('personal', () => {
  it('respeta el límite de plazas', () => {
    let game = rich();
    for (let i = 0; i < 10; i += 1) {
      const person = availableCandidates(game)[0];
      if (!person) break;
      game = run(game, { type: 'HIRE', staffId: person.id });
    }
    expect(hiredStaff(game)).toHaveLength(staffCapacity(game));
  });

  it('solo ofrece talento de la etapa actual y rota con el tiempo', () => {
    const game = rich();
    expect(availableCandidates(game).every((person) => person.tier === 1)).toBe(true);
    expect(availableCandidates({ ...game, level: 10 }).some((person) => person.tier === 3)).toBe(true);
    const base = availableCandidates({ ...game, level: 10 }).map((person) => person.id);
    const later = availableCandidates({ ...game, level: 10, elapsed: 3 }).map((person) => person.id);
    expect(base).not.toEqual(later);
  });
});

describe('progresión', () => {
  it('puede subir varios niveles en un mes sin perder la experiencia sobrante', () => {
    const game = { ...createInitialGame(), level: 1, xp: xpToNext(1) + xpToNext(2) + 5 };
    const next = advanceMonth(game);
    expect(next.level).toBe(3);
    expect(next.xp).toBeGreaterThan(5);
    expect(next.gems).toBeGreaterThanOrEqual(game.gems + 150);
    expect(next.messages.some((message) => message.subject.startsWith('Nueva etapa'))).toBe(true);
  });

  it('las campañas duran varios meses y rinden menos al repetirlas', () => {
    let game = rich();
    game = run(game, { type: 'START_CAMPAIGN', campaignId: 'youtube' });
    expect(run(game, { type: 'START_CAMPAIGN', campaignId: 'youtube' }).feedback.tone).toBe('red');
    for (let i = 0; i < 3; i += 1) game = advanceMonth(game);
    expect(game.activeCampaigns).toHaveLength(0);
    game = run(game, { type: 'START_CAMPAIGN', campaignId: 'youtube' });
    expect(game.activeCampaigns[0].effectiveness).toBeLessThan(1);
  });

  it('gana la partida al llegar al nivel de victoria, una sola vez', () => {
    const game = advanceMonth({ ...rich(), level: VICTORY_LEVEL - 1, xp: xpToNext(VICTORY_LEVEL - 1) });
    expect(game.won).toBe(true);
    const later = advanceMonth(run(game, { type: 'DISMISS_VICTORY' }));
    expect(later.victorySeen).toBe(true);
  });
});

describe('objetivos', () => {
  it('se cumplen al hacer la acción y dan gemas una sola vez', () => {
    const game = rich();
    const next = run(game, { type: 'CREATE_PROJECT', draft: draft(), ideaId: 'p1' });
    const goal = goals.find((item) => item.id === 'firstProject');
    expect(next.goalsDone).toContain('firstProject');
    expect(next.gems).toBe(game.gems + goal.gems);
    const again = run(next, { type: 'CREATE_PROJECT', draft: draft({ name: 'Otro' }) });
    expect(again.gems).toBe(next.gems);
  });
});

describe('gemas', () => {
  it('el sprint cuesta gemas y adelanta el proyecto sin completarlo', () => {
    const game = studio({ gems: 500 });
    const id = game.projects[0].id;
    const next = run(game, { type: 'SPRINT', projectId: id });
    expect(next.gems).toBe(game.gems - SPRINT_GEMS);
    expect(project(next, id).progress).toBeGreaterThan(project(game, id).progress);
    const nearlyDone = { ...game, projects: game.projects.map((item) => ({ ...item, progress: 95 })) };
    expect(project(run(nearlyDone, { type: 'SPRINT', projectId: id }), id).progress).toBeLessThan(100);
  });

  it('buscar talento cambia los candidatos', () => {
    const game = rich({ level: 10, gems: 500 });
    const next = run(game, { type: 'SCOUT_CANDIDATES' });
    expect(availableCandidates(next).map((p) => p.id)).not.toEqual(availableCandidates(game).map((p) => p.id));
  });
});

describe('imperio', () => {
  it('los managers se desbloquean por etapa, cobran y aplican su bonus', () => {
    const early = run(rich(), { type: 'HIRE_MANAGER', managerId: 'cto' });
    expect(early.managers).toEqual([]);
    const game = studio({ level: 6 });
    const withCto = run(game, { type: 'HIRE_MANAGER', managerId: 'cto' });
    expect(withCto.managers).toContain('cto');
    expect(computeEconomy(withCto).managerCost).toBe(6000);
    const id = game.projects[0].id;
    expect(monthlyGain(project(withCto, id), withCto).progress).toBeGreaterThan(monthlyGain(project(game, id), game).progress);
  });

  it('las mejoras se compran una vez y tienen efecto', () => {
    const game = rich({ level: 6 });
    const next = run(game, { type: 'BUY_UPGRADE', upgradeId: 'datacenter' });
    expect(next.money).toBe(game.money - 30000);
    expect(serverCapacity(next)).toBe(serverCapacity(game) + 2);
    expect(run(next, { type: 'BUY_UPGRADE', upgradeId: 'datacenter' }).money).toBe(next.money);
  });

  it('los eventos llegan como mensajes con decisiones y se resuelven una vez', () => {
    let game = studio({ level: 4 });
    game = { ...game, projects: game.projects.map((item) => ({ ...item, progress: 99.5 })) };
    game = advanceMonth(game);
    game = advanceMonth(game);
    const message = game.messages.find((item) => item.eventId === 'investor');
    expect(message).toBeDefined();
    const accepted = run(game, { type: 'RESOLVE_EVENT', messageId: message.id, choiceIndex: 0 });
    expect(accepted.money).toBe(game.money + 60000);
    expect(accepted.equitySold).toBeCloseTo(0.15);
    expect(run(accepted, { type: 'RESOLVE_EVENT', messageId: message.id, choiceIndex: 0 }).money).toBe(accepted.money);
    expect(empireEvents.map((event) => event.id)).toContain('investor');
  });

  it('la participación vendida reduce las ventas que cobras', () => {
    const game = { ...studio(), projects: [{ ...createInitialGame().projects[0], status: 'completed', monthlySales: 1000 }] };
    expect(computeEconomy({ ...game, equitySold: 0.15 }).productIncome).toBe(850);
  });
});

describe('bancarrota', () => {
  it('permite saldo negativo y termina la partida tras varios meses en rojo', () => {
    let game = { ...studio(), money: -1e6 };
    for (let i = 0; i < BANKRUPTCY_MONTHS; i += 1) game = advanceMonth(game);
    expect(game.money).toBeLessThan(0);
    expect(game.gameOver).toBe(true);
    expect(advanceMonth(game)).toBe(game);
  });

  it('salir de números rojos reinicia el contador', () => {
    const game = advanceMonth({ ...rich(), debtMonths: 2 });
    expect(game.debtMonths).toBe(0);
  });
});

describe('guardado', () => {
  it('acepta una partida válida y rechaza datos corruptos', () => {
    expect(isValidSave(createInitialGame())).toBe(true);
    expect(isValidSave({ money: 'mucho' })).toBe(false);
    expect(isValidSave(null)).toBe(false);
  });

  it('migra partidas de la versión 2', () => {
    // eslint-disable-next-line no-unused-vars
    const { managers, upgrades, firedEvents, goalsDone, ...v3 } = createInitialGame();
    const v2 = { ...v3, saveVersion: 2, maxServers: 3, staff: ['alice'] };
    const migrated = migrateSave(v2);
    expect(migrated.saveVersion).toBe(SAVE_VERSION);
    expect(isValidSave(migrated)).toBe(true);
    expect(migrated.staff).toEqual([FOUNDER_ID, 'alice']);
    expect(migrated.maxServers).toBeUndefined();
    expect(migrated.goalsDone).toHaveLength(goals.length);
  });
});

describe('exportar e importar', () => {
  it('una partida exportada se importa igual', () => {
    const game = { ...createInitialGame(), level: 7, money: 1234 };
    const { game: imported, error } = importSave(exportSave(game));
    expect(error).toBeUndefined();
    expect(imported.level).toBe(7);
    expect(imported.money).toBe(1234);
    expect(imported.savedAt).toBeTypeOf('number');
  });

  it('acepta guardados en bruto de versiones anteriores y los migra', () => {
    // eslint-disable-next-line no-unused-vars
    const { managers, upgrades, ...rest } = createInitialGame();
    const { game } = importSave(JSON.stringify({ ...rest, saveVersion: 2, maxServers: 3 }));
    expect(game.saveVersion).toBe(SAVE_VERSION);
  });

  it('rechaza archivos que no son partidas', () => {
    expect(importSave('no es json').error).toMatch(/JSON/);
    expect(importSave('{"hola": 1}').error).toMatch(/compatible/);
  });
});
