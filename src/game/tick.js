import { VICTORY_LEVEL, campaigns, empireStages, findById } from '../data/catalog.js';
import { nextEvent } from './events.js';
import { applyGoals } from './goals.js';
import { addMonths, currency } from './format.js';
import {
  BANKRUPTCY_MONTHS,
  CANDIDATE_ROTATION_MONTHS,
  HISTORY_LENGTH,
  SALES_DECAY,
  clamp,
  computeEconomy,
  initialMonthlySales,
  launchRevenue,
  monthlyGain,
  stageIndex,
  xpToNext
} from './rules.js';

/** Avanza la partida un mes. Función pura: no muta `game`. */
export function advanceMonth(game) {
  if (game.gameOver) return game;

  const economy = computeEconomy(game);
  const now = addMonths({ month: game.month, year: game.year }, 1);
  const newMessages = [];
  let nextId = game.nextId;
  const say = (from, subject, body, tone) => {
    newMessages.push({ id: `m${nextId++}`, from, subject, body, tone, month: now.month, year: now.year, read: false });
  };

  let wishlist = game.wishlist;
  let fans = game.fans;
  let launchIncome = 0;
  let xpGain = 2;

  // 1. Proyectos: los completados venden cada vez menos; los que están en desarrollo avanzan.
  const projects = game.projects.map((project) => {
    if (project.status === 'completed') {
      const monthlySales = Math.round(project.monthlySales * SALES_DECAY);
      return { ...project, monthlySales: monthlySales < 30 ? 0 : monthlySales, revenue: project.revenue + project.monthlySales };
    }
    if (project.status !== 'dev') return project;

    const gain = monthlyGain(project, game);
    const progress = clamp(project.progress + gain.progress, 0, 100);
    const quality = clamp(project.quality + gain.quality, 0, 100);
    xpGain += gain.progress * 0.15;

    if (progress < 100) return { ...project, progress, quality };

    const finished = { ...project, progress, quality };
    const launch = launchRevenue(finished, { ...game, wishlist });
    const monthlySales = initialMonthlySales(finished, { ...game, fans });
    wishlist = Math.round(wishlist * 0.6);
    fans += Math.round(launch / 120);
    launchIncome += launch;
    xpGain += 10 + quality / 5;
    say(
      'Lanzamiento',
      `${project.name} ya está a la venta`,
      `El lanzamiento ha generado ${currency(launch)}. Las ventas mensuales empiezan en ${currency(monthlySales)} y bajarán poco a poco. El servidor queda libre.`,
      'green'
    );
    return { ...finished, status: 'completed', completedAt: now, launchRevenue: launch, monthlySales, revenue: launch };
  });

  // 2. Campañas de marketing activas.
  const activeCampaigns = [];
  for (const active of game.activeCampaigns) {
    const campaign = findById(campaigns, active.id);
    if (!campaign) continue;
    const monthlyFans = (campaign.fans / campaign.duration) * active.effectiveness;
    fans += Math.round(monthlyFans);
    wishlist += Math.round(monthlyFans * 1.6);
    if (active.monthsLeft > 1) {
      activeCampaigns.push({ ...active, monthsLeft: active.monthsLeft - 1 });
    } else {
      say(
        'Marketing',
        `${campaign.name} ha terminado`,
        'La campaña ha finalizado. Puedes lanzarla de nuevo, aunque rendirá algo menos.',
        'orange'
      );
    }
  }

  const devCount = projects.filter((project) => project.status === 'dev').length;
  fans += devCount * 45;
  wishlist += Math.round(devCount * 80 + game.fans / 160);

  // 3. Experiencia y niveles (puede subir varios niveles de golpe).
  let level = game.level;
  let xp = game.xp + xpGain;
  let gems = game.gems;
  while (xp >= xpToNext(level)) {
    xp -= xpToNext(level);
    level += 1;
    gems += 75;
    say('Estudio', `¡Subes a nivel ${level}!`, 'Tu estudio gana prestigio. Recibes 75 gemas.', 'purple');
  }
  if (stageIndex(level) > stageIndex(game.level)) {
    const stage = empireStages[stageIndex(level)];
    say('Imperio', `Nueva etapa: ${stage.title}`, `${stage.subtitle} Desbloqueas: ${stage.perks.join(', ')}.`, 'green');
  }
  const wonNow = !game.won && level >= VICTORY_LEVEL;
  if (wonNow) {
    say(
      'Imperio',
      '¡Has construido tu imperio tecnológico!',
      'Has llegado a la última etapa. Puedes seguir jugando tanto como quieras.',
      'green'
    );
  }

  // 4. Dinero y bancarrota.
  const money = game.money + economy.net + launchIncome;
  const debtMonths = money < 0 ? game.debtMonths + 1 : 0;
  const gameOver = debtMonths >= BANKRUPTCY_MONTHS;
  if (money < 0 && !gameOver) {
    say(
      'Banco',
      'Cuenta en números rojos',
      `Llevas ${debtMonths} ${debtMonths === 1 ? 'mes' : 'meses'} en negativo. Si llegas a ${BANKRUPTCY_MONTHS}, el estudio quiebra. Reduce gastos o lanza un producto.`,
      'red'
    );
  }

  const elapsed = game.elapsed + 1;
  if (elapsed % CANDIDATE_ROTATION_MONTHS === 0) {
    say(
      'RRHH',
      'Nuevos candidatos disponibles',
      'Hay nuevos perfiles interesados en unirse al estudio. Revisa la pestaña Empleados.',
      'blue'
    );
  }

  const history = [...game.history, { month: now.month, year: now.year, money, fans, net: economy.net + launchIncome }].slice(
    -HISTORY_LENGTH
  );

  const advanced = {
    ...game,
    won: game.won || wonNow,
    month: now.month,
    year: now.year,
    elapsed,
    level,
    xp: Math.round(xp * 10) / 10,
    gems,
    money,
    fans,
    wishlist,
    debtMonths,
    gameOver,
    paused: gameOver ? true : game.paused,
    nextId,
    projects,
    activeCampaigns,
    history,
    messages: [...newMessages.reverse(), ...game.messages].slice(0, 30)
  };

  // 5. Como mucho un evento de imperio por mes, en forma de mensaje con decisiones.
  const event = gameOver ? null : nextEvent(advanced);
  const withEvent = event
    ? {
        ...advanced,
        nextId: advanced.nextId + 1,
        firedEvents: [...(advanced.firedEvents || []), event.id],
        messages: [
          {
            id: `m${advanced.nextId}`,
            from: event.from,
            subject: event.subject,
            body: event.body,
            tone: 'purple',
            month: now.month,
            year: now.year,
            read: false,
            eventId: event.id
          },
          ...advanced.messages
        ].slice(0, 30)
      }
    : advanced;

  return applyGoals(withEvent);
}
