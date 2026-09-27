import { EmpireRoadmap } from '../components/Empire.jsx';
import { useGame } from '../components/GameContext.js';
import { PixelOffice } from '../components/Scenes.jsx';
import { Avatar, Bar, Stat } from '../components/ui.jsx';
import { currency } from '../game/format.js';
import {
  MAX_OFFICE_LEVEL,
  computeEconomy,
  freeServers,
  staffCapacity,
  staffMembers,
  upgradeCost,
  xpToNext
} from '../game/rules.js';

export function Office() {
  const { game, dispatch, navigate, ask } = useGame();
  const staff = staffMembers(game.staff);
  const capacity = staffCapacity(game.officeLevel);
  const { net } = computeEconomy(game);
  const maxed = game.officeLevel >= MAX_OFFICE_LEVEL;
  const cost = upgradeCost(game.officeLevel);
  const xpPercent = Math.floor((game.xp / xpToNext(game.level)) * 100);

  function upgrade() {
    ask({
      title: 'Mejorar oficina',
      text: `Pasar a nivel ${game.officeLevel + 1} cuesta ${currency(cost)}. Ganas 1 servidor, 2 plazas de empleado y más ingresos por contratos.`,
      confirmLabel: `Pagar ${currency(cost)}`,
      onConfirm: () => dispatch({ type: 'UPGRADE_OFFICE' })
    });
  }

  return (
    <div className="stack">
      <PixelOffice />
      <div className="stats-grid">
        <Stat label="Equipo" value={`${staff.length}/${capacity}`} icon="☻" />
        <Stat label="Servidores libres" value={`${freeServers(game)}/${game.maxServers}`} icon="▦" />
        <Stat label="Oficina" value={`Nivel ${game.officeLevel}`} icon="⌂" tone="green" />
        <Stat label="Neto/mes" value={currency(net)} icon="♜" tone={net < 0 ? 'negative' : 'green'} />
      </div>
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
          <button type="button" onClick={() => navigate('marketing')}>
            Marketing
          </button>
        </div>
      </section>
      <section className="panel">
        <h2>Equipo activo</h2>
        <div className="avatar-row">
          {staff.map((person) => (
            <Avatar key={person.id} person={person} />
          ))}
          {Array.from({ length: Math.max(0, capacity - staff.length) }).map((_, index) => (
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
      <EmpireRoadmap level={game.level} />
    </div>
  );
}
