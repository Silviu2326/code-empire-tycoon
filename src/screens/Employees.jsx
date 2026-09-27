import { useGame } from '../components/GameContext.js';
import { Avatar, ScreenTitle } from '../components/ui.jsx';
import { currency } from '../game/format.js';
import { CANDIDATE_ROTATION_MONTHS, availableCandidates, projectOfStaff, staffCapacity, staffMembers } from '../game/rules.js';

function Skills({ person }) {
  return (
    <small>
      <span title="Código">💻 {person.code}</span> &nbsp; <span title="Arte">🎨 {person.art}</span> &nbsp;{' '}
      <span title="IA">🤖 {person.ai}</span>
    </small>
  );
}

export function Employees() {
  const { game, dispatch, ask, navigate } = useGame();
  const staff = staffMembers(game.staff);
  const capacity = staffCapacity(game.officeLevel);
  const full = staff.length >= capacity;
  const nextRotation = CANDIDATE_ROTATION_MONTHS - (game.elapsed % CANDIDATE_ROTATION_MONTHS);

  function fire(person) {
    ask({
      title: `Despedir a ${person.name}`,
      text: `Dejarás de pagar ${currency(person.salary)} al mes y saldrá de su proyecto. Puede que no vuelva a estar disponible.`,
      confirmLabel: 'Despedir',
      danger: true,
      onConfirm: () => dispatch({ type: 'FIRE', staffId: person.id })
    });
  }

  function hire(person) {
    ask({
      title: `Contratar a ${person.name}`,
      text: `Cobrará ${currency(person.salary)} al mes, a partir del mes que viene.`,
      confirmLabel: 'Contratar',
      onConfirm: () => dispatch({ type: 'HIRE', staffId: person.id })
    });
  }

  return (
    <div className="stack">
      <ScreenTitle
        title="Empleados"
        right={
          <span className="mini-tag">
            Plazas {staff.length}/{capacity}
          </span>
        }
      />
      <h3 className="eyebrow">Tu equipo</h3>
      {staff.length === 0 && <p className="empty-state">Aún no tienes empleados.</p>}
      {staff.map((person) => {
        const project = projectOfStaff(game, person.id);
        return (
          <article className="person-card" key={person.id}>
            <Avatar person={person} />
            <div>
              <h3>{person.name}</h3>
              <p>
                {person.job} · {project ? `En ${project.name}` : 'Sin proyecto'}
              </p>
              <Skills person={person} />
            </div>
            <div className="card-actions">
              {project ? (
                <button type="button" className="small-button" onClick={() => navigate('project', { projectId: project.id })}>
                  Ver proyecto
                </button>
              ) : null}
              <button type="button" className="text-danger" onClick={() => fire(person)}>
                Despedir
              </button>
            </div>
          </article>
        );
      })}
      <h3 className="eyebrow">Candidatos</h3>
      <p className="hint">
        {full ? 'No quedan plazas libres: mejora la oficina para contratar a más gente. ' : ''}
        Nuevos candidatos en {nextRotation} {nextRotation === 1 ? 'mes' : 'meses'}.
      </p>
      {availableCandidates(game).map((person) => (
        <article className="person-card" key={person.id}>
          <Avatar person={person} />
          <div>
            <h3>{person.name}</h3>
            <p>{person.job}</p>
            <Skills person={person} />
          </div>
          <button type="button" className="hire" disabled={full || game.money < person.salary} onClick={() => hire(person)}>
            {currency(person.salary)}/mes
          </button>
        </article>
      ))}
    </div>
  );
}
