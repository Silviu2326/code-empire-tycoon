import { currency, formatDate, number } from '../game/format.js';
import { computeEconomy } from '../game/rules.js';
import { useGame } from './GameContext.js';
import { Icon } from './Icons.jsx';

export function TopBar({ onOpenMenu, onOpenEconomy }) {
  const { game, dispatch } = useGame();
  const { net } = computeEconomy(game);
  return (
    <header className="topbar">
      <div className="pill star" title="Nivel del estudio">
        ★ Nivel {game.level}
      </div>
      <div className={game.money < 0 ? 'pill money negative' : 'pill money'} title="Dinero">
        ◎ {currency(game.money)}
      </div>
      <div className="pill gems" title="Gemas">
        ◆ {number(game.gems)}
      </div>
      <button type="button" className="square" onClick={onOpenMenu} aria-label="Menú">
        <Icon name="menu" size={20} />
      </button>
      <div className="calendar">{formatDate(game)}</div>
      <button
        type="button"
        className="square"
        onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
        aria-label={game.paused ? 'Reanudar (espacio)' : 'Pausar (espacio)'}
        aria-pressed={game.paused}
      >
        {game.paused ? '▶' : 'Ⅱ'}
      </button>
      <button
        type="button"
        className="square"
        onClick={() => dispatch({ type: 'CYCLE_SPEED' })}
        aria-label={`Velocidad ${game.speed}x, pulsa para cambiar`}
      >
        {game.speed}x
      </button>
      <button
        type="button"
        className={net < 0 ? 'pill income negative' : 'pill income'}
        onClick={onOpenEconomy}
        aria-label={`Balance mensual ${currency(net)}. Ver desglose`}
      >
        {net >= 0 ? '+' : ''}
        {currency(net)}/mes
      </button>
    </header>
  );
}

const navItems = [
  ['office', 'Oficina'],
  ['projects', 'Proyectos'],
  ['ai', 'IA'],
  ['employees', 'Empleados'],
  ['marketing', 'Marketing']
];

const tabGroup = { create: 'projects', project: 'projects' };

export function BottomNav() {
  const { ui, navigate } = useGame();
  const current = tabGroup[ui.tab] || ui.tab;
  return (
    <nav className="bottom-nav" aria-label="Secciones">
      {navItems.map(([id, label]) => (
        <button
          type="button"
          key={id}
          className={current === id ? 'active' : ''}
          aria-current={current === id ? 'page' : undefined}
          onClick={() => navigate(id)}
        >
          <span>
            <Icon name={id} />
          </span>
          {label}
        </button>
      ))}
    </nav>
  );
}
