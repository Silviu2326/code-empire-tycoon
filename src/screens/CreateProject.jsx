import { useState } from 'react';
import { useGame } from '../components/GameContext.js';
import { ChoiceGrid, ScreenTitle } from '../components/ui.jsx';
import { defaultDraft, genres, sizes, styles, techs } from '../data/catalog.js';
import { currency } from '../game/format.js';
import { draftProblems, projectFromDraft } from '../game/rules.js';

export function CreateProject() {
  const { game, dispatch, ui, navigate } = useGame();
  const [draft, setDraft] = useState(() => ({ ...defaultDraft, ...ui.draft }));
  const project = projectFromDraft(draft);
  const problems = draftProblems(draft, game);
  const set = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));

  function toggleTech(id) {
    setDraft((current) => ({
      ...current,
      techs: current.techs.includes(id) ? current.techs.filter((tech) => tech !== id) : [...current.techs, id]
    }));
  }

  function create() {
    if (problems.length) return;
    const newId = `p${game.nextId}`;
    dispatch({ type: 'CREATE_PROJECT', draft, ideaId: ui.ideaId });
    navigate('project', { projectId: newId });
  }

  return (
    <div className="stack">
      <ScreenTitle title={ui.ideaId ? 'Desarrollar idea' : 'Crear nuevo proyecto'} back={() => navigate('projects')} />
      <label className="field-label" htmlFor="project-name">
        Nombre del proyecto
      </label>
      <input
        id="project-name"
        className="text-input"
        value={draft.name}
        maxLength={40}
        onChange={(event) => set('name')(event.target.value)}
      />
      <ChoiceGrid title="Género" value={draft.genre} onChange={set('genre')} options={genres} />
      <ChoiceGrid title="Estilo gráfico" value={draft.style} onChange={set('style')} options={styles} />
      <ChoiceGrid
        title="Tamaño del proyecto"
        value={draft.size}
        onChange={set('size')}
        options={sizes.map((size) => ({ ...size, label: `${size.id} · ${currency(size.cost)}` }))}
      />
      <section className="panel">
        <h2>Tecnologías</h2>
        <div className="tech-list">
          {techs.map((tech) => {
            const selected = draft.techs.includes(tech.id);
            return (
              <button
                type="button"
                key={tech.id}
                className={selected ? 'tech selected' : 'tech'}
                aria-pressed={selected}
                onClick={() => toggleTech(tech.id)}
              >
                <strong>{tech.name}</strong>
                <small>
                  {tech.effect} · {tech.cost ? currency(tech.cost) : 'Gratis'}
                </small>
              </button>
            );
          })}
        </div>
      </section>
      <section className="panel summary">
        <div className="cost-row">
          <span>Coste inicial</span>
          <strong>{currency(project.cost)}</strong>
        </div>
        <div className="cost-row">
          <span>Calidad inicial</span>
          <strong>{project.quality}</strong>
        </div>
        <div className="cost-row">
          <span>Dificultad</span>
          <strong>{project.difficulty.toFixed(2)}</strong>
        </div>
        <div className="cost-row">
          <span>Recompensa base</span>
          <strong className="green">{currency(project.reward)}</strong>
        </div>
      </section>
      <button type="button" className="primary big" disabled={problems.length > 0} onClick={create}>
        Crear proyecto
      </button>
      {problems.map((problem) => (
        <p className="hint" key={problem}>
          {problem}
        </p>
      ))}
    </div>
  );
}
