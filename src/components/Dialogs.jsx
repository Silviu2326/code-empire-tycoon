import { useRef, useState } from 'react';
import { currency, formatDate, number } from '../game/format.js';
import { VICTORY_LEVEL } from '../data/catalog.js';
import { BANKRUPTCY_MONTHS, computeEconomy } from '../game/rules.js';
import { downloadSave, importSave } from '../game/save.js';
import { setTelemetryEnabled, telemetryConfigured, telemetryEnabled } from '../telemetry.js';
import { Modal } from './ui.jsx';

export function EconomyDialog({ game, onClose }) {
  const economy = computeEconomy(game);
  const rows = [
    ['Contratos y consultoría', economy.officeIncome],
    ['Ventas de productos', economy.productIncome],
    ['Salarios', -economy.salaries],
    ['Managers', -economy.managerCost],
    ['Suscripciones de IA', -economy.aiCost]
  ].filter(([label, value]) => value !== 0 || label === 'Salarios');
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
      {economy.investorShare > 0 && (
        <p className="hint">Los inversores se quedan {currency(economy.investorShare)} de tus ventas este mes.</p>
      )}
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

export function OptionsDialog({ exportable, onClearSave, onImport, onClose }) {
  const fileRef = useRef(null);
  const [importError, setImportError] = useState(null);

  async function readFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const result = importSave(await file.text());
    if (result.error) {
      setImportError(result.error);
    } else {
      setImportError(null);
      onImport(result.game);
    }
  }

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
        <p className="hint">
          La partida se guarda automáticamente en este navegador. Exporta un archivo para tener una copia o jugar en otro
          dispositivo.
        </p>
        <div className="option-buttons">
          <button type="button" className="secondary" disabled={!exportable} onClick={() => downloadSave(exportable)}>
            Exportar partida
          </button>
          <button type="button" className="secondary" onClick={() => fileRef.current?.click()}>
            Importar partida
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            aria-label="Archivo de partida"
            onChange={readFile}
          />
        </div>
        {importError && (
          <p className="hint negative" role="alert">
            {importError}
          </p>
        )}
        <button type="button" className="danger" disabled={!exportable} onClick={onClearSave}>
          Borrar partida guardada
        </button>
      </section>
      <section className="options-section">
        <h3>Controles</h3>
        <p className="hint">Espacio: pausar o reanudar. Tab: moverse entre botones. Esc: cerrar ventanas.</p>
      </section>
      {telemetryConfigured && <TelemetryOption />}
      <section className="options-section">
        <h3>Créditos y avisos legales</h3>
        <p className="hint">Code Empire Tycoon v{__APP_VERSION__}. © 2025-2026, todos los derechos reservados.</p>
        <p className="hint">
          Todas las empresas, productos, herramientas y personas que aparecen en el juego son ficticios. Cualquier parecido con la
          realidad es coincidencia.
        </p>
        <p className="hint">Hecho con React y React DOM (licencia MIT) y Vite (licencia MIT).</p>
        <p className="hint">
          <a href="./privacidad.html" target="_blank" rel="noopener">
            Política de privacidad
          </a>
        </p>
      </section>
    </Modal>
  );
}

function TelemetryOption() {
  const [enabled, setEnabled] = useState(telemetryEnabled);
  return (
    <section className="options-section">
      <h3>Privacidad</h3>
      <label className="toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => {
            setTelemetryEnabled(event.target.checked);
            setEnabled(telemetryEnabled());
          }}
        />
        Enviar estadísticas anónimas y errores
      </label>
      <p className="hint">Nos ayuda a mejorar el juego. No incluye datos personales ni cookies.</p>
    </section>
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

export function IntroDialog({ onClose }) {
  return (
    <Modal
      title="Bienvenida a Code Empire"
      onClose={onClose}
      actions={
        <button type="button" className="primary" onClick={onClose}>
          ¡A programar!
        </button>
      }
    >
      <p>Empiezas en tu habitación, con un portátil y una idea: Code Quest.</p>
      <p>
        <strong>Objetivo:</strong> llega al nivel {VICTORY_LEVEL} («Imperio tecnológico») sin que el estudio quiebre.
      </p>
      <p>
        <strong>Cómo se pierde:</strong> {BANKRUPTCY_MONTHS} meses seguidos con la cuenta en negativo.
      </p>
      <p>Cada mes cobras contratos, pagas salarios y avanzan tus proyectos. Sigue los objetivos de la Oficina para empezar.</p>
    </Modal>
  );
}

export function VictoryDialog({ game, onContinue, onMenu }) {
  const launched = game.projects.filter((project) => project.status === 'completed').length;
  return (
    <Modal
      title="¡Imperio construido!"
      onClose={onContinue}
      actions={
        <>
          <button type="button" className="secondary" onClick={onMenu}>
            Menú principal
          </button>
          <button type="button" className="primary" onClick={onContinue}>
            Seguir jugando
          </button>
        </>
      }
    >
      <p className="victory-title">Has llevado tu estudio de la habitación a la cima en {formatDate(game)}.</p>
      <dl className="breakdown">
        <div>
          <dt>Productos lanzados</dt>
          <dd>{launched}</dd>
        </div>
        <div>
          <dt>Seguidores</dt>
          <dd>{number(game.fans)}</dd>
        </div>
        <div>
          <dt>Dinero</dt>
          <dd>{currency(game.money)}</dd>
        </div>
      </dl>
    </Modal>
  );
}
