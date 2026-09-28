import { PixelOffice } from '../components/Scenes.jsx';
import { formatDate } from '../game/format.js';

const saveNotices = {
  outdated: 'Tu partida guardada es de una versión anterior y no es compatible. Empieza una nueva.',
  corrupt: 'No se ha podido leer la partida guardada. Empieza una nueva.'
};

function savedAgo(timestamp) {
  const minutes = Math.round((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'guardada ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  return new Date(timestamp).toLocaleDateString('es-ES');
}

export function StartScreen({ save, onNew, onLoad, onOptions }) {
  const notice = saveNotices[save.status];
  return (
    <main className="start-shell">
      <section className="start-card">
        <div className="version">v{__APP_VERSION__}</div>
        <button type="button" className="gear" aria-label="Opciones" onClick={onOptions}>
          ⚙
        </button>
        <PixelOffice hero />
        <div className="logo-block">
          <h1>
            &lt;Code
            <br />
            <span>Empire</span>
            <br />
            <strong>Tycoon&gt;</strong>
          </h1>
          <p>Construye tu imperio. Escribe tu legado.</p>
        </div>
        {notice && (
          <p className="start-notice" role="status">
            {notice}
          </p>
        )}
        <div className="start-actions">
          <button type="button" className="primary big" onClick={onNew}>
            Nueva partida
          </button>
          <button type="button" onClick={onLoad} disabled={!save.game}>
            {save.game ? (
              <>
                Cargar partida
                <small>
                  Nivel {save.game.level} · {formatDate(save.game)}
                  {save.game.savedAt ? ` · ${savedAgo(save.game.savedAt)}` : ''}
                </small>
              </>
            ) : (
              'Sin partida guardada'
            )}
          </button>
          <button type="button" onClick={onOptions}>
            Opciones
          </button>
        </div>
      </section>
    </main>
  );
}
