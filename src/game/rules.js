import { aiTools, candidates, findById, genres, sizes, styles, techs } from '../data/catalog.js';
import { addMonths } from './format.js';

export const MAX_OFFICE_LEVEL = 5;
export const BANKRUPTCY_MONTHS = 3;
export const SALES_DECAY = 0.88;
export const CANCEL_REFUND = 0.3;
export const CANDIDATE_ROTATION_MONTHS = 3;
export const CANDIDATES_SHOWN = 5;
export const HISTORY_LENGTH = 24;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export const freeServers = (game) => game.maxServers - game.projects.filter((project) => project.status === 'dev').length;

export const staffCapacity = (officeLevel) => 2 + officeLevel * 2;

export const upgradeCost = (officeLevel) => Math.round(5000 * 1.8 ** (officeLevel - 1));

export const xpToNext = (level) => 100 + (level - 1) * 25;

export function stageIndex(level) {
  if (level >= 15) return 4;
  if (level >= 10) return 3;
  if (level >= 6) return 2;
  if (level >= 3) return 1;
  return 0;
}

export const staffMembers = (ids) => ids.map((id) => findById(candidates, id)).filter(Boolean);

export const toolsFor = (ids) => ids.map((id) => findById(aiTools, id)).filter(Boolean);

export function computeEconomy(game) {
  const officeIncome = 2800 + game.officeLevel * 900 + Math.floor(game.fans / 30);
  const productIncome = game.projects
    .filter((project) => project.status === 'completed')
    .reduce((sum, project) => sum + project.monthlySales, 0);
  const salaries = staffMembers(game.staff).reduce((sum, person) => sum + person.salary, 0);
  const aiCost = toolsFor(game.ownedAi).reduce((sum, tool) => sum + tool.price, 0);
  return {
    officeIncome,
    productIncome,
    salaries,
    aiCost,
    net: officeIncome + productIncome - salaries - aiCost
  };
}

/** Proyecto en desarrollo en el que trabaja un empleado (cada persona solo puede estar en uno). */
export function projectOfStaff(game, staffId) {
  return game.projects.find((project) => project.status === 'dev' && project.team.includes(staffId));
}

export function monthlyGain(project, game) {
  const teamPower = staffMembers(project.team).reduce(
    (sum, person) => sum + person.code * 0.055 + person.art * 0.03 + person.ai * 0.025,
    0
  );
  const aiBoost = toolsFor(project.ai.filter((id) => game.ownedAi.includes(id))).reduce((sum, tool) => sum + tool.boost, 0);
  const speed = 1 + (project.speedBonus || 0);
  return {
    progress: ((4 + teamPower + aiBoost * 0.35 + game.officeLevel) * speed) / project.difficulty,
    quality: (teamPower * 0.22 + aiBoost * 0.2) / project.difficulty
  };
}

export function estimateMonthsLeft(project, game) {
  if (project.status !== 'dev') return 0;
  const gain = monthlyGain(project, game).progress;
  return Math.max(1, Math.ceil((100 - project.progress) / gain));
}

export function estimatedCompletion(project, game) {
  return addMonths({ month: game.month, year: game.year }, estimateMonthsLeft(project, game));
}

export function launchRevenue(project, game) {
  const wishlistUsed = game.wishlist * 0.4;
  return Math.round(project.reward * 0.6 + project.quality * 40 + wishlistUsed * 0.4);
}

export function initialMonthlySales(project, game) {
  return Math.round(project.reward * 0.12 * (project.quality / 100) + game.fans * 0.015);
}

/** Ventas estimadas del lanzamiento de todos los proyectos en desarrollo. */
export function salesForecast(game) {
  return game.projects
    .filter((project) => project.status === 'dev')
    .reduce((sum, project) => sum + launchRevenue(project, game), 0);
}

/** Traduce el formulario de "Crear proyecto" a los números del proyecto. */
export function projectFromDraft(draft) {
  const size = findById(sizes, draft.size) || sizes[1];
  const style = findById(styles, draft.style) || styles[0];
  const genre = findById(genres, draft.genre) || genres[0];
  const chosen = draft.techs.map((id) => findById(techs, id)).filter(Boolean);
  const sum = (key) => chosen.reduce((total, tech) => total + (tech[key] || 0), 0);
  const cost = size.cost + sum('cost');
  return {
    name: draft.name.trim(),
    genre: genre.id,
    style: style.id,
    size: size.id,
    techs: chosen.map((tech) => tech.id),
    icon: genre.art,
    cost,
    reward: Math.round(size.cost * size.reward * style.reward * (1 + sum('reward')) + chosen.length * 300),
    difficulty: Math.round((size.difficulty + style.difficulty + sum('difficulty')) * 100) / 100,
    speedBonus: sum('speed'),
    quality: clamp(40 + style.quality + sum('quality'), 0, 100)
  };
}

export function draftProblems(draft, game) {
  const problems = [];
  const project = projectFromDraft(draft);
  if (project.name.length < 3) problems.push('El nombre necesita al menos 3 caracteres.');
  if (game.money < project.cost) problems.push(`Te faltan ${Math.round(project.cost - game.money)} $ para el coste inicial.`);
  if (freeServers(game) <= 0) problems.push('No tienes servidores libres: termina o cancela un proyecto, o mejora la oficina.');
  return problems;
}

/** Candidatos visibles: rotan cada pocos meses entre los que no están contratados. */
export function availableCandidates(game) {
  const pool = candidates.filter((person) => !game.staff.includes(person.id));
  if (pool.length <= CANDIDATES_SHOWN) return pool;
  const offset = (Math.floor(game.elapsed / CANDIDATE_ROTATION_MONTHS) * 2) % pool.length;
  return Array.from({ length: CANDIDATES_SHOWN }, (_, index) => pool[(offset + index) % pool.length]);
}

export const campaignEffectiveness = (timesRun) => 1 / (1 + 0.3 * timesRun);
