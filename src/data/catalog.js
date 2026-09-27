export const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const empireStages = [
  { title: 'Coder de habitación', subtitle: 'Una idea, un portátil y cero excusas.', level: 1 },
  { title: 'Garaje startup', subtitle: 'Primer equipo, primeras noches largas.', level: 3 },
  { title: 'Estudio en crecimiento', subtitle: 'Procesos, managers y productos nuevos.', level: 6 },
  { title: 'HQ corporativo', subtitle: 'Inversores, contratos y reputación global.', level: 10 },
  { title: 'Imperio tecnológico', subtitle: 'Torre propia, data centers y dominio mundial.', level: 15 }
];

export const specialEvents = [
  { title: 'Ronda de inversión', subtitle: 'Convierte ambición en capital.', reward: '+$250K' },
  { title: 'Lanzamiento mundial', subtitle: 'Tu producto llena escenarios y streams.', reward: '+Fans' },
  { title: 'Salida a bolsa', subtitle: 'El estudio se vuelve una potencia pública.', reward: '+Valor' },
  { title: 'Adquisición rival', subtitle: 'Compra talento, tecnología y mercado.', reward: '+Equipo' },
  { title: 'Premios globales', subtitle: 'Prestigio que vende por ti.', reward: '+Reputación' }
];

// `art` elige el icono de proyecto disponible (solo hay tres ilustraciones por ahora).
export const genres = [
  { id: 'Aventura', icon: '🧭', art: 'sword' },
  { id: 'RPG', icon: '⚔', art: 'sword' },
  { id: 'Acción', icon: '💥', art: 'city' },
  { id: 'Simulación', icon: '🏙', art: 'city' },
  { id: 'Estrategia', icon: '🏆', art: 'terminal' },
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
  { id: 'unity', name: 'Unity', cost: 300, speed: 0.1, effect: '+10% velocidad' },
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

export const aiTools = [
  { id: 'chatgpt', name: 'ChatGPT Plus', role: 'Código, ideas y diálogos', setup: 800, price: 20, boost: 5, sprite: 0 },
  { id: 'claude', name: 'Claude Pro', role: 'Análisis, escritura y lógica', setup: 800, price: 20, boost: 4, sprite: 1 },
  { id: 'midjourney', name: 'Midjourney', role: 'Arte y conceptos', setup: 1200, price: 30, boost: 5, sprite: 2 },
  { id: 'runway', name: 'Runway', role: 'Vídeos y animaciones', setup: 600, price: 15, boost: 3, sprite: 3 },
  { id: 'copilot', name: 'GitHub Copilot', role: 'Autocompletado de código', setup: 400, price: 10, boost: 4, sprite: 0 },
  { id: 'unity', name: 'Unity Pro', role: 'Motor de juegos avanzado', setup: 8000, price: 200, boost: 10, sprite: 1 }
];

// `portrait` es el cuadrante de employee-portraits.png (solo hay 4 retratos).
export const candidates = [
  { id: 'alice', name: 'Alice Johnson', job: 'Programadora', salary: 3200, code: 92, art: 45, ai: 64, portrait: 0 },
  { id: 'bob', name: 'Bob Smith', job: 'Artista 2D', salary: 2800, code: 38, art: 88, ai: 61, portrait: 1 },
  { id: 'charlie', name: 'Charlie Lee', job: 'Diseñador', salary: 2500, code: 52, art: 75, ai: 70, portrait: 2 },
  { id: 'diana', name: 'Diana Prieto', job: 'Especialista IA', salary: 3500, code: 68, art: 66, ai: 90, portrait: 3 },
  { id: 'marco', name: 'Marco Vega', job: 'Backend', salary: 3000, code: 86, art: 34, ai: 72, portrait: 0 },
  { id: 'lucia', name: 'Lucía Ortega', job: 'Diseñadora de niveles', salary: 2700, code: 48, art: 80, ai: 58, portrait: 1 },
  { id: 'kenji', name: 'Kenji Mori', job: 'Programador gameplay', salary: 3400, code: 90, art: 50, ai: 60, portrait: 2 },
  { id: 'sara', name: 'Sara Núñez', job: 'Ingeniera de datos', salary: 3300, code: 78, art: 30, ai: 88, portrait: 3 },
  { id: 'tomas', name: 'Tomás Rey', job: 'Artista 3D', salary: 3100, code: 35, art: 92, ai: 55, portrait: 0 },
  { id: 'nora', name: 'Nora Blanco', job: 'QA y producción', salary: 2400, code: 60, art: 55, ai: 62, portrait: 1 }
];

export const campaigns = [
  { id: 'youtube', name: 'Tráiler en YouTube', reach: '125K', price: 1200, fans: 420, duration: 3, sprite: 0 },
  { id: 'reddit', name: 'Publicación en Reddit', reach: '80K', price: 800, fans: 260, duration: 2, sprite: 1 },
  { id: 'influencer', name: 'Influencer Gaming', reach: '250K', price: 2500, fans: 780, duration: 3, sprite: 2 },
  { id: 'festival', name: 'Demo en festival indie', reach: '40K', price: 1600, fans: 510, duration: 1, sprite: 3 }
];

export const findById = (list, id) => list.find((item) => item.id === id);
