import { useGame } from '../components/GameContext.js';
import { ExecutivePortrait, GridSprite, ScreenTitle } from '../components/ui.jsx';
import { assets, imageSize } from '../data/assets.js';
import { empireStages, managers, upgrades } from '../data/catalog.js';
import { currency } from '../game/format.js';
import { empireEvents } from '../game/events.js';
import { stageIndex } from '../game/rules.js';

export function Empire() {
  const { navigate } = useGame();
  return (
    <div className="stack">
      <ScreenTitle title="Imperio" back={() => navigate('office')} />
      <Roadmap />
      <Managers />
      <Upgrades />
      <Events />
    </div>
  );
}

function Roadmap() {
  const { game } = useGame();
  const unlocked = stageIndex(game.level);
  return (
    <section className="panel empire-roadmap">
      <div className="section-head">
        <h2>Ruta del imperio</h2>
        <span className="mini-tag">
          Etapa {unlocked + 1}/{empireStages.length}
        </span>
      </div>
      <div className="founder-split">
        <img src={assets.founder.early} alt="El fundador al empezar" {...imageSize.founder} />
        <div>
          <strong>De vibe coder a CEO</strong>
          <span>Llega a la etapa «Imperio tecnológico» (nivel 15) sin quebrar para ganar la partida.</span>
        </div>
        <img src={assets.founder.ceo} alt="El fundador como CEO" {...imageSize.founder} />
      </div>
      <div className="stage-strip">
        {empireStages.map((stage, index) => (
          <article className={index <= unlocked ? 'stage-card unlocked' : 'stage-card'} key={stage.title}>
            <img src={assets.stages[index]} alt="" {...imageSize.scene} loading="lazy" />
            <div>
              <small>
                Nivel {stage.level} {index <= unlocked ? '· desbloqueada' : ''}
              </small>
              <h3>{stage.title}</h3>
              <p>{stage.subtitle}</p>
              <div className="perks">
                {stage.perks.map((perk) => (
                  <span key={perk}>{perk}</span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function lockText(minStage) {
  const stage = empireStages[minStage];
  return `Desde ${stage.title} (nivel ${stage.level})`;
}

function Managers() {
  const { game, dispatch, ask } = useGame();
  const stage = stageIndex(game.level);
  return (
    <section className="panel">
      <h2>Managers</h2>
      <p className="hint">Cobran cada mes y mejoran todo el estudio.</p>
      {managers.map((manager) => {
        const hired = game.managers.includes(manager.id);
        const locked = stage < manager.minStage;
        return (
          <div className="shop-row" key={manager.id}>
            <ExecutivePortrait index={manager.sprite} label={manager.role} />
            <div>
              <h3>{manager.role}</h3>
              <p>{manager.effect}</p>
              <p>{locked ? lockText(manager.minStage) : `${currency(manager.salary)}/mes`}</p>
            </div>
            {hired ? (
              <button
                type="button"
                className="text-danger"
                onClick={() =>
                  ask({
                    title: `Despedir: ${manager.role}`,
                    text: 'Perderás su bonus y dejarás de pagar su salario.',
                    confirmLabel: 'Despedir',
                    danger: true,
                    onConfirm: () => dispatch({ type: 'FIRE_MANAGER', managerId: manager.id })
                  })
                }
              >
                Despedir
              </button>
            ) : (
              <button
                type="button"
                className="small-button"
                disabled={locked || game.money < manager.salary}
                onClick={() =>
                  ask({
                    title: `Contratar: ${manager.role}`,
                    text: `${manager.effect}. Cobrará ${currency(manager.salary)} al mes.`,
                    confirmLabel: 'Contratar',
                    onConfirm: () => dispatch({ type: 'HIRE_MANAGER', managerId: manager.id })
                  })
                }
              >
                {locked ? 'Bloqueado' : 'Contratar'}
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}

function Upgrades() {
  const { game, dispatch, ask } = useGame();
  const stage = stageIndex(game.level);
  return (
    <section className="panel">
      <h2>Expansión y mejoras</h2>
      <p className="hint">Pago único, efecto permanente.</p>
      {upgrades.map((upgrade) => {
        const owned = game.upgrades.includes(upgrade.id);
        const locked = stage < upgrade.minStage;
        return (
          <div className="shop-row" key={upgrade.id}>
            <GridSprite image={assets.empire.upgrades} index={upgrade.sprite} />
            <div>
              <h3>{upgrade.name}</h3>
              <p>{upgrade.effect}</p>
              {locked && <p>{lockText(upgrade.minStage)}</p>}
            </div>
            {owned ? (
              <span className="owned">Comprada</span>
            ) : (
              <button
                type="button"
                className="small-button"
                disabled={locked || game.money < upgrade.cost}
                onClick={() =>
                  ask({
                    title: upgrade.name,
                    text: `${upgrade.effect}. Cuesta ${currency(upgrade.cost)} una sola vez.`,
                    confirmLabel: `Comprar por ${currency(upgrade.cost)}`,
                    onConfirm: () => dispatch({ type: 'BUY_UPGRADE', upgradeId: upgrade.id })
                  })
                }
              >
                {locked ? 'Bloqueada' : currency(upgrade.cost)}
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}

function Events() {
  const { game, navigate } = useGame();
  const fired = game.firedEvents || [];
  const statusOf = (event) => {
    if (!fired.includes(event.id)) return { text: `Requisito: ${event.hint}`, locked: true };
    const message = game.messages.find((item) => item.eventId === event.id);
    if (message && message.choice === undefined) return { text: 'Pendiente de decisión: revisa tus mensajes', locked: false };
    return { text: 'Completado', locked: false };
  };
  return (
    <section className="panel">
      <div className="section-head">
        <h2>Eventos de imperio</h2>
        <button type="button" className="small-button" onClick={() => navigate('marketing')}>
          Mensajes
        </button>
      </div>
      <div className="event-gallery">
        {empireEvents.map((event) => {
          const status = statusOf(event);
          return (
            <article className={status.locked ? 'event-card locked' : 'event-card'} key={event.id}>
              <img src={assets.events[event.image]} alt="" {...imageSize.event} loading="lazy" />
              <div>
                <h3>{event.title}</h3>
                <p>{event.subtitle}</p>
                <span className="status">{status.text}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
