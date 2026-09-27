import { useGame } from '../components/GameContext.js';
import { ScreenTitle, Sprite } from '../components/ui.jsx';
import { assets } from '../data/assets.js';
import { aiTools } from '../data/catalog.js';
import { currency, number } from '../game/format.js';

export function AiScreen() {
  const { game } = useGame();
  return (
    <div className="stack">
      <ScreenTitle title="IA y herramientas" right={<span className="pill gems">◆ {number(game.gems)}</span>} />
      <p className="hint">
        Cada herramienta tiene un coste de alta y una cuota mensual. Asígnalas a tus proyectos para acelerarlos.
      </p>
      <h3 className="eyebrow">IA disponibles</h3>
      {aiTools.slice(0, 4).map((tool) => (
        <ToolRow key={tool.id} tool={tool} />
      ))}
      <h3 className="eyebrow">Otras herramientas</h3>
      {aiTools.slice(4).map((tool) => (
        <ToolRow key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

function ToolRow({ tool }) {
  const { game, dispatch, ask } = useGame();
  const owned = game.ownedAi.includes(tool.id);

  function onClick() {
    if (owned) {
      ask({
        title: `Cancelar ${tool.name}`,
        text: `Dejarás de pagar ${currency(tool.price)} al mes y se quitará de tus proyectos. Si vuelves a activarla, pagarás el alta de nuevo.`,
        confirmLabel: 'Cancelar suscripción',
        cancelLabel: 'Mantener',
        danger: true,
        onConfirm: () => dispatch({ type: 'CANCEL_AI', toolId: tool.id })
      });
    } else {
      ask({
        title: `Activar ${tool.name}`,
        text: `Pagas ${currency(tool.setup)} de alta y ${currency(tool.price)} al mes. Aporta +${tool.boost} de impulso a cada proyecto donde la uses.`,
        confirmLabel: `Pagar ${currency(tool.setup)}`,
        onConfirm: () => dispatch({ type: 'BUY_AI', toolId: tool.id })
      });
    }
  }

  return (
    <article className="tool-row">
      <Sprite image={assets.aiTools} index={tool.sprite} className="tool-glyph" />
      <div>
        <h3>{tool.name}</h3>
        <p>
          {tool.role} · +{tool.boost}
        </p>
      </div>
      <button type="button" className={owned ? 'owned' : 'price'} disabled={!owned && game.money < tool.setup} onClick={onClick}>
        {owned ? (
          <>
            Activo
            <small>{currency(tool.price)}/mes</small>
          </>
        ) : (
          <>
            {currency(tool.setup)}
            <small>+ {currency(tool.price)}/mes</small>
          </>
        )}
      </button>
    </article>
  );
}
