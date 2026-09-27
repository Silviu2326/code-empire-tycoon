import { currency, formatDate, number } from '../game/format.js';
import { BANKRUPTCY_MONTHS, computeEconomy } from '../game/rules.js';
import { Modal } from './ui.jsx';

export function EconomyDialog({ game, onClose }) {
  const economy = computeEconomy(game);
  const rows = [
    ['Contratos y consultoría', economy.officeIncome],
    ['Ventas de productos', economy.productIncome],
    ['Salarios', -economy.salaries],
    ['Suscripciones de IA', -economy.aiCost]
  ];
  return (
    <Modal
      title="Balance mensual"
      onClose={onClose}
      actions={
        <button type="button" className="primary" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      <dl className="breakdown">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={value < 0 ? 'negative' : 'green'}>{currency(value)}</dd>
          </div>
        ))}
        <div className="total">
          <dt>Neto al mes</dt>
          <dd className={economy.net < 0 ? 'negative' : 'green'}>{currency(economy.net)}</dd>
        </div>
      </dl>
      <p className="hint">Los lanzamientos suman un pago único aparte el mes en que se completan.</p>
    </Modal>
  );
}

export function PauseMenu({ onResume, onOptions, onExit }) {
  return (
    <Modal title="Menú" onClose={onResume}>
      <div className="menu-list">
        <button type="button" className="primary" onClick={onResume}>
          Continuar
        </button>
        <button type="button" className="secondary" onClick={onOptions}>
          Opciones
        </button>
        <button type="button" className="secondary" onClick={onExit}>
          Guardar y salir al menú
        </button>
      </div>
    </Modal>
  );
}

export function OptionsDialog({ hasSave, onClearSave, onClose }) {
  return (
    <Modal
      title="Opciones"
      onClose={onClose}
      actions={
        <button type="button" className="primary" onClick={onClose}>
          Cerrar
        </button>
      }
    >
      <section className="options-section">
        <h3>Partida</h3>
        <p className="hint">La partida se guarda automáticamente en este navegador.</p>
        <button type="button" className="danger" disabled={!hasSave} onClick={onClearSave}>
          Borrar partida guardada
        </button>
      </section>
      <section className="options-section">
        <h3>Controles</h3>
        <p className="hint">Espacio: pausar o reanudar. Esc: cerrar ventanas.</p>
      </section>
      <section className="options-section">
        <h3>Créditos</h3>
        <p className="hint">Code Empire Tycoon v{__APP_VERSION__}. Hecho con React y Vite.</p>
      </section>
    </Modal>
  );
}

export function GameOverDialog({ game, onNewGame, onMenu }) {
  const launched = game.projects.filter((project) => project.status === 'completed').length;
  return (
    <Modal
      title="Bancarrota"
      actions={
        <>
          <button type="button" className="secondary" onClick={onMenu}>
            Menú principal
          </button>
          <button type="button" className="primary" onClick={onNewGame}>
            Nueva partida
          </button>
        </>
      }
    >
      <p>
        Tu estudio ha pasado {BANKRUPTCY_MONTHS} meses seguidos en números rojos y ha tenido que cerrar en {formatDate(game)}.
      </p>
      <dl className="breakdown">
        <div>
          <dt>Nivel alcanzado</dt>
          <dd>{game.level}</dd>
        </div>
        <div>
          <dt>Productos lanzados</dt>
          <dd>{launched}</dd>
        </div>
        <div>
          <dt>Seguidores</dt>
          <dd>{number(game.fans)}</dd>
        </div>
      </dl>
    </Modal>
  );
}
