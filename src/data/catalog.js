export const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Cada etapa se desbloquea por nivel. Los bonus son acumulados (no se suman entre etapas).
export const empireStages = [
  {
    title: 'Coder de habitación',
    subtitle: 'Una idea, un portátil y cero excusas.',
    level: 1,
    staffBonus: 0,
    serverBonus: 0,
    maxSize: 'Mediano',
    tier: 1,
    perks: ['Proyectos pequeños y medianos', 'Candidatos junior']
  },
  {
    title: 'Garaje startup',
    subtitle: 'Primer equipo, primeras noches largas.',
    level: 3,
    staffBonus: 1,
    serverBonus: 0,
    maxSize: 'Grande',
    tier: 2,
    perks: ['+1 plaza', 'Proyectos grandes', 'Candidatos con experiencia']
  },
  {
    title: 'Estudio en crecimiento',
    subtitle: 'Procesos, managers y productos nuevos.',
    level: 6,
    staffBonus: 2,
    serverBonus: 1,
    maxSize: 'Grande',
    tier: 2,
    perks: ['+1 plaza', '+1 servidor', 'Managers y laboratorio de IA']
  },
  {
    title: 'HQ corporativo',
    subtitle: 'Inversores, contratos y reputación global.',
    level: 10,
    staffBonus: 4,
    serverBonus: 2,
    maxSize: 'AAA',
    tier: 3,
    perks: ['+2 plazas', '+1 servidor', 'Proyectos AAA', 'Mercado global', 'Talento estrella']
  },
  {
    title: 'Imperio tecnológico',
    subtitle: 'Torre propia, data centers y dominio mundial.',
    level: 15,
    staffBonus: 6,
    serverBonus: 3,
    maxSize: 'AAA',
    tier: 3,
    perks: ['+2 plazas', '+1 servidor', '¡Victoria!']
  }
];

export const VICTORY_LEVEL = 15;

// `art` es una ilustración de assets.projects o un índice de sheet-products.png (3x3).
export const genres = [
  { id: 'Aventura', icon: '🧭', art: 0 },
  { id: 'RPG', icon: '⚔', art: 'sword' },
  { id: 'Acción', icon: '💥', art: 'city' },
  { id: 'Simulación', icon: '🏙', art: 7 },
  { id: 'Estrategia', icon: '🏆', art: 5 },
  { id: 'Productividad', icon: '🛠', art: 'terminal' }
];

export const styles = [
  { id: 'Pixel Art', icon: '▧', quality: 6, reward: 1, difficulty: 0 },
  { id: '2D', icon: '🖼', quality: 3, reward: 1.05, difficulty: 0.05 },
  { id: '3D', icon: '◫', quality: 0, reward: 1.2, difficulty: 0.15 },
  { id: 'Realista', icon: '▣', quality: -4, reward: 1.4, difficulty: 0.3 }
];

export const sizes = [
  { id: 'Pequeño', icon: '▫', cost: 800, reward: 5, difficulty: 0.9 },
  { id: 'Mediano', icon: '▣', cost: 1600, reward: 5, difficulty: 1.18 },
  { id: 'Grande', icon: '▤', cost: 3000, reward: 5.2, difficulty: 1.55 },
  { id: 'AAA', icon: '▥', cost: 6200, reward: 5.5, difficulty: 2.2 }
];

// Efectos: speed multiplica el avance, quality suma calidad inicial,
// reward multiplica la recompensa y difficulty se suma a la dificultad.
export const techs = [
  { id: 'unity', name: 'Motor de juegos', cost: 300, speed: 0.1, effect: '+10% velocidad' },
  { id: 'csharp', name: 'C#', cost: 0, speed: 0.05, effect: '+5% velocidad' },
  { id: 'ai', name: '+ IA', cost: 400, quality: 5, effect: '+5 calidad' },
  { id: 'multiplayer', name: 'Multijugador', cost: 1200, reward: 0.25, difficulty: 0.2, effect: '+25% ventas, más difícil' },
  { id: 'crossplatform', name: 'Multiplataforma', cost: 800, reward: 0.15, difficulty: 0.1, effect: '+15% ventas' },
  { id: 'store', name: 'Tienda in-game', cost: 500, reward: 0.1, effect: '+10% ventas' }
];

export const defaultDraft = {
  name: 'Mi Juego Increíble',
  genre: 'Aventura',
  style: 'Pixel Art',
  size: 'Mediano',
  techs: ['unity', 'csharp', 'ai']
};

// Nombres ficticios: no se usan marcas reales. Los `id` se mantienen para no romper partidas guardadas.
// `icon` es [hoja, índice]: 'aiTools' es una hoja 2x2; 'products' y 'upgrades' son 3x3.
export const aiTools = [
  {
    id: 'chatgpt',
    name: 'PromptPal Plus',
    role: 'Código, ideas y diálogos',
    setup: 800,
    price: 20,
    boost: 5,
    icon: ['products', 2]
  },
  { id: 'claude', name: 'Sage Pro', role: 'Análisis, escritura y lógica', setup: 800, price: 20, boost: 4, icon: ['aiTools', 1] },
  { id: 'midjourney', name: 'DreamCanvas', role: 'Arte y conceptos', setup: 1200, price: 30, boost: 5, icon: ['products', 7] },
  { id: 'runway', name: 'ClipForge', role: 'Vídeos y animaciones', setup: 600, price: 15, boost: 3, icon: ['aiTools', 3] },
  { id: 'copilot', name: 'CodeBuddy', role: 'Autocompletado de código', setup: 400, price: 10, boost: 4, icon: ['upgrades', 0] },
  {
    id: 'unity',
    name: 'Nova Engine Pro',
    role: 'Motor de juegos avanzado',
    setup: 8000,
    price: 200,
    boost: 10,
    icon: ['upgrades', 7]
  }
];

// `portrait` es el cuadrante de employee-portraits.png (solo hay 4 retratos).
// `tier`: etapa mínima de talento para que aparezca como candidato (ver empireStages).
export const FOUNDER_ID = 'founder';

export const candidates = [
  {
    id: FOUNDER_ID,
    name: 'Tú',
    job: 'Fundador/a',
    salary: 0,
    code: 80,
    art: 50,
    ai: 55,
    image: 'founder',
    tier: 0,
    founder: true
  },
  { id: 'alice', name: 'Alice Johnson', job: 'Programadora', salary: 3200, code: 92, art: 45, ai: 64, portrait: 0, tier: 2 },
  { id: 'bob', name: 'Bob Smith', job: 'Artista 2D', salary: 2800, code: 38, art: 88, ai: 61, portrait: 1, tier: 1 },
  { id: 'charlie', name: 'Charlie Lee', job: 'Diseñador', salary: 2500, code: 52, art: 75, ai: 70, portrait: 2, tier: 1 },
  { id: 'diana', name: 'Diana Prieto', job: 'Especialista IA', salary: 3500, code: 68, art: 66, ai: 90, portrait: 3, tier: 3 },
  { id: 'marco', name: 'Marco Vega', job: 'Backend', salary: 3000, code: 86, art: 34, ai: 72, portrait: 0, tier: 2 },
  {
    id: 'lucia',
    name: 'Lucía Ortega',
    job: 'Diseñadora de niveles',
    salary: 2700,
    code: 48,
    art: 80,
    ai: 58,
    portrait: 1,
    tier: 1
  },
  { id: 'kenji', name: 'Kenji Mori', job: 'Programador gameplay', salary: 3400, code: 90, art: 50, ai: 60, portrait: 2, tier: 3 },
  { id: 'sara', name: 'Sara Núñez', job: 'Ingeniera de datos', salary: 3300, code: 78, art: 30, ai: 88, portrait: 3, tier: 2 },
  { id: 'tomas', name: 'Tomás Rey', job: 'Artista 3D', salary: 3100, code: 35, art: 92, ai: 55, portrait: 0, tier: 2 },
  { id: 'nora', name: 'Nora Blanco', job: 'QA y producción', salary: 2400, code: 60, art: 55, ai: 62, portrait: 1, tier: 1 }
];

export const campaigns = [
  { id: 'youtube', name: 'Tráiler en vídeo', reach: '125K', price: 1200, fans: 420, duration: 3, sprite: 0 },
  { id: 'reddit', name: 'Publicación en foros', reach: '80K', price: 800, fans: 260, duration: 2, sprite: 1 },
  { id: 'influencer', name: 'Influencer Gaming', reach: '250K', price: 2500, fans: 780, duration: 3, sprite: 2 },
  { id: 'festival', name: 'Demo en festival indie', reach: '40K', price: 1600, fans: 510, duration: 1, sprite: 3 }
];

// Managers: se contratan desde la etapa `minStage`. `sprite` es el índice en sheet-executives.png (3x2).
export const managers = [
  {
    id: 'cto',
    role: 'Dirección técnica (CTO)',
    salary: 6000,
    minStage: 2,
    sprite: 0,
    effect: '+15% velocidad en todos los proyectos'
  },
  {
    id: 'creative',
    role: 'Dirección creativa',
    salary: 5500,
    minStage: 2,
    sprite: 1,
    effect: '+8 calidad inicial y +20% mejora de calidad'
  },
  {
    id: 'cmo',
    role: 'Dirección de marketing (CMO)',
    salary: 5500,
    minStage: 2,
    sprite: 3,
    effect: '+30% seguidores de campañas y +10% ventas de lanzamiento'
  },
  { id: 'coo', role: 'Dirección de operaciones (COO)', salary: 5000, minStage: 2, sprite: 4, effect: '+1 servidor y +2 plazas' },
  {
    id: 'cfo',
    role: 'Dirección financiera (CFO)',
    salary: 6500,
    minStage: 3,
    sprite: 2,
    effect: '-20% en salarios y suscripciones de IA'
  },
  { id: 'bizdev', role: 'Desarrollo de negocio', salary: 6000, minStage: 3, sprite: 5, effect: '+40% ingresos por contratos' }
];

// Mejoras permanentes del estudio. `sprite` es el índice en sheet-upgrades.png (3x3).
export const upgrades = [
  {
    id: 'workstations',
    name: 'Estaciones de trabajo',
    cost: 8000,
    minStage: 1,
    sprite: 1,
    effect: '+10% velocidad de desarrollo'
  },
  { id: 'press', name: 'Agencia de prensa', cost: 12000, minStage: 1, sprite: 5, effect: '+20% seguidores de campañas' },
  {
    id: 'ailab',
    name: 'Laboratorio de IA',
    cost: 20000,
    minStage: 2,
    sprite: 4,
    effect: '+25% impulso de las herramientas de IA'
  },
  { id: 'datacenter', name: 'Data center propio', cost: 30000, minStage: 2, sprite: 2, effect: '+2 servidores' },
  {
    id: 'global',
    name: 'Mercado global',
    cost: 60000,
    minStage: 3,
    sprite: 6,
    effect: '+25% ingresos de lanzamiento y ventas mensuales'
  }
];

export const findById = (list, id) => list.find((item) => item.id === id);
