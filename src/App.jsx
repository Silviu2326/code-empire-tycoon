import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'code-empire-tycoon-save-v1';
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}`;

const assets = {
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

const spritePositions = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
const avatarIndex = { devA: 0, devB: 1, devC: 2, devD: 3, devE: 0 };
const aiToolIndex = { chatgpt: 0, claude: 1, midjourney: 2, runway: 3, copilot: 0, unity: 1 };
const campaignIndex = { youtube: 0, reddit: 1, influencer: 2, festival: 3 };
const empireStages = [
  { title: 'Coder de habitación', subtitle: 'Una idea, un portátil y cero excusas.', level: 1 },
  { title: 'Garaje startup', subtitle: 'Primer equipo, primeras noches largas.', level: 3 },
  { title: 'Estudio en crecimiento', subtitle: 'Procesos, managers y productos nuevos.', level: 6 },
  { title: 'HQ corporativo', subtitle: 'Inversores, contratos y reputación global.', level: 10 },
  { title: 'Imperio tecnológico', subtitle: 'Torre propia, data centers y dominio mundial.', level: 15 }
];
const specialEvents = [
  { title: 'Ronda de inversión', subtitle: 'Convierte ambición en capital.', reward: '+$250K' },
  { title: 'Lanzamiento mundial', subtitle: 'Tu producto llena escenarios y streams.', reward: '+Fans' },
  { title: 'Salida a bolsa', subtitle: 'El estudio se vuelve una potencia pública.', reward: '+Valor' },
  { title: 'Adquisición rival', subtitle: 'Compra talento, tecnología y mercado.', reward: '+Equipo' },
  { title: 'Premios globales', subtitle: 'Prestigio que vende por ti.', reward: '+Reputación' }
];

const projectTemplates = [
  { name: 'Code Quest', genre: 'RPG', style: 'Pixel Art', icon: 'sword', cost: 1200, reward: 8400, difficulty: 1.15 },
  { name: 'AI Assistant Pro', genre: 'Productividad', style: 'Herramienta', icon: 'terminal', cost: 1800, reward: 11200, difficulty: 1.35 },
  { name: 'Cyber Streets', genre: 'Action', style: '3D', icon: 'city', cost: 3200, reward: 19600, difficulty: 1.7 }
];

const aiTools = [
  { id: 'chatgpt', name: 'ChatGPT Plus', role: 'Código, ideas y diálogos', price: 20, boost: 5, color: '#21c989', glyph: 'AI' },
  { id: 'claude', name: 'Claude Pro', role: 'Análisis, escritura y lógica', price: 20, boost: 4, color: '#e29a5a', glyph: 'CL' },
  { id: 'midjourney', name: 'Midjourney', role: 'Arte y conceptos', price: 30, boost: 5, color: '#5c84ff', glyph: 'MJ' },
  { id: 'runway', name: 'Runway', role: 'Vídeos y animaciones', price: 15, boost: 3, color: '#8a5dff', glyph: 'RW' },
  { id: 'copilot', name: 'GitHub Copilot', role: 'Autocompletado de código', price: 10, boost: 4, color: '#aeb8c6', glyph: 'GH' },
  { id: 'unity', name: 'Unity Pro', role: 'Motor de juegos avanzado', price: 200, boost: 10, color: '#111827', glyph: 'U' }
];

const candidates = [
  { id: 'alice', name: 'Alice Johnson', job: 'Programadora', salary: 3200, code: 92, art: 45, ai: 64, avatar: 'devA' },
  { id: 'bob', name: 'Bob Smith', job: 'Artista 2D', salary: 2800, code: 38, art: 88, ai: 61, avatar: 'devB' },
  { id: 'charlie', name: 'Charlie Lee', job: 'Diseñador', salary: 2500, code: 52, art: 75, ai: 70, avatar: 'devC' },
  { id: 'diana', name: 'Diana Prince', job: 'Especialista IA', salary: 3500, code: 68, art: 66, ai: 90, avatar: 'devD' },
  { id: 'marco', name: 'Marco Vega', job: 'Backend', salary: 3000, code: 86, art: 34, ai: 72, avatar: 'devE' }
];

const campaigns = [
  { id: 'youtube', name: 'Tráiler en YouTube', reach: '125K', price: 1200, fans: 420 },
  { id: 'reddit', name: 'Publicación en Reddit', reach: '80K', price: 800, fans: 260 },
  { id: 'influencer', name: 'Influencer Gaming', reach: '250K', price: 2500, fans: 780 },
  { id: 'festival', name: 'Demo en festival indie', reach: '40K', price: 1600, fans: 510 }
];

const initialGame = {
  started: false,
  month: 5,
  year: 2025,
  level: 3,
  xp: 35,
  money: 15430,
  gems: 850,
  officeLevel: 1,
  servers: 2,
  maxServers: 2,
  paused: false,
  speed: 1,
  fans: 8920,
  wishlist: 12430,
  salesForecast: 18300,
  activeTab: 'office',
  activeProjectId: 'p1',
  messages: [
    { from: 'Inversor', subject: 'Nueva oferta de financiación', time: '10:30', tone: 'purple' },
    { from: 'Cliente', subject: 'Sobre AI Assistant Pro', time: 'Ayer', tone: 'orange' },
    { from: 'Prensa', subject: 'Entrevista propuesta', time: '2d', tone: 'blue' },
    { from: 'Comunidad', subject: '¡Les encanta Code Quest!', time: '3d', tone: 'red' }
  ],
  ownedAi: ['chatgpt', 'midjourney'],
  staff: ['alice', 'bob'],
  projects: [
    { id: 'p1', ...projectTemplates[0], progress: 65, quality: 82, status: 'dev', deadline: 'Ago 2025', team: ['alice', 'bob'], ai: ['chatgpt', 'midjourney'], spent: 2400 },
    { id: 'p2', ...projectTemplates[1], progress: 30, quality: 74, status: 'dev', deadline: 'Jul 2025', team: ['alice'], ai: ['chatgpt'], spent: 1800 },
    { id: 'p3', ...projectTemplates[2], progress: 0, quality: 0, status: 'idea', deadline: 'En concepto', team: [], ai: [], spent: 0 }
  ],
  completed: []
};

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function currency(value) {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function iconFor(type) {
  const icons = {
    sword: '⚔',
    terminal: '>_',
    city: '▣',
    dev: '☻',
    office: '⌂',
    projects: '▣',
    ai: '✹',
    employees: '♟',
    store: '▰',
    plus: '+'
  };
  return icons[type] || type;
}

function useGameLoop(game, setGame) {
  useEffect(() => {
    if (!game.started || game.paused) return undefined;
    const timer = window.setInterval(() => {
      setGame((current) => advanceMonth(current));
    }, 4200 / game.speed);
    return () => window.clearInterval(timer);
  }, [game.paused, game.speed, game.started, setGame]);
}

function advanceMonth(game) {
  const staff = game.staff.map((id) => candidates.find((person) => person.id === id)).filter(Boolean);
  const aiBoost = game.ownedAi.reduce((sum, id) => sum + (aiTools.find((tool) => tool.id === id)?.boost || 0), 0);
  const salaries = staff.reduce((sum, person) => sum + person.salary, 0);
  const aiCost = game.ownedAi.reduce((sum, id) => sum + (aiTools.find((tool) => tool.id === id)?.price || 0), 0);
  const officeIncome = 2800 + game.officeLevel * 900 + Math.floor(game.fans / 30);
  let reward = 0;
  const messages = [...game.messages];

  const projects = game.projects.map((project) => {
    if (project.status !== 'dev') return project;
    const teamPower = project.team
      .map((id) => candidates.find((person) => person.id === id))
      .filter(Boolean)
      .reduce((sum, person) => sum + person.code * 0.055 + person.art * 0.03 + person.ai * 0.025, 0);
    const progressGain = (4 + teamPower + aiBoost * 0.35 + game.officeLevel) / project.difficulty;
    const qualityGain = (teamPower * 0.22 + aiBoost * 0.2) / project.difficulty;
    const nextProgress = clamp(project.progress + progressGain, 0, 100);
    const completedNow = project.progress < 100 && nextProgress >= 100;
    if (completedNow) {
      const payout = project.reward + project.quality * 45 + game.fans * 0.18;
      reward += payout;
      messages.unshift({
        from: 'Lanzamiento',
        subject: `${project.name} ya genera ingresos`,
        time: 'Hoy',
        tone: 'green'
      });
    }
    return {
      ...project,
      progress: nextProgress,
      quality: clamp(project.quality + qualityGain, 0, 100),
      status: completedNow ? 'completed' : project.status
    };
  });

  const monthIndex = game.month === 12 ? 1 : game.month + 1;
  const year = game.month === 12 ? game.year + 1 : game.year;
  const xp = clamp(game.xp + 6 + projects.filter((p) => p.status === 'completed').length * 2, 0, 100);
  const levelUp = xp >= 100;

  return {
    ...game,
    month: monthIndex,
    year,
    level: levelUp ? game.level + 1 : game.level,
    xp: levelUp ? xp - 100 : xp,
    money: Math.max(0, game.money + officeIncome + reward - salaries - aiCost),
    gems: levelUp ? game.gems + 75 : game.gems,
    fans: game.fans + Math.round(projects.filter((p) => p.status === 'dev').length * 45 + reward / 120),
    wishlist: game.wishlist + Math.round(projects.filter((p) => p.status === 'dev').length * 80 + game.fans / 160),
    salesForecast: game.salesForecast + Math.round(reward / 4 + game.fans / 90),
    messages: messages.slice(0, 7),
    projects
  };
}

function App() {
  const [game, setGame] = useState(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialGame;
  });

  useGameLoop(game, setGame);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  }, [game]);

  const staff = useMemo(() => game.staff.map((id) => candidates.find((person) => person.id === id)).filter(Boolean), [game.staff]);
  const monthlyIncome = 2800 + game.officeLevel * 900 + Math.floor(game.fans / 30);

  function update(patch) {
    setGame((current) => ({ ...current, ...patch }));
  }

  function startNewGame() {
    setGame({ ...initialGame, started: true, activeTab: 'office' });
  }

  function loadGame() {
    setGame((current) => ({ ...current, started: true, activeTab: 'office' }));
  }

  function buyAi(toolId) {
    const tool = aiTools.find((item) => item.id === toolId);
    if (!tool || game.ownedAi.includes(toolId) || game.money < tool.price * 40) return;
    setGame((current) => ({
      ...current,
      money: current.money - tool.price * 40,
      ownedAi: [...current.ownedAi, toolId],
      messages: [{ from: 'IA', subject: `${tool.name} activado en el estudio`, time: 'Hoy', tone: 'green' }, ...current.messages].slice(0, 7)
    }));
  }

  function hire(personId) {
    const person = candidates.find((item) => item.id === personId);
    if (!person || game.staff.includes(personId) || game.money < person.salary) return;
    setGame((current) => ({
      ...current,
      money: current.money - person.salary,
      staff: [...current.staff, personId],
      messages: [{ from: 'RRHH', subject: `${person.name} se une al equipo`, time: 'Hoy', tone: 'blue' }, ...current.messages].slice(0, 7)
    }));
  }

  function createProject(project) {
    const id = `p${Date.now()}`;
    setGame((current) => ({
      ...current,
      money: current.money - project.cost,
      servers: Math.max(0, current.servers - 1),
      activeProjectId: id,
      activeTab: 'project',
      projects: [{ id, ...project, progress: 2, quality: 48, status: 'dev', deadline: 'Dic 2025', team: current.staff.slice(0, 3), ai: current.ownedAi.slice(0, 2), spent: project.cost }, ...current.projects]
    }));
  }

  function fundCampaign(campaign) {
    if (game.money < campaign.price) return;
    setGame((current) => ({
      ...current,
      money: current.money - campaign.price,
      fans: current.fans + campaign.fans,
      wishlist: current.wishlist + Math.round(campaign.fans * 1.6),
      salesForecast: current.salesForecast + Math.round(campaign.fans * 2.1),
      messages: [{ from: 'Marketing', subject: `${campaign.name} aumenta el hype`, time: 'Hoy', tone: 'orange' }, ...current.messages].slice(0, 7)
    }));
  }

  if (!game.started) {
    return <StartScreen onNew={startNewGame} onLoad={loadGame} />;
  }

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <TopBar game={game} setGame={setGame} monthlyIncome={monthlyIncome} />
        <div className="screen-body">
          {game.activeTab === 'office' && <Office game={game} staff={staff} monthlyIncome={monthlyIncome} update={update} />}
          {game.activeTab === 'projects' && <Projects game={game} update={update} />}
          {game.activeTab === 'create' && <CreateProject game={game} createProject={createProject} update={update} />}
          {game.activeTab === 'project' && <ProjectDetail game={game} update={update} />}
          {game.activeTab === 'ai' && <AiScreen game={game} buyAi={buyAi} />}
          {game.activeTab === 'employees' && <Employees game={game} hire={hire} />}
          {game.activeTab === 'store' && <Store game={game} fundCampaign={fundCampaign} />}
        </div>
        <BottomNav active={game.activeTab} update={update} />
      </section>
    </main>
  );
}

function StartScreen({ onNew, onLoad }) {
  return (
    <main className="start-shell">
      <section className="start-card">
        <div className="version">v0.1.0</div>
        <button className="gear" aria-label="Opciones">⚙</button>
        <PixelOffice hero />
        <div className="logo-block">
          <h1>&lt;Code<br /><span>Empire</span><br /><strong>Tycoon&gt;</strong></h1>
          <p>Construye tu imperio. Escribe tu legado.</p>
        </div>
        <div className="start-actions">
          <button className="primary big" onClick={onNew}>Nueva partida</button>
          <button onClick={onLoad}>Cargar partida</button>
          <button>Opciones</button>
        </div>
      </section>
    </main>
  );
}

function TopBar({ game, setGame, monthlyIncome }) {
  return (
    <header className="topbar">
      <div className="pill star">★ Nivel {game.level}</div>
      <div className="pill money">◎ {currency(game.money).replace('$', '')}</div>
      <div className="pill gems">◆ {game.gems}</div>
      <button className="square" onClick={() => setGame((current) => ({ ...current, gems: current.gems + 25 }))}>+</button>
      <div className="calendar">{monthNames[game.month - 1]} {game.year}</div>
      <button className="square" onClick={() => setGame((current) => ({ ...current, paused: !current.paused }))}>{game.paused ? '▶' : 'Ⅱ'}</button>
      <button className="square" onClick={() => setGame((current) => ({ ...current, speed: current.speed === 1 ? 2 : current.speed === 2 ? 4 : 1 }))}>{game.speed}x</button>
      <div className="pill income">{currency(monthlyIncome)}/mes</div>
    </header>
  );
}

function Office({ game, staff, monthlyIncome, update }) {
  const serverText = `${game.servers}/${game.maxServers}`;
  return (
    <div className="stack">
      <PixelOffice />
      <div className="stats-grid">
        <Stat label="Desarrolladores" value={`${staff.length}/4`} icon="☻" />
        <Stat label="Servidores" value={serverText} icon="▦" />
        <Stat label="Oficina" value={`Nivel ${game.officeLevel}`} icon="⌂" green />
        <Stat label="Ingresos/mes" value={currency(monthlyIncome)} icon="♜" green />
      </div>
      <section className="panel">
        <div className="section-head">
          <h2>Estudio</h2>
          <button className="small-button" onClick={() => game.money >= 5000 && update({ money: game.money - 5000, officeLevel: game.officeLevel + 1, maxServers: game.maxServers + 1, servers: game.servers + 1 })}>
            Mejorar {currency(5000)}
          </button>
        </div>
        <div className="progress-line">
          <span>Experiencia</span>
          <strong>{game.xp}%</strong>
        </div>
        <div className="bar"><span style={{ width: `${game.xp}%` }} /></div>
        <div className="office-actions">
          <button onClick={() => update({ activeTab: 'create' })}>Crear proyecto</button>
          <button onClick={() => update({ activeTab: 'store' })}>Marketing</button>
        </div>
      </section>
      <section className="panel">
        <h2>Equipo activo</h2>
        <div className="avatar-row">
          {staff.map((person) => <Avatar key={person.id} type={person.avatar} label={person.name} />)}
          {Array.from({ length: Math.max(0, 4 - staff.length) }).map((_, index) => <button key={index} className="empty-slot" onClick={() => update({ activeTab: 'employees' })}>+</button>)}
        </div>
      </section>
      <EmpireRoadmap game={game} />
    </div>
  );
}

function Projects({ game, update }) {
  const devProjects = game.projects.filter((project) => project.status === 'dev');
  const completed = game.projects.filter((project) => project.status === 'completed');
  const ideas = game.projects.filter((project) => project.status === 'idea');
  return (
    <div className="stack">
      <ScreenTitle title="Proyectos" action="+ Nuevo Proyecto" onAction={() => update({ activeTab: 'create' })} />
      <div className="tabs"><span className="active">En desarrollo</span><span>Completados</span><span>Cancelados</span></div>
      {[...devProjects, ...completed, ...ideas].map((project) => (
        <button className="project-card" key={project.id} onClick={() => update({ activeProjectId: project.id, activeTab: project.status === 'idea' ? 'create' : 'project' })}>
          <div className={`project-icon ${project.status === 'idea' ? 'locked' : ''}`}>
            <img src={assets.projects[project.icon] || assets.projects.city} alt="" />
            {project.status === 'idea' && <span className="icon-lock">🔒</span>}
          </div>
          <div className="project-info">
            <h3>{project.name}</h3>
            <p>{project.genre} • {project.style}</p>
            {project.status === 'idea' ? <span className="muted">En concepto</span> : <div className="bar"><span style={{ width: `${project.progress}%` }} /></div>}
            {project.status !== 'idea' && <small>Fecha estimada: {project.deadline}</small>}
          </div>
          {project.status !== 'idea' && <strong>{Math.round(project.progress)}%</strong>}
        </button>
      ))}
    </div>
  );
}

function CreateProject({ game, createProject, update }) {
  const [name, setName] = useState('Mi Juego Increíble');
  const [genre, setGenre] = useState('Aventura');
  const [style, setStyle] = useState('Pixel Art');
  const [size, setSize] = useState('Mediano');
  const [techs, setTechs] = useState(['Unity', 'C#', '+ IA']);

  const sizeCost = { Pequeño: 800, Mediano: 1600, Grande: 3000, AAA: 6200 }[size];
  const project = {
    name,
    genre,
    style,
    icon: genre === 'RPG' ? 'sword' : genre === 'Simulación' ? 'city' : 'terminal',
    cost: sizeCost,
    reward: sizeCost * 5 + techs.length * 900,
    difficulty: { Pequeño: 0.9, Mediano: 1.18, Grande: 1.55, AAA: 2.2 }[size]
  };
  const canCreate = game.money >= sizeCost && game.servers > 0 && name.trim().length > 2;

  return (
    <div className="stack">
      <ScreenTitle title="Crear nuevo proyecto" back={() => update({ activeTab: 'projects' })} />
      <label className="field-label">Nombre del proyecto</label>
      <input className="text-input" value={name} onChange={(event) => setName(event.target.value)} />
      <ChoiceGrid title="Género" value={genre} setValue={setGenre} options={['Aventura', 'RPG', 'Simulación', 'Estrategia']} icons={['🧭', '⚔', '🏙', '🏆']} />
      <ChoiceGrid title="Estilo gráfico" value={style} setValue={setStyle} options={['Pixel Art', '2D', '3D', 'Realista']} icons={['▧', '🖼', '◫', '▣']} />
      <ChoiceGrid title="Tamaño del proyecto" value={size} setValue={setSize} options={['Pequeño', 'Mediano', 'Grande', 'AAA']} icons={['▫', '▣', '▤', '▥']} />
      <section className="panel">
        <h2>Tecnologías</h2>
        <div className="chips">
          {techs.map((tech) => <span key={tech}>{tech}</span>)}
          <button onClick={() => setTechs((items) => items.includes('Multijugador') ? items : [...items, 'Multijugador'])}>+</button>
        </div>
      </section>
      <div className="cost-row"><span>Coste inicial</span><strong>{currency(sizeCost)}</strong></div>
      <button className="primary big" disabled={!canCreate} onClick={() => createProject(project)}>Crear proyecto</button>
      {!canCreate && <p className="hint">Necesitas dinero disponible y un servidor libre.</p>}
    </div>
  );
}

function ProjectDetail({ game, update }) {
  const project = game.projects.find((item) => item.id === game.activeProjectId) || game.projects[0];
  const assignedStaff = project.team.map((id) => candidates.find((person) => person.id === id)).filter(Boolean);
  const assignedAi = project.ai.map((id) => aiTools.find((tool) => tool.id === id)).filter(Boolean);
  return (
    <div className="stack">
      <ScreenTitle title={`Desarrollo: ${project.name}`} back={() => update({ activeTab: 'projects' })} />
      <div className="tabs"><span className="active">Resumen</span><span>Tareas</span><span>Equipo</span><span>Análisis</span></div>
      <PixelLandscape />
      <div className="progress-line"><span>Progreso general</span><strong>{Math.round(project.progress)}%</strong></div>
      <div className="bar big"><span style={{ width: `${project.progress}%` }} /></div>
      <div className="quality-row"><span>Calidad</span><Stars value={project.quality} /></div>
      <section className="panel">
        <h2>Equipo asignado</h2>
        <div className="avatar-row">
          {assignedStaff.map((person) => <Avatar key={person.id} type={person.avatar} label={person.name} />)}
          {Array.from({ length: Math.max(0, 5 - assignedStaff.length) }).map((_, index) => <span key={index} className="empty-slot">+</span>)}
        </div>
      </section>
      <section className="panel">
        <h2>IA utilizada recientemente</h2>
        {assignedAi.map((tool) => <ToolMini key={tool.id} tool={tool} />)}
      </section>
      <button className="primary big" onClick={() => update({ paused: false, speed: 4 })}>Continuar desarrollo</button>
    </div>
  );
}

function AiScreen({ game, buyAi }) {
  return (
    <div className="stack">
      <ScreenTitle title="IA y herramientas" right={`◆ ${game.gems}`} />
      <h4 className="eyebrow">IA disponibles</h4>
      {aiTools.slice(0, 4).map((tool) => <ToolRow key={tool.id} tool={tool} owned={game.ownedAi.includes(tool.id)} buyAi={buyAi} />)}
      <h4 className="eyebrow">Otras herramientas</h4>
      {aiTools.slice(4).map((tool) => <ToolRow key={tool.id} tool={tool} owned={game.ownedAi.includes(tool.id)} buyAi={buyAi} />)}
    </div>
  );
}

function Employees({ game, hire }) {
  return (
    <div className="stack">
      <ScreenTitle title="Empleados" action="+ Contratar" />
      {candidates.map((person) => (
        <article className="person-card" key={person.id}>
          <Avatar type={person.avatar} label={person.name} />
          <div>
            <h3>{person.name}</h3>
            <p>{person.job}</p>
            <small>💻 {person.code} &nbsp; 🎨 {person.art} &nbsp; ☺ {person.ai}</small>
          </div>
          <button className={game.staff.includes(person.id) ? 'owned' : 'hire'} onClick={() => hire(person.id)}>
            {game.staff.includes(person.id) ? 'En equipo' : `${currency(person.salary)}/mes`}
          </button>
        </article>
      ))}
    </div>
  );
}

function Store({ game, fundCampaign }) {
  return (
    <div className="stack">
      <ScreenTitle title="Marketing" />
      <h4 className="eyebrow">Campañas activas</h4>
      {campaigns.map((campaign) => (
        <article className="campaign-card" key={campaign.id}>
          <div
            className="campaign-icon asset-sprite"
            style={{ backgroundImage: `url(${assets.marketing})`, backgroundPosition: spritePositions[campaignIndex[campaign.id] || 0] }}
          />
          <div><h3>{campaign.name}</h3><p>Alcance: {campaign.reach}</p></div>
          <button onClick={() => fundCampaign(campaign)}>{currency(campaign.price)}</button>
        </article>
      ))}
      <section className="panel">
        <h2>Estadísticas</h2>
        <div className="stats-grid triple">
          <Stat label="Lista de deseados" value={game.wishlist.toLocaleString('en-US')} />
          <Stat label="Seguidores" value={game.fans.toLocaleString('en-US')} />
          <Stat label="Ventas estimadas" value={game.salesForecast.toLocaleString('en-US')} />
        </div>
        <div className="chart">
          {Array.from({ length: 34 }).map((_, index) => <i key={index} style={{ height: `${18 + ((index * 17 + game.fans / 90) % 38)}px` }} />)}
        </div>
      </section>
      <EmpireAssets />
      <EmpireEvents />
      <section className="panel messages">
        <h2>Mensajes</h2>
        {game.messages.map((message, index) => <Message key={`${message.from}-${index}`} message={message} />)}
      </section>
    </div>
  );
}

function EmpireRoadmap({ game }) {
  const unlocked = game.level >= 15 ? 4 : game.level >= 10 ? 3 : game.level >= 6 ? 2 : game.level >= 3 ? 1 : 0;
  return (
    <section className="panel empire-roadmap">
      <div className="section-head">
        <h2>Ruta del imperio</h2>
        <span className="mini-tag">Etapa {unlocked + 1}/5</span>
      </div>
      <div className="founder-split">
        <img src={assets.founder.early} alt="" />
        <div>
          <strong>De vive coder</strong>
          <span>A fundador que empieza solo y escala con cada proyecto.</span>
        </div>
        <img src={assets.founder.ceo} alt="" />
      </div>
      <div className="stage-strip">
        {empireStages.map((stage, index) => (
          <article className={index <= unlocked ? 'stage-card unlocked' : 'stage-card'} key={stage.title}>
            <img src={assets.stages[index]} alt="" />
            <div>
              <small>Nivel {stage.level}</small>
              <h3>{stage.title}</h3>
              <p>{stage.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EmpireAssets() {
  return (
    <section className="panel">
      <h2>Expansión empresarial</h2>
      <div className="empire-grid">
        <AssetBanner image={assets.empire.globalMap} title="Mercado global" subtitle="Desbloquea regiones, fans y ventas internacionales." />
        <AssetBanner image={assets.empire.dataCenter} title="Data center propio" subtitle="Sube la capacidad para IA, multijugador y SaaS." />
      </div>
      <div className="asset-sheet-row">
        <AssetSheet image={assets.empire.upgrades} title="Upgrades" />
        <AssetSheet image={assets.empire.products} title="Productos" />
        <AssetSheet image={assets.empire.executives} title="Managers" />
      </div>
    </section>
  );
}

function EmpireEvents() {
  return (
    <section className="panel">
      <h2>Eventos de imperio</h2>
      <div className="event-gallery">
        {specialEvents.map((event, index) => (
          <article className="event-card" key={event.title}>
            <img src={assets.events[index]} alt="" />
            <div>
              <span>{event.reward}</span>
              <h3>{event.title}</h3>
              <p>{event.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AssetBanner({ image, title, subtitle }) {
  return (
    <article className="asset-banner">
      <img src={image} alt="" />
      <div><h3>{title}</h3><p>{subtitle}</p></div>
    </article>
  );
}

function AssetSheet({ image, title }) {
  return (
    <article className="asset-sheet">
      <img src={image} alt="" />
      <strong>{title}</strong>
    </article>
  );
}

function ScreenTitle({ title, action, onAction, back, right }) {
  return (
    <div className="screen-title">
      {back && <button className="back" onClick={back}>‹</button>}
      <h2>{title}</h2>
      {action && <button className="primary mini" onClick={onAction}>{action}</button>}
      {right && <span className="pill gems">{right}</span>}
    </div>
  );
}

function ChoiceGrid({ title, options, value, setValue, icons }) {
  return (
    <section className="choice-section">
      <h2>{title}</h2>
      <div className="choice-grid">
        {options.map((option, index) => (
          <button className={value === option ? 'selected' : ''} key={option} onClick={() => setValue(option)}>
            <span>{icons[index]}</span>
            {option}
          </button>
        ))}
      </div>
    </section>
  );
}

function ToolRow({ tool, owned, buyAi }) {
  return (
    <article className="tool-row">
      <div
        className="tool-glyph asset-sprite"
        style={{ backgroundImage: `url(${assets.aiTools})`, backgroundPosition: spritePositions[aiToolIndex[tool.id] || 0] }}
      />
      <div><h3>{tool.name}</h3><p>{tool.role}</p></div>
      <button className={owned ? 'owned' : 'price'} onClick={() => buyAi(tool.id)}>{owned ? 'Activo' : `$${tool.price}/mes`}</button>
    </article>
  );
}

function ToolMini({ tool }) {
  return (
    <div className="tool-mini">
      <div
        className="tool-glyph asset-sprite"
        style={{ backgroundImage: `url(${assets.aiTools})`, backgroundPosition: spritePositions[aiToolIndex[tool.id] || 0] }}
      />
      <div><strong>{tool.name}</strong><span>{tool.role}</span></div>
      <small>Hoy</small>
    </div>
  );
}

function Message({ message }) {
  return (
    <div className="message-line">
      <span className={`tone ${message.tone}`}>{message.from[0]}</span>
      <div><strong>{message.from}</strong><p>{message.subject}</p></div>
      <small>{message.time}</small>
    </div>
  );
}

function Stat({ icon, label, value, green }) {
  return (
    <div className="stat">
      {icon && <span>{icon}</span>}
      <small>{label}</small>
      <strong className={green ? 'green' : ''}>{value}</strong>
    </div>
  );
}

function Stars({ value }) {
  const stars = Math.round(value / 20);
  return <div className="stars">{Array.from({ length: 5 }).map((_, index) => <span key={index} className={index < stars ? 'on' : ''}>★</span>)}</div>;
}

function Avatar({ type, label }) {
  return (
    <span
      className={`avatar portrait-avatar ${type}`}
      title={label}
      style={{ backgroundImage: `url(${assets.portraits})`, backgroundPosition: spritePositions[avatarIndex[type] || 0] }}
    />
  );
}

function BottomNav({ active, update }) {
  const items = [
    ['office', 'Oficina', 'office'],
    ['projects', 'Proyectos', 'projects'],
    ['ai', 'IA', 'ai'],
    ['employees', 'Empleados', 'employees'],
    ['store', 'Tienda', 'store']
  ];
  return (
    <nav className="bottom-nav">
      {items.map(([id, label, icon]) => (
        <button key={id} className={active === id || (id === 'projects' && (active === 'create' || active === 'project')) ? 'active' : ''} onClick={() => update({ activeTab: id })}>
          <span>{iconFor(icon)}</span>
          {label}
        </button>
      ))}
    </nav>
  );
}

function PixelOffice({ hero = false }) {
  return (
    <div className={`pixel-office has-asset ${hero ? 'hero' : ''}`}>
      <img className="scene-asset" src={hero ? assets.hero : assets.office} alt="" />
      <div className="window"><span /><span /></div>
      <div className="poster">CODE</div>
      <div className="shelf"><i /><i /><i /></div>
      <div className="plant"><i /><i /><i /></div>
      <div className="desk">
        <div className="monitor left">010<br />dev</div>
        <div className="monitor right">app<br />run</div>
        <div className="keyboard" />
      </div>
      <div className="coder"><Avatar type="devA" label="Coder" /></div>
      <div className="mug" />
      <div className="beanbag" />
    </div>
  );
}

function PixelLandscape() {
  return (
    <div className="pixel-landscape has-asset">
      <img className="scene-asset" src={assets.landscape} alt="" />
      <div className="cliff" />
      <div className="hero-sprite"><Avatar type="devC" label="Hero" /></div>
      {Array.from({ length: 7 }).map((_, index) => <span key={index} className={`tree t${index}`} />)}
      <div className="path" />
    </div>
  );
}

export default App;
