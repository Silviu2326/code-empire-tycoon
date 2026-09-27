import { useState } from 'react';
import { EmpireAssets, EmpireEvents } from '../components/Empire.jsx';
import { useGame } from '../components/GameContext.js';
import { ScreenTitle, Sprite, Stat } from '../components/ui.jsx';
import { assets } from '../data/assets.js';
import { campaigns, findById } from '../data/catalog.js';
import { currency, formatDate, number, relativeTime } from '../game/format.js';
import { campaignEffectiveness, salesForecast } from '../game/rules.js';

export function Marketing() {
  const { game } = useGame();
  return (
    <div className="stack">
      <ScreenTitle title="Marketing" />
      <ActiveCampaigns />
      <h3 className="eyebrow">Campañas disponibles</h3>
      {campaigns.map((campaign) => (
        <CampaignRow key={campaign.id} campaign={campaign} />
      ))}
      <section className="panel">
        <h2>Estadísticas</h2>
        <div className="stats-grid triple">
          <Stat label="Lista de deseados" value={number(game.wishlist)} />
          <Stat label="Seguidores" value={number(game.fans)} />
          <Stat label="Ventas estimadas" value={currency(salesForecast(game))} />
        </div>
        <FansChart history={game.history} />
      </section>
      <Messages />
      <EmpireAssets />
      <EmpireEvents />
    </div>
  );
}

function ActiveCampaigns() {
  const { game } = useGame();
  if (game.activeCampaigns.length === 0) return null;
  return (
    <section className="panel">
      <h2>Campañas activas</h2>
      {game.activeCampaigns.map((active) => {
        const campaign = findById(campaigns, active.id);
        return (
          <div className="message-line" key={active.id}>
            <Sprite image={assets.marketing} index={campaign.sprite} className="campaign-icon" />
            <div>
              <strong>{campaign.name}</strong>
              <p>Rendimiento {Math.round(active.effectiveness * 100)}%</p>
            </div>
            <small>
              {active.monthsLeft} {active.monthsLeft === 1 ? 'mes' : 'meses'}
            </small>
          </div>
        );
      })}
    </section>
  );
}

function CampaignRow({ campaign }) {
  const { game, dispatch, ask } = useGame();
  const running = game.activeCampaigns.some((active) => active.id === campaign.id);
  const effectiveness = campaignEffectiveness(game.campaignRuns[campaign.id] || 0);
  const expectedFans = Math.round(campaign.fans * effectiveness);

  function start() {
    ask({
      title: campaign.name,
      text: `Cuesta ${currency(campaign.price)} y durante ${campaign.duration} ${campaign.duration === 1 ? 'mes' : 'meses'} te traerá unos ${number(expectedFans)} seguidores y más lista de deseados.`,
      confirmLabel: `Lanzar por ${currency(campaign.price)}`,
      onConfirm: () => dispatch({ type: 'START_CAMPAIGN', campaignId: campaign.id })
    });
  }

  return (
    <article className="campaign-card">
      <Sprite image={assets.marketing} index={campaign.sprite} className="campaign-icon" />
      <div>
        <h3>{campaign.name}</h3>
        <p>
          Alcance {campaign.reach} · {campaign.duration} {campaign.duration === 1 ? 'mes' : 'meses'} · rendimiento{' '}
          {Math.round(effectiveness * 100)}%
        </p>
      </div>
      <button type="button" disabled={running || game.money < campaign.price} onClick={start}>
        {running ? 'En curso' : currency(campaign.price)}
      </button>
    </article>
  );
}

function FansChart({ history }) {
  if (history.length < 2) {
    return <p className="hint">La gráfica de seguidores aparecerá cuando pasen unos meses.</p>;
  }
  const values = history.map((entry) => entry.fans);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const first = history[0];
  const last = history[history.length - 1];
  return (
    <figure className="chart-figure">
      <div
        className="chart"
        role="img"
        aria-label={`Seguidores de ${formatDate(first)} a ${formatDate(last)}: de ${number(values[0])} a ${number(values[values.length - 1])}`}
      >
        {history.map((entry) => (
          <i
            key={`${entry.year}-${entry.month}`}
            title={`${formatDate(entry)}: ${number(entry.fans)}`}
            style={{ height: `${15 + ((entry.fans - min) / range) * 85}%` }}
          />
        ))}
      </div>
      <figcaption className="hint">
        Seguidores · {formatDate(first)} – {formatDate(last)}
      </figcaption>
    </figure>
  );
}

function Messages() {
  const { game, dispatch } = useGame();
  const [openId, setOpenId] = useState(null);
  const unread = game.messages.filter((message) => !message.read).length;

  function toggle(message) {
    setOpenId(openId === message.id ? null : message.id);
    if (!message.read) dispatch({ type: 'READ_MESSAGE', messageId: message.id });
  }

  return (
    <section className="panel messages">
      <div className="section-head">
        <h2>Mensajes</h2>
        {unread > 0 && <span className="mini-tag">{unread} sin leer</span>}
      </div>
      {game.messages.length === 0 && <p className="muted">No hay mensajes.</p>}
      {game.messages.map((message) => (
        <div key={message.id}>
          <button
            type="button"
            className={message.read ? 'message-line' : 'message-line unread'}
            aria-expanded={openId === message.id}
            onClick={() => toggle(message)}
          >
            <span className={`tone ${message.tone}`} aria-hidden="true">
              {message.from[0]}
            </span>
            <div>
              <strong>{message.from}</strong>
              <p>{message.subject}</p>
            </div>
            <small>{relativeTime(message, game)}</small>
          </button>
          {openId === message.id && <p className="message-body">{message.body}</p>}
        </div>
      ))}
    </section>
  );
}
