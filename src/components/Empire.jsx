import { assets } from '../data/assets.js';
import { empireStages, specialEvents } from '../data/catalog.js';
import { stageIndex } from '../game/rules.js';

export function EmpireRoadmap({ level }) {
  const unlocked = stageIndex(level);
  return (
    <section className="panel empire-roadmap">
      <div className="section-head">
        <h2>Ruta del imperio</h2>
        <span className="mini-tag">Etapa {unlocked + 1}/5</span>
      </div>
      <div className="founder-split">
        <img src={assets.founder.early} alt="El fundador al empezar" />
        <div>
          <strong>De vive coder</strong>
          <span>A fundador que empieza solo y escala con cada proyecto.</span>
        </div>
        <img src={assets.founder.ceo} alt="El fundador como CEO" />
      </div>
      <div className="stage-strip">
        {empireStages.map((stage, index) => (
          <article className={index <= unlocked ? 'stage-card unlocked' : 'stage-card'} key={stage.title}>
            <img src={assets.stages[index]} alt="" loading="lazy" />
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

function ComingSoon() {
  return <span className="mini-tag soon">Próximamente</span>;
}

export function EmpireAssets() {
  return (
    <section className="panel">
      <div className="section-head">
        <h2>Expansión empresarial</h2>
        <ComingSoon />
      </div>
      <div className="empire-grid">
        <article className="asset-banner">
          <img src={assets.empire.globalMap} alt="" loading="lazy" />
          <div>
            <h3>Mercado global</h3>
            <p>Desbloquea regiones, fans y ventas internacionales.</p>
          </div>
        </article>
        <article className="asset-banner">
          <img src={assets.empire.dataCenter} alt="" loading="lazy" />
          <div>
            <h3>Data center propio</h3>
            <p>Sube la capacidad para IA, multijugador y SaaS.</p>
          </div>
        </article>
      </div>
      <div className="asset-sheet-row">
        {[
          [assets.empire.upgrades, 'Upgrades'],
          [assets.empire.products, 'Productos'],
          [assets.empire.executives, 'Managers']
        ].map(([image, title]) => (
          <article className="asset-sheet" key={title}>
            <img src={image} alt="" loading="lazy" />
            <strong>{title}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export function EmpireEvents() {
  return (
    <section className="panel">
      <div className="section-head">
        <h2>Eventos de imperio</h2>
        <ComingSoon />
      </div>
      <div className="event-gallery">
        {specialEvents.map((event, index) => (
          <article className="event-card" key={event.title}>
            <img src={assets.events[index]} alt="" loading="lazy" />
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
