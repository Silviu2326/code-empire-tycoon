import { useState } from 'react';
import { useGame } from '../components/GameContext.js';
import { ScreenTitle, Sprite, Stat } from '../components/ui.jsx';
import { assets } from '../data/assets.js';
import { campaigns, findById } from '../data/catalog.js';
import { currency, formatDate, number, relativeTime } from '../game/format.js';
import { findEvent } from '../game/events.js';
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
        <HistoryChart history={game.history} />
      </section>
      <Messages />
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
  const effectiveness = campaignEffectiveness(game.campaignRuns[campaign.id] || 0, game);
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

const metrics = {
  fans: { label: 'Seguidores', format: number },
  net: { label: 'Balance mensual', format: currency }
};

function HistoryChart({ history }) {
  const [metric, setMetric] = useState('fans');
  if (history.length < 2) {
    return <p className="hint">Las gráficas aparecerán cuando pasen unos meses.</p>;
  }
  const { label, format } = metrics[metric];
  const values = history.map((entry) => entry[metric]);
  const first = history[0];
  const last = history[history.length - 1];
  let height;
  if (metric === 'fans') {
    const min = Math.min(...values);
    const range = Math.max(...values) - min || 1;
    height = (value) => 15 + ((value - min) / range) * 85;
  } else {
    const maxAbs = Math.max(...values.map(Math.abs)) || 1;
    height = (value) => 8 + (Math.abs(value) / maxAbs) * 92;
  }
  return (
    <figure className="chart-figure">
      <div className="chart-switch" role="group" aria-label="Métrica de la gráfica">
        {Object.entries(metrics).map(([id, item]) => (
          <button type="button" key={id} aria-pressed={metric === id} onClick={() => setMetric(id)}>
            {item.label}
          </button>
        ))}
      </div>
      <div
        className="chart"
        role="img"
        aria-label={`${label} de ${formatDate(first)} a ${formatDate(last)}: de ${format(values[0])} a ${format(values[values.length - 1])}`}
      >
        {history.map((entry) => (
          <i
            key={`${entry.year}-${entry.month}`}
            className={entry[metric] < 0 ? 'negative-bar' : ''}
            title={`${formatDate(entry)}: ${format(entry[metric])}`}
            style={{ height: `${height(entry[metric])}%` }}
          />
        ))}
      </div>
      <figcaption className="hint">
        {label} · {formatDate(first)} – {formatDate(last)}
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
            <small>{message.eventId && message.choice === undefined ? 'Decidir' : relativeTime(message, game)}</small>
          </button>
          {openId === message.id && <p className="message-body">{message.body}</p>}
          {openId === message.id && message.eventId && <EventChoices message={message} />}
        </div>
      ))}
    </section>
  );
}

function EventChoices({ message }) {
  const { game, dispatch } = useGame();
  const event = findEvent(message.eventId);
  if (!event) return null;
  const decided = message.choice !== undefined;
  return (
    <div className="choice-list" role="group" aria-label="Decisión">
      {event.choices.map((choice, index) => (
        <button
          type="button"
          key={choice.label}
          className={decided && message.choice === index ? 'chosen' : ''}
          disabled={decided || (choice.cost && game.money < choice.cost)}
          onClick={() => dispatch({ type: 'RESOLVE_EVENT', messageId: message.id, choiceIndex: index })}
        >
          {choice.label}
          {decided && message.choice === index ? ' ✓' : ''}
        </button>
      ))}
    </div>
  );
}
