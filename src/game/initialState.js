export const SAVE_VERSION = 2;

const start = { month: 5, year: 2025 };

function message(id, from, subject, body, tone, month = start.month, year = start.year) {
  return { id, from, subject, body, tone, month, year, read: false };
}

export function createInitialGame() {
  return {
    saveVersion: SAVE_VERSION,
    month: start.month,
    year: start.year,
    elapsed: 0,
    level: 3,
    xp: 35,
    money: 15430,
    gems: 850,
    officeLevel: 1,
    maxServers: 3,
    paused: false,
    speed: 1,
    fans: 8920,
    wishlist: 12430,
    debtMonths: 0,
    gameOver: false,
    nextId: 100,
    messages: [
      message(
        'm1',
        'Inversor',
        'Nueva oferta de financiación',
        'Un fondo quiere conocer tu estudio. Sigue creciendo y volverán con una oferta.',
        'purple'
      ),
      message(
        'm2',
        'Cliente',
        'Sobre AI Assistant Pro',
        'El cliente pregunta por la fecha de entrega. Asigna más equipo para acelerar el desarrollo.',
        'orange',
        4
      ),
      message(
        'm3',
        'Prensa',
        'Entrevista propuesta',
        'Una revista de videojuegos quiere entrevistarte cuando lances tu próximo título.',
        'blue',
        3
      ),
      message(
        'm4',
        'Comunidad',
        '¡Les encanta Code Quest!',
        'La demo de Code Quest tiene muy buenas reacciones. La lista de deseados no para de crecer.',
        'red',
        3
      )
    ],
    ownedAi: ['chatgpt', 'midjourney'],
    staff: ['alice', 'bob'],
    campaignRuns: {},
    activeCampaigns: [],
    history: [],
    projects: [
      {
        id: 'p1',
        name: 'Code Quest',
        genre: 'RPG',
        style: 'Pixel Art',
        size: 'Mediano',
        techs: ['unity', 'csharp'],
        icon: 'sword',
        cost: 1200,
        reward: 8400,
        difficulty: 1.15,
        speedBonus: 0,
        progress: 65,
        quality: 82,
        status: 'dev',
        team: ['alice'],
        ai: ['chatgpt', 'midjourney'],
        spent: 2400,
        monthlySales: 0,
        revenue: 0
      },
      {
        id: 'p2',
        name: 'AI Assistant Pro',
        genre: 'Productividad',
        style: '2D',
        size: 'Mediano',
        techs: ['ai'],
        icon: 'terminal',
        cost: 1800,
        reward: 11200,
        difficulty: 1.35,
        speedBonus: 0,
        progress: 30,
        quality: 74,
        status: 'dev',
        team: ['bob'],
        ai: ['chatgpt'],
        spent: 1800,
        monthlySales: 0,
        revenue: 0
      },
      {
        id: 'p3',
        name: 'Cyber Streets',
        genre: 'Acción',
        style: '3D',
        size: 'Grande',
        techs: ['unity', 'multiplayer'],
        icon: 'city',
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
