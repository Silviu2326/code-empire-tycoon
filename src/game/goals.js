import { FOUNDER_ID } from '../data/catalog.js';

const hasStarted = (game) => game.projects.some((project) => project.startedAt);

/** Objetivos de las primeras partidas. Hacen de tutorial y dan gemas. */
export const goals = [
  {
    id: 'firstProject',
    title: 'Empieza tu primer proyecto',
    hint: 'Proyectos → pulsa la idea "Code Quest" o crea uno nuevo.',
    gems: 25,
    done: hasStarted
  },
  {
    id: 'firstHire',
    title: 'Contrata a tu primer empleado',
    hint: 'Empleados → elige un candidato y asígnale un proyecto.',
    gems: 25,
    done: (game) => game.staff.some((id) => id !== FOUNDER_ID)
  },
  {
    id: 'firstAi',
    title: 'Activa una herramienta de IA',
    hint: 'IA → activa una y úsala en tu proyecto (pestaña Equipo).',
    gems: 25,
    done: (game) => game.ownedAi.length > 0
  },
  {
    id: 'firstCampaign',
    title: 'Lanza una campaña de marketing',
    hint: 'Marketing → las campañas traen seguidores y lista de deseados.',
    gems: 25,
    done: (game) => Object.keys(game.campaignRuns).length > 0
  },
  {
    id: 'firstLaunch',
    title: 'Lanza tu primer producto',
    hint: 'Cuando un proyecto llega al 100% sale a la venta.',
    gems: 50,
    done: (game) => game.projects.some((project) => project.status === 'completed')
  },
  {
    id: 'garage',
    title: 'Llega a "Garaje startup" (nivel 3)',
    hint: 'Ganas experiencia desarrollando y lanzando productos.',
    gems: 50,
    done: (game) => game.level >= 3
  },
  {
    id: 'office',
    title: 'Mejora la oficina',
    hint: 'Oficina → Mejorar: más servidores y plazas.',
    gems: 50,
    done: (game) => game.officeLevel >= 2
  }
];

/** Marca los objetivos cumplidos, da sus gemas y deja un mensaje. */
export function applyGoals(game) {
  const done = game.goalsDone || [];
  const reached = goals.filter((goal) => !done.includes(goal.id) && goal.done(game));
  if (reached.length === 0) return game;
  let nextId = game.nextId;
  const messages = reached.map((goal) => ({
    id: `m${nextId++}`,
    from: 'Objetivos',
    subject: `Objetivo cumplido: ${goal.title}`,
    body: `Recibes ${goal.gems} gemas.`,
    tone: 'purple',
    month: game.month,
    year: game.year,
    read: false
  }));
  return {
    ...game,
    nextId,
    gems: game.gems + reached.reduce((sum, goal) => sum + goal.gems, 0),
    goalsDone: [...done, ...reached.map((goal) => goal.id)],
    messages: [...messages, ...game.messages].slice(0, 30)
  };
}
