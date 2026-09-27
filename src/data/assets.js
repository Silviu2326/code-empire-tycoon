// Las imágenes se generan con `npm run images` a partir de assets-src/ (ver scripts/optimize-images.mjs).
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}.webp`;

// Tamaños reales de las imágenes generadas, para reservar espacio y evitar saltos de maquetación.
export const imageSize = {
  scene: { width: 1200, height: 675 },
  landscape: { width: 1000, height: 563 },
  event: { width: 720, height: 405 },
  hero: { width: 900, height: 1599 },
  founder: { width: 240, height: 240 },
  icon: { width: 256, height: 256 }
};

export const assets = {
  hero: asset('hero-start'),
  landscape: asset('project-landscape'),
  projects: {
    sword: asset('icon-code-quest'),
    terminal: asset('icon-ai-assistant'),
    city: asset('icon-cyber-streets')
  },
  portraits: asset('employee-portraits'),
  aiTools: asset('ai-tools'),
  marketing: asset('marketing-icons'),
  stages: [
    asset('stage-bedroom-coder'),
    asset('stage-garage-startup'),
    asset('stage-growing-studio'),
    asset('stage-corporate-hq'),
    asset('stage-empire-tower')
  ],
  founder: {
    early: asset('founder-early'),
    ceo: asset('founder-ceo')
  },
  empire: {
    upgrades: asset('sheet-upgrades'),
    products: asset('sheet-products'),
    executives: asset('sheet-executives')
  },
  events: [
    asset('event-investor-pitch'),
    asset('event-product-launch'),
    asset('event-ipo'),
    asset('event-acquisition'),
    asset('event-awards')
  ]
};

// Las hojas de sprites son de 2x2: índice 0-3 → cuadrante.
export const spritePositions = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
