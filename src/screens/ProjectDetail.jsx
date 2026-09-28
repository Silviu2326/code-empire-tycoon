import { useState } from 'react';
import { useGame } from '../components/GameContext.js';
import { PixelLandscape } from '../components/Scenes.jsx';
import { Avatar, Bar, ScreenTitle, Stars, Tabs, ToolIcon } from '../components/ui.jsx';
import { currency, formatDate } from '../game/format.js';
import {
  CANCEL_REFUND,
  SPRINT_GEMS,
  SPRINT_PROGRESS,
  estimateMonthsLeft,
  estimatedCompletion,
  launchRevenue,
  marketSaturation,
  monthlyGain,
  projectOfStaff,
  recentLaunches,
  staffMembers,
  toolsFor
} from '../game/rules.js';

const statusLabels = { dev: 'En desarrollo', completed: 'A la venta', cancelled: 'Cancelado', idea: 'Idea' };

export function ProjectDetail() {
  const { game, ui, navigate } = useGame();
  const [tab, setTab] = useState('summary');
  const project = game.projects.find((item) => item.id === ui.projectId);

  if (!project) {
    return (
      <div className="stack">
        <ScreenTitle title="Proyecto" back={() => navigate('projects')} />
        <p className="empty-state">Este proyecto ya no existe.</p>
      </div>
    );
  }

  const isDev = project.status === 'dev';
  return (
    <div className="stack">
      <ScreenTitle
        title={project.name}
        back={() => navigate('projects')}
        right={<span className="mini-tag">{statusLabels[project.status]}</span>}
      />
      <Tabs
        label="Secciones del proyecto"
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'summary', label: 'Resumen' },
          { id: 'team', label: 'Equipo' },
          { id: 'analysis', label: 'Análisis' }
        ]}
      />
      {tab === 'summary' && <Summary project={project} isDev={isDev} openTeam={() => setTab('team')} />}
      {tab === 'team' && <TeamTab project={project} isDev={isDev} />}
      {tab === 'analysis' && <Analysis project={project} isDev={isDev} />}
    </div>
  );
}

function Summary({ project, isDev, openTeam }) {
  const { game, dispatch, ask, navigate } = useGame();
  const team = staffMembers(project.team);
  const tools = toolsFor(project.ai);

  function cancel() {
    ask({
      title: `Cancelar ${project.name}`,
      text: `Se perderá el progreso, el equipo quedará libre y recuperarás ${currency(project.spent * CANCEL_REFUND)} (${CANCEL_REFUND * 100}% de lo invertido).`,
      confirmLabel: 'Cancelar proyecto',
      cancelLabel: 'Volver',
      danger: true,
      onConfirm: () => {
        dispatch({ type: 'CANCEL_PROJECT', projectId: project.id });
        navigate('projects');
      }
    });
  }

  return (
    <>
      <PixelLandscape />
      <div className="progress-line">
        <span>Progreso general</span>
        <strong>{Math.round(project.progress)}%</strong>
      </div>
      <Bar value={project.progress} big label="Progreso general" />
      <div className="quality-row">
        <span>Calidad</span>
        <Stars value={project.quality} />
      </div>
      {isDev && (
        <p className="hint">
          Lanzamiento estimado: {formatDate(estimatedCompletion(project, game))} ({estimateMonthsLeft(project, game)}{' '}
          {estimateMonthsLeft(project, game) === 1 ? 'mes' : 'meses'})
        </p>
      )}
      <section className="panel">
        <h2>Equipo asignado</h2>
        <div className="avatar-row">
          {team.map((person) => (
            <Avatar key={person.id} person={person} />
          ))}
          {isDev && (
            <button type="button" className="empty-slot" aria-label="Asignar equipo" onClick={openTeam}>
              +
            </button>
          )}
          {team.length === 0 && !isDev && <span className="muted">Sin equipo</span>}
        </div>
      </section>
      <section className="panel">
        <h2>IA asignada</h2>
        {tools.length === 0 && <p className="muted">Ninguna herramienta asignada.</p>}
        {tools.map((tool) => (
          <div className="tool-mini" key={tool.id}>
            <ToolIcon tool={tool} />
            <div>
              <strong>{tool.name}</strong>
              <span>{tool.role}</span>
            </div>
            <small>+{tool.boost}</small>
          </div>
        ))}
      </section>
      {isDev && game.paused && (
        <button type="button" className="primary big" onClick={() => dispatch({ type: 'SET_PAUSED', paused: false })}>
          Reanudar desarrollo
        </button>
      )}
      {isDev && (
        <button
          type="button"
          className="secondary"
          disabled={game.gems < SPRINT_GEMS || project.progress >= 99}
          onClick={() =>
            ask({
              title: 'Sprint',
              text: `El equipo hace un esfuerzo extra: +${SPRINT_PROGRESS}% de progreso al momento por ${SPRINT_GEMS} gemas.`,
              confirmLabel: `Gastar ◆ ${SPRINT_GEMS}`,
              onConfirm: () => dispatch({ type: 'SPRINT', projectId: project.id })
            })
          }
        >
          Sprint +{SPRINT_PROGRESS}% (◆ {SPRINT_GEMS})
        </button>
      )}
      {isDev && (
        <button type="button" className="danger" onClick={cancel}>
          Cancelar proyecto
        </button>
      )}
    </>
  );
}

function TeamTab({ project, isDev }) {
  const { game, dispatch, navigate } = useGame();
  const staff = staffMembers(game.staff);
  const tools = toolsFor(game.ownedAi);

  if (!isDev) {
    return <p className="empty-state">El equipo solo se puede cambiar mientras el proyecto está en desarrollo.</p>;
  }

  return (
    <>
      <section className="panel">
        <h2>Empleados</h2>
        <p className="hint">Cada persona trabaja en un solo proyecto a la vez.</p>
        {staff.length === 0 && (
          <button type="button" className="secondary" onClick={() => navigate('employees')}>
            Contratar empleados
          </button>
        )}
        {staff.map((person) => {
          const assigned = project.team.includes(person.id);
          const other = !assigned && projectOfStaff(game, person.id);
          return (
            <div className="assign-row" key={person.id}>
              <Avatar person={person} />
              <div>
                <strong>{person.name}</strong>
                <small>{other ? `Ahora en ${other.name}` : person.job}</small>
              </div>
              <button
                type="button"
                className={assigned ? 'owned' : 'small-button'}
                aria-pressed={assigned}
                onClick={() => dispatch({ type: 'TOGGLE_STAFF_ON_PROJECT', projectId: project.id, staffId: person.id })}
              >
                {assigned ? 'Asignado' : other ? 'Mover aquí' : 'Asignar'}
              </button>
            </div>
          );
        })}
      </section>
      <section className="panel">
        <h2>Herramientas de IA</h2>
        {tools.length === 0 && (
          <button type="button" className="secondary" onClick={() => navigate('ai')}>
            Activar herramientas de IA
          </button>
        )}
        {tools.map((tool) => {
          const assigned = project.ai.includes(tool.id);
          return (
            <div className="assign-row" key={tool.id}>
              <ToolIcon tool={tool} />
              <div>
                <strong>{tool.name}</strong>
                <small>+{tool.boost} de impulso</small>
              </div>
              <button
                type="button"
                className={assigned ? 'owned' : 'small-button'}
                aria-pressed={assigned}
                onClick={() => dispatch({ type: 'TOGGLE_AI_ON_PROJECT', projectId: project.id, toolId: tool.id })}
              >
                {assigned ? 'En uso' : 'Usar'}
              </button>
            </div>
          );
        })}
      </section>
    </>
  );
}

function Analysis({ project, isDev }) {
  const { game } = useGame();
  const rows = [['Inversión', currency(project.spent)]];
  if (isDev) {
    const gain = monthlyGain(project, game);
    rows.push(
      ['Avance al mes', `${gain.progress.toFixed(1)}%`],
      ['Mejora de calidad al mes', `+${gain.quality.toFixed(1)}`],
      ['Meses restantes', estimateMonthsLeft(project, game)],
      ['Ingresos estimados del lanzamiento', currency(launchRevenue(project, game))],
      [
        'Saturación del mercado',
        `${recentLaunches(game)} lanzamientos en 12 meses (${Math.round((1 - marketSaturation(game)) * 100)}% menos ventas)`
      ]
    );
  }
  if (project.status === 'completed') {
    rows.push(
      ['Lanzado en', formatDate(project.completedAt)],
      ['Ingresos del lanzamiento', currency(project.launchRevenue)],
      ['Ventas este mes', currency(project.monthlySales)],
      ['Ingresos totales', currency(project.revenue)]
    );
  }
  rows.push(['Dificultad', project.difficulty.toFixed(2)], ['Tecnologías', project.techs.length || 'Ninguna']);
  return (
    <section className="panel">
      <dl className="breakdown">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
