import { describe, expect, it } from 'vitest';
import { FOUNDER_ID } from '../data/catalog.js';
import { pendingActions } from './advice.js';
import { createInitialGame } from './initialState.js';
import { gameReducer } from './reducer.js';
import { advanceMonth } from './tick.js';

const run = (state, ...actions) => actions.reduce(gameReducer, state);
const start = () => ({ ...createInitialGame(), introSeen: true });
const ids = (game) => pendingActions(game).map((action) => action.id);
const draft = { name: 'Code Quest', genre: 'RPG', style: 'Pixel Art', size: 'Pequeño', techs: [] };

describe('tareas pendientes', () => {
  it('al empezar propone desarrollar la idea inicial', () => {
    const [first] = pendingActions(start());
    expect(first.id).toBe('idea');
    expect(first.tab).toBe('create');
    expect(first.extra.ideaId).toBe('p1');
  });

  it('avisa del equipo parado y de la IA que se paga sin usar', () => {
    let game = run({ ...start(), money: 1e6 }, { type: 'CREATE_PROJECT', ideaId: 'p1', draft });
    game = run(game, { type: 'TOGGLE_STAFF_ON_PROJECT', projectId: game.projects[0].id, staffId: FOUNDER_ID });
    expect(ids(game)).toContain('idle-staff');
    game = run(game, { type: 'BUY_AI', toolId: 'copilot' });
    expect(ids(game)).toContain('unused-ai');
  });

  it('prioriza los números rojos y las decisiones', () => {
    const game = {
      ...start(),
      money: -100,
      debtMonths: 1,
      messages: [{ id: 'x', eventId: 'investor', from: 'Inversor', subject: '', body: '', month: 5, year: 2025 }]
    };
    expect(ids(game).slice(0, 2)).toEqual(['debt', 'decisions']);
  });
});

describe('avance del mes', () => {
  it('avisa al lanzar un producto sin pausar', () => {
    let game = run({ ...start(), money: 1e6 }, { type: 'CREATE_PROJECT', ideaId: 'p1', draft });
    game = { ...game, projects: game.projects.map((project) => ({ ...project, progress: 99.9 })) };
    const next = advanceMonth(game);
    expect(next.feedback.text).toMatch(/Code Quest a la venta/);
    expect(next.feedback.paused).toBe(false);
    expect(next.paused).toBe(false);
  });

  it('pausa al entrar en números rojos, salvo que se desactive', () => {
    const game = { ...start(), money: -1e6 };
    const next = advanceMonth(game);
    expect(next.paused).toBe(true);
    expect(next.feedback.tone).toBe('red');
    expect(advanceMonth({ ...game, autoPause: false }).paused).toBe(false);
  });

  it('pausa cuando llega un evento con decisión', () => {
    let game = run({ ...start(), money: 1e6, level: 4 }, { type: 'CREATE_PROJECT', ideaId: 'p1', draft });
    game = { ...game, projects: game.projects.map((project) => ({ ...project, progress: 99.9 })) };
    game = advanceMonth(advanceMonth(game));
    expect(game.messages.some((message) => message.eventId === 'investor')).toBe(true);
    expect(game.paused).toBe(true);
    expect(game.feedback.text).toMatch(/Decisión pendiente/);
  });

  it('los avisos de meses distintos no se confunden entre sí', () => {
    const first = advanceMonth({ ...start(), money: -1e6, autoPause: false });
    const second = advanceMonth(first);
    expect(second.feedback.seq).not.toBe(first.feedback.seq);
  });
});
