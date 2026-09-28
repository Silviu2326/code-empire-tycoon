import { useGame } from '../components/GameContext.js';
import { PixelOffice } from '../components/Scenes.jsx';
import { Avatar, Bar, Stat } from '../components/ui.jsx';
import { empireStages } from '../data/catalog.js';
import { currency } from '../game/format.js';
import { pendingActions } from '../game/advice.js';
import { goals } from '../game/goals.js';
import {
  MAX_OFFICE_LEVEL,
  computeEconomy,
  freeServers,
  hiredStaff,
  serverCapacity,
  stageIndex,
  staffCapacity,
  staffMembers,
  upgradeCost,
  xpToNext
} from '../game/rules.js';

export function Office() {
  const { game, dispatch, navigate, ask } = useGame();
  const staff = staffMembers(game.staff);
  const hired = hiredStaff(game).length;
  const capacity = staffCapacity(game);
  const { net } = computeEconomy(game);
  const maxed = game.officeLevel >= MAX_OFFICE_LEVEL;
  const cost = upgradeCost(game.officeLevel);
  const xpPercent = Math.floor((game.xp / xpToNext(game.level)) * 100);
  const stage = stageIndex(game.level);

  function upgrade() {
    ask({
      title: 'Mejorar oficina',
      text: `Pasar a nivel ${game.officeLevel + 1} cuesta ${currency(cost)}. Ganas 1 servidor, 1 plaza de empleado y más ingresos por contratos.`,
      confirmLabel: `Pagar ${currency(cost)}`,
      onConfirm: () => dispatch({ type: 'UPGRADE_OFFICE' })
    });
  }

  return (
    <div className="stack">
      <PixelOffice stage={stage} />
      <div className="stats-grid">
        <Stat label="Equipo" value={`${hired}/${capacity}`} icon="☻" />
        <Stat label="Servidores libres" value={`${freeServers(game)}/${serverCapacity(game)}`} icon="▦" />
        <Stat label="Oficina" value={`Nivel ${game.officeLevel}`} icon="⌂" tone="green" />
        <Stat label="Neto/mes" value={currency(net)} icon="♜" tone={net < 0 ? 'negative' : 'green'} />
      </div>
      <Todo />
      <Goals />
      <section className="panel">
        <div className="section-head">
          <h2>Estudio</h2>
          <button type="button" className="small-button" disabled={maxed || game.money < cost} onClick={upgrade}>
            {maxed ? 'Nivel máximo' : `Mejorar ${currency(cost)}`}
          </button>
        </div>
        <div className="progress-line">
          <span>Experiencia hacia nivel {game.level + 1}</span>
          <strong>{xpPercent}%</strong>
        </div>
        <Bar value={xpPercent} label="Experiencia" />
        <div className="office-actions">
          <button type="button" onClick={() => navigate('create')}>
            Crear proyecto
          </button>
          <button type="button" onClick={() => navigate('empire')}>
            Imperio
          </button>
        </div>
      </section>
      <section className="panel">
        <h2>Equipo activo</h2>
        <div className="avatar-row">
          {staff.map((person) => (
            <Avatar key={person.id} person={person} />
          ))}
          {Array.from({ length: Math.max(0, capacity - hired) }).map((_, index) => (
            <button
              type="button"
              key={index}
              className="empty-slot"
              aria-label="Contratar empleado"
              onClick={() => navigate('employees')}
            >
              +
            </button>
          ))}
        </div>
      </section>
      <StageSummary stage={stage} onOpen={() => navigate('empire')} />
    </div>
  );
}

function Todo() {
  const { game, navigate } = useGame();
  const actions = pendingActions(game);
  if (actions.length === 0) return null;
  return (
    <section className="panel">
      <div className="section-head">
        <h2>Por hacer</h2>
        <span className="mini-tag">{actions.length}</span>
      </div>
      <div className="todo-list">
        {actions.map((action) =>
          action.tab ? (
            <button type="button" key={action.id} onClick={() => navigate(action.tab, action.extra)}>
              <span className={`dot tone ${action.tone}`} aria-hidden="true" />
              <span>{action.text}</span>
              <span className="arrow" aria-hidden="true">
                ›
              </span>
            </button>
          ) : (
            <p key={action.id}>
              <span className={`dot tone ${action.tone}`} aria-hidden="true" />
              <span>{action.text}</span>
            </p>
          )
        )}
      </div>
    </section>
  );
}

function Goals() {
  const { game } = useGame();
  const done = game.goalsDone || [];
  if (goals.every((goal) => done.includes(goal.id))) return null;
  return (
    <section className="panel">
      <div className="section-head">
        <h2>Objetivos</h2>
        <span className="mini-tag">
          {done.length}/{goals.length}
        </span>
      </div>
      <ul className="goal-list">
        {goals.map((goal) => {
          const isDone = done.includes(goal.id);
          return (
            <li key={goal.id} className={isDone ? 'done' : ''}>
              <span className="check" aria-hidden="true">
                {isDone ? '✓' : ''}
              </span>
              <div>
                <strong>{goal.title}</strong>
                {!isDone && <small>{goal.hint}</small>}
              </div>
              <span className="reward">◆ {goal.gems}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StageSummary({ stage, onOpen }) {
  const current = empireStages[stage];
  const next = empireStages[stage + 1];
  return (
    <section className="panel">
      <div className="stage-banner">
        <div>
          <small className="muted">
            Etapa {stage + 1}/{empireStages.length}
          </small>
          <h2>{current.title}</h2>
          <p>{next ? `Siguiente: ${next.title} en el nivel ${next.level}.` : 'Has llegado a la cima.'}</p>
        </div>
        <button type="button" className="small-button" onClick={onOpen}>
          Ver imperio
        </button>
      </div>
    </section>
  );
}
