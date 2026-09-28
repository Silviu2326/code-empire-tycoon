import { FOUNDER_ID } from '../data/catalog.js';

export const SAVE_VERSION = 3;

const start = { month: 5, year: 2025 };

function message(id, from, subject, body, tone) {
  return { id, from, subject, body, tone, month: start.month, year: start.year, read: false };
}

/** Partida nueva: empiezas como "Coder de habitación", solo y con una idea. */
export function createInitialGame() {
  return {
    saveVersion: SAVE_VERSION,
    month: start.month,
    year: start.year,
    elapsed: 0,
    level: 1,
    xp: 0,
    money: 10000,
    gems: 100,
    officeLevel: 1,
    paused: false,
    speed: 1,
    fans: 500,
    wishlist: 800,
    debtMonths: 0,
    gameOver: false,
    won: false,
    victorySeen: false,
    introSeen: false,
    nextId: 100,
    equitySold: 0,
    bonusSlots: 0,
    candidateShift: 0,
    managers: [],
    upgrades: [],
    firedEvents: [],
    goalsDone: [],
    messages: [
      message(
        'm1',
        'Tú',
        'Hoy empieza todo',
        'Un portátil, una idea y muchas ganas. Revisa los objetivos en la Oficina para dar tus primeros pasos.',
        'green'
      ),
      message(
        'm2',
        'Comunidad',
        'Tu demo de Code Quest gusta',
        'La pequeña comunidad que sigue tu blog quiere jugar a Code Quest. Es un buen primer proyecto.',
        'red'
      )
    ],
    ownedAi: [],
    staff: [FOUNDER_ID],
    campaignRuns: {},
    activeCampaigns: [],
    history: [],
    projects: [
      {
        id: 'p1',
        name: 'Code Quest',
        genre: 'RPG',
        style: 'Pixel Art',
        size: 'Pequeño',
        techs: ['csharp'],
        icon: 'sword',
        status: 'idea',
        progress: 0,
        quality: 0,
        team: [],
        ai: [],
        spent: 0,
        monthlySales: 0,
        revenue: 0
      }
    ]
  };
}
