const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

export const assets = {
  hero: asset('hero-start.png'),
  office: asset('office-scene.png'),
  landscape: asset('project-landscape.png'),
  projects: {
    sword: asset('icon-code-quest.png'),
    terminal: asset('icon-ai-assistant.png'),
    city: asset('icon-cyber-streets.png')
  },
  portraits: asset('employee-portraits.png'),
  aiTools: asset('ai-tools.png'),
  marketing: asset('marketing-icons.png'),
  stages: [
    asset('stage-bedroom-coder.png'),
    asset('stage-garage-startup.png'),
    asset('stage-growing-studio.png'),
    asset('stage-corporate-hq.png'),
    asset('stage-empire-tower.png')
  ],
  founder: {
    early: asset('founder-early.png'),
    ceo: asset('founder-ceo.png')
  },
  empire: {
    globalMap: asset('empire-global-map.png'),
    dataCenter: asset('empire-data-center.png'),
    upgrades: asset('sheet-upgrades.png'),
    products: asset('sheet-products.png'),
    executives: asset('sheet-executives.png')
  },
  events: [
    asset('event-investor-pitch.png'),
    asset('event-product-launch.png'),
    asset('event-ipo.png'),
    asset('event-acquisition.png'),
    asset('event-awards.png')
  ]
};

// Las hojas de sprites son de 2x2: índice 0-3 → cuadrante.
export const spritePositions = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
