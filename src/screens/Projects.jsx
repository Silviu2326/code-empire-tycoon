import { useState } from 'react';
import { useGame } from '../components/GameContext.js';
import { Bar, ProjectIcon, ScreenTitle, Tabs } from '../components/ui.jsx';
import { currency, formatDate } from '../game/format.js';
import { estimatedCompletion } from '../game/rules.js';

const filters = {
  dev: (project) => project.status === 'dev' || project.status === 'idea',
  completed: (project) => project.status === 'completed',
  cancelled: (project) => project.status === 'cancelled'
};

const emptyTexts = {
  dev: 'No tienes proyectos en desarrollo. ¡Crea uno!',
  completed: 'Todavía no has lanzado ningún proyecto.',
  cancelled: 'No has cancelado ningún proyecto.'
};

export function Projects() {
  const { game, navigate } = useGame();
  const [filter, setFilter] = useState('dev');
  const count = (key) => game.projects.filter(filters[key]).length;
  const visible = game.projects.filter(filters[filter]);

  function open(project) {
    if (project.status === 'idea') {
      navigate('create', {
        ideaId: project.id,
        draft: { name: project.name, genre: project.genre, style: project.style, size: project.size, techs: project.techs }
      });
    } else {
      navigate('project', { projectId: project.id });
    }
  }

  return (
    <div className="stack">
      <ScreenTitle
        title="Proyectos"
        right={
          <button type="button" className="primary mini" onClick={() => navigate('create')}>
            + Nuevo proyecto
          </button>
        }
      />
      <Tabs
        label="Filtrar proyectos"
        value={filter}
        onChange={setFilter}
        tabs={[
          { id: 'dev', label: 'En desarrollo', count: count('dev') },
          { id: 'completed', label: 'Completados', count: count('completed') },
          { id: 'cancelled', label: 'Cancelados', count: count('cancelled') }
        ]}
      />
      {visible.length === 0 && <p className="empty-state">{emptyTexts[filter]}</p>}
      {visible.map((project) => (
        <button type="button" className="project-card" key={project.id} onClick={() => open(project)}>
          <ProjectIcon project={project} locked={project.status === 'idea' || project.status === 'cancelled'} />
          <div className="project-info">
            <h3>{project.name}</h3>
            <p>
              {project.genre} • {project.style}
            </p>
            {project.status === 'idea' && <span className="muted">Idea: pulsa para empezar el desarrollo</span>}
            {project.status === 'dev' && (
              <>
                <Bar value={project.progress} label={`Progreso de ${project.name}`} />
                <small>Lanzamiento estimado: {formatDate(estimatedCompletion(project, game))}</small>
              </>
            )}
            {project.status === 'completed' && (
              <small>
                Ingresos totales {currency(project.revenue)} · {currency(project.monthlySales)}/mes
              </small>
            )}
            {project.status === 'cancelled' && <small>Cancelado</small>}
          </div>
          {project.status === 'dev' && <strong>{Math.round(project.progress)}%</strong>}
        </button>
      ))}
    </div>
  );
}
