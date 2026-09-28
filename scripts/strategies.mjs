// Estilos de juego automáticos para simular partidas y vigilar el balance.
// Los usan scripts/simulate.mjs y src/game/balance.test.js.
import { aiTools, managers, sizes, upgrades } from '../src/data/catalog.js';
import { createInitialGame } from '../src/game/initialState.js';
import { gameReducer } from '../src/game/reducer.js';
import {
  availableCandidates,
  computeEconomy,
  currentStage,
  freeServers,
  hiredStaff,
  staffCapacity,
  upgradeCost
} from '../src/game/rules.js';

const MAX_MONTHS = 400;
const act = (game, action) => gameReducer(game, action);
export const launchedCount = (game) => game.projects.filter((project) => project.status === 'completed').length;

function assignIdleStaff(game) {
  const dev = game.projects.filter((project) => project.status === 'dev');
  if (dev.length === 0) return game;
  for (const staffId of game.staff) {
    const current = game.projects.filter((project) => project.status === 'dev');
    if (current.some((project) => project.team.includes(staffId))) continue;
    const target = current.reduce((a, b) => (a.team.length <= b.team.length ? a : b));
    game = act(game, { type: 'TOGGLE_STAFF_ON_PROJECT', projectId: target.id, staffId });
  }
  for (const project of game.projects.filter((item) => item.status === 'dev')) {
    for (const toolId of game.ownedAi) {
      if (!project.ai.includes(toolId)) game = act(game, { type: 'TOGGLE_AI_ON_PROJECT', projectId: project.id, toolId });
    }
  }
  return game;
}

let projectCount = 0;
function createProject(game, size, genre = 'RPG') {
  projectCount += 1;
  return act(game, {
    type: 'CREATE_PROJECT',
    draft: { name: `Juego ${projectCount}`, genre, style: 'Pixel Art', size, techs: ['unity', 'csharp', 'ai'] }
  });
}

export const strategies = {
  // Juega con cabeza: contrata si el balance lo aguanta, crea proyectos cuando hay colchón, invierte al sobrar.
  sensato(game) {
    const economy = computeEconomy(game);
    const candidate = [...availableCandidates(game)].sort((a, b) => b.code + b.art - (a.code + a.art))[0];
    if (candidate && hiredStaff(game).length < staffCapacity(game) && economy.net - candidate.salary > 0 && game.money > 12000) {
      game = act(game, { type: 'HIRE', staffId: candidate.id });
    }
    for (const tool of aiTools) {
      if (!game.ownedAi.includes(tool.id) && game.money > tool.setup * 5) game = act(game, { type: 'BUY_AI', toolId: tool.id });
    }
    const size = currentStage(game).maxSize;
    const cost = sizes.find((item) => item.id === size).cost;
    if (freeServers(game) > 0 && game.money > cost * 3)
      game = createProject(game, size, ['RPG', 'Acción', 'Estrategia'][projectCount % 3]);
    if (game.officeLevel < 5 && game.money > upgradeCost(game.officeLevel) * 2) game = act(game, { type: 'UPGRADE_OFFICE' });
    for (const upgrade of upgrades) {
      if (!game.upgrades.includes(upgrade.id) && game.money > upgrade.cost * 2)
        game = act(game, { type: 'BUY_UPGRADE', upgradeId: upgrade.id });
    }
    for (const manager of managers) {
      if (!game.managers.includes(manager.id) && computeEconomy(game).net > manager.salary * 1.5) {
        game = act(game, { type: 'HIRE_MANAGER', managerId: manager.id });
      }
    }
    if (game.money > 20000 && game.activeCampaigns.length === 0)
      game = act(game, { type: 'START_CAMPAIGN', campaignId: 'youtube' });
    for (const message of game.messages) {
      if (message.eventId && message.choice === undefined)
        game = act(game, { type: 'RESOLVE_EVENT', messageId: message.id, choiceIndex: 0 });
    }
    return assignIdleStaff(game);
  },

  // Pocos proyectos a la vez, con todo el equipo: busca calidad alta.
  calidad(game) {
    const busy = game.projects.filter((project) => project.status === 'dev').length;
    const limited = { ...game, maxDev: 1 + Math.floor(hiredStaff(game).length / 3) };
    if (busy >= limited.maxDev) {
      const economy = computeEconomy(game);
      const candidate = [...availableCandidates(game)].sort((a, b) => b.code + b.art - (a.code + a.art))[0];
      if (
        candidate &&
        hiredStaff(game).length < staffCapacity(game) &&
        economy.net - candidate.salary > 0 &&
        game.money > 12000
      ) {
        game = act(game, { type: 'HIRE', staffId: candidate.id });
      }
      for (const message of game.messages) {
        if (message.eventId && message.choice === undefined)
          game = act(game, { type: 'RESOLVE_EVENT', messageId: message.id, choiceIndex: 0 });
      }
      return assignIdleStaff(game);
    }
    return strategies.sensato(game);
  },

  // Gasta sin mirar: contrata a todo el mundo, siempre el proyecto más grande, todos los managers.
  derrochador(game) {
    for (const person of availableCandidates(game)) game = act(game, { type: 'HIRE', staffId: person.id });
    for (const tool of aiTools) game = act(game, { type: 'BUY_AI', toolId: tool.id });
    for (const manager of managers) game = act(game, { type: 'HIRE_MANAGER', managerId: manager.id });
    while (freeServers(game) > 0) {
      const before = game.projects.length;
      game = createProject(game, currentStage(game).maxSize);
      if (game.projects.length === before) break;
    }
    for (const id of ['youtube', 'reddit', 'influencer', 'festival'])
      game = act(game, { type: 'START_CAMPAIGN', campaignId: id });
    return assignIdleStaff(game);
  },

  // Solo el fundador, un proyecto pequeño detrás de otro.
  solitario(game) {
    if (freeServers(game) > 0 && game.money > 3000) game = createProject(game, 'Pequeño');
    return assignIdleStaff(game);
  },

  // Repite campañas sin parar (comprueba que no sea una estrategia rota).
  campañas(game) {
    game = strategies.solitario(game);
    for (const id of ['youtube', 'reddit', 'influencer', 'festival'])
      game = act(game, { type: 'START_CAMPAIGN', campaignId: id });
    return game;
  }
};

export function play(name) {
  projectCount = 0;
  let game = { ...createInitialGame(), introSeen: true };
  game = act(game, {
    type: 'CREATE_PROJECT',
    ideaId: 'p1',
    draft: { name: 'Code Quest', genre: 'RPG', style: 'Pixel Art', size: 'Pequeño', techs: ['csharp'] }
  });
  const rows = [];
  let wonAt = null;
  for (let month = 1; month <= MAX_MONTHS; month += 1) {
    game = strategies[name](game);
    game = act(game, { type: 'TICK' });
    rows.push({
      month,
      level: game.level,
      money: Math.round(game.money),
      net: computeEconomy(game).net,
      launched: launchedCount(game)
    });
    if (game.won && !wonAt) wonAt = month;
    if (game.gameOver || (wonAt && month >= wonAt + 12)) break;
  }
  return { name, game, rows, wonAt };
}
