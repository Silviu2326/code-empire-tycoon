import {
  FOUNDER_ID,
  aiTools,
  candidates,
  empireStages,
  findById,
  genres,
  managers,
  sizes,
  styles,
  techs
} from '../data/catalog.js';
import { addMonths } from './format.js';

export const MAX_OFFICE_LEVEL = 5;
export const BANKRUPTCY_MONTHS = 3;
export const SALES_DECAY = 0.88;
export const CANCEL_REFUND = 0.3;
export const CANDIDATE_ROTATION_MONTHS = 3;
export const CANDIDATES_SHOWN = 5;
export const HISTORY_LENGTH = 24;
export const SPRINT_GEMS = 50;
export const SPRINT_PROGRESS = 10;
export const SCOUT_GEMS = 30;

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const has = (list, id) => (list || []).includes(id);
export const hasManager = (game, id) => has(game.managers, id);
export const hasUpgrade = (game, id) => has(game.upgrades, id);

export function stageIndex(level) {
  let index = 0;
  empireStages.forEach((stage, i) => {
    if (level >= stage.level) index = i;
  });
  return index;
}

export const currentStage = (game) => empireStages[stageIndex(game.level)];

export const upgradeCost = (officeLevel) => Math.round(5000 * 1.8 ** (officeLevel - 1));

export const xpToNext = (level) => 100 + (level - 1) * 25;

/** Plazas de empleado (sin contar al fundador). */
export const staffCapacity = (game) =>
  1 + game.officeLevel + currentStage(game).staffBonus + (hasManager(game, 'coo') ? 2 : 0) + (game.bonusSlots || 0);

export const serverCapacity = (game) =>
  1 +
  game.officeLevel +
  currentStage(game).serverBonus +
  (hasManager(game, 'coo') ? 1 : 0) +
  (hasUpgrade(game, 'datacenter') ? 2 : 0);

export const freeServers = (game) => serverCapacity(game) - game.projects.filter((project) => project.status === 'dev').length;

export const hiredStaff = (game) => game.staff.filter((id) => id !== FOUNDER_ID);

export const staffMembers = (ids) => ids.map((id) => findById(candidates, id)).filter(Boolean);

export const toolsFor = (ids) => ids.map((id) => findById(aiTools, id)).filter(Boolean);

export function computeEconomy(game) {
  const contractBonus = hasManager(game, 'bizdev') ? 1.4 : 1;
  const officeIncome = Math.round((2800 + game.officeLevel * 900 + Math.floor(game.fans / 30)) * contractBonus);
  const grossSales = game.projects
    .filter((project) => project.status === 'completed')
    .reduce((sum, project) => sum + project.monthlySales, 0);
  const investorShare = Math.round(grossSales * (game.equitySold || 0));
  const productIncome = grossSales - investorShare;
  const costFactor = hasManager(game, 'cfo') ? 0.8 : 1;
  const salaries = Math.round(staffMembers(game.staff).reduce((sum, person) => sum + person.salary, 0) * costFactor);
  const aiCost = Math.round(toolsFor(game.ownedAi).reduce((sum, tool) => sum + tool.price, 0) * costFactor);
  const managerCost = (game.managers || []).reduce((sum, id) => sum + (findManager(id)?.salary || 0), 0);
  return {
    officeIncome,
    productIncome,
    investorShare,
    salaries,
    aiCost,
    managerCost,
    net: officeIncome + productIncome - salaries - aiCost - managerCost
  };
}

export const findManager = (id) => findById(managers, id);

/** Proyecto en desarrollo en el que trabaja un empleado (cada persona solo puede estar en uno). */
export function projectOfStaff(game, staffId) {
  return game.projects.find((project) => project.status === 'dev' && project.team.includes(staffId));
}

export function monthlyGain(project, game) {
  const teamPower = staffMembers(project.team).reduce(
    (sum, person) => sum + person.code * 0.055 + person.art * 0.03 + person.ai * 0.025,
    0
  );
  const aiMultiplier = hasUpgrade(game, 'ailab') ? 1.25 : 1;
  const aiBoost =
    toolsFor(project.ai.filter((id) => game.ownedAi.includes(id))).reduce((sum, tool) => sum + tool.boost, 0) * aiMultiplier;
  const speed =
    1 + (project.speedBonus || 0) + (hasManager(game, 'cto') ? 0.15 : 0) + (hasUpgrade(game, 'workstations') ? 0.1 : 0);
  const qualityMultiplier = hasManager(game, 'creative') ? 1.2 : 1;
  return {
    progress: ((4 + teamPower + aiBoost * 0.35 + game.officeLevel) * speed) / project.difficulty,
    quality: ((teamPower * 0.22 + aiBoost * 0.2) * qualityMultiplier) / project.difficulty
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

const salesMultiplier = (game) => (hasUpgrade(game, 'global') ? 1.25 : 1);

export function launchRevenue(project, game) {
  const wishlistUsed = game.wishlist * 0.4;
  const marketing = hasManager(game, 'cmo') ? 1.1 : 1;
  return Math.round((project.reward * 0.6 + project.quality * 40 + wishlistUsed * 0.4) * marketing * salesMultiplier(game));
}

export function initialMonthlySales(project, game) {
  return Math.round((project.reward * 0.12 * (project.quality / 100) + game.fans * 0.015) * salesMultiplier(game));
}

/** Ventas estimadas del lanzamiento de todos los proyectos en desarrollo. */
export function salesForecast(game) {
  return game.projects
    .filter((project) => project.status === 'dev')
    .reduce((sum, project) => sum + launchRevenue(project, game), 0);
}

/** Traduce el formulario de "Crear proyecto" a los números del proyecto. */
export function projectFromDraft(draft, game) {
  const size = findById(sizes, draft.size) || sizes[1];
  const style = findById(styles, draft.style) || styles[0];
  const genre = findById(genres, draft.genre) || genres[0];
  const chosen = draft.techs.map((id) => findById(techs, id)).filter(Boolean);
  const sum = (key) => chosen.reduce((total, tech) => total + (tech[key] || 0), 0);
  const cost = size.cost + sum('cost');
  const creativeBonus = game && hasManager(game, 'creative') ? 8 : 0;
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
    quality: clamp(40 + style.quality + sum('quality') + creativeBonus, 0, 100)
  };
}

export function sizeUnlocked(sizeId, game) {
  const maxIndex = sizes.findIndex((size) => size.id === currentStage(game).maxSize);
  return sizes.findIndex((size) => size.id === sizeId) <= maxIndex;
}

export function draftProblems(draft, game) {
  const problems = [];
  const project = projectFromDraft(draft, game);
  if (project.name.length < 3) problems.push('El nombre necesita al menos 3 caracteres.');
  if (!sizeUnlocked(project.size, game)) {
    const stage = empireStages.find(
      (item) => sizes.findIndex((s) => s.id === item.maxSize) >= sizes.findIndex((s) => s.id === project.size)
    );
    problems.push(`Los proyectos ${project.size} se desbloquean en la etapa "${stage.title}" (nivel ${stage.level}).`);
  }
  if (game.money < project.cost) problems.push(`Te faltan ${Math.round(project.cost - game.money)} $ para el coste inicial.`);
  if (freeServers(game) <= 0) problems.push('No tienes servidores libres: termina o cancela un proyecto, o mejora la oficina.');
  return problems;
}

/** Candidatos visibles: según la etapa, rotan cada pocos meses entre los que no están contratados. */
export function availableCandidates(game) {
  const tier = currentStage(game).tier;
  const pool = candidates.filter((person) => !person.founder && person.tier <= tier && !game.staff.includes(person.id));
  if (pool.length <= CANDIDATES_SHOWN) return pool;
  const offset = (Math.floor(game.elapsed / CANDIDATE_ROTATION_MONTHS) * 2 + (game.candidateShift || 0)) % pool.length;
  return Array.from({ length: CANDIDATES_SHOWN }, (_, index) => pool[(offset + index) % pool.length]);
}

export function campaignEffectiveness(timesRun, game) {
  const bonus = 1 + (game && hasManager(game, 'cmo') ? 0.3 : 0) + (game && hasUpgrade(game, 'press') ? 0.2 : 0);
  return bonus / (1 + 0.3 * timesRun);
}
