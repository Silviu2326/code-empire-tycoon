import { sizes } from '../data/catalog.js';
import { BANKRUPTCY_MONTHS, freeServers, projectOfStaff, staffMembers, toolsFor } from './rules.js';

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

/**
 * Lo que el jugador debería atender ahora mismo, de más a menos urgente.
 * Cada tarea tiene `id`, `text`, `tone` y, si se puede resolver en otra pantalla, `tab` (+ `extra` para navigate).
 */
export function pendingActions(game) {
  const actions = [];
  const devProjects = game.projects.filter((project) => project.status === 'dev');

  if (game.money < 0) {
    const left = BANKRUPTCY_MONTHS - game.debtMonths;
    actions.push({
      id: 'debt',
      tone: 'red',
      text: `Cuenta en negativo: ${left <= 0 ? 'último aviso' : `quiebras en ${plural(left, 'mes', 'meses')}`} si no entra dinero. Reduce gastos o termina un proyecto.`,
      tab: 'employees'
    });
  }

  const decisions = game.messages.filter((message) => message.eventId && message.choice === undefined);
  if (decisions.length) {
    actions.push({
      id: 'decisions',
      tone: 'purple',
      text: `${plural(decisions.length, 'decisión pendiente', 'decisiones pendientes')} en tus mensajes.`,
      tab: 'marketing'
    });
  }

  const idle = staffMembers(game.staff).filter((person) => !projectOfStaff(game, person.id));
  if (idle.length && devProjects.length) {
    const target = devProjects.reduce((a, b) => (a.team.length <= b.team.length ? a : b));
    const others = idle.filter((person) => !person.founder).map((person) => person.name);
    const founderIdle = idle.some((person) => person.founder);
    const text = !others.length
      ? `No estás trabajando en ningún proyecto: únete a ${target.name}.`
      : `Sin proyecto: ${[...(founderIdle ? ['tú'] : []), ...others].join(', ')}. Asigna trabajo en ${target.name}.`;
    actions.push({
      id: 'idle-staff',
      tone: 'orange',
      text,
      tab: 'project',
      extra: { projectId: target.id }
    });
  }

  const idea = game.projects.find((project) => project.status === 'idea');
  const cheapest = Math.min(...sizes.map((size) => size.cost));
  if (freeServers(game) > 0 && game.money >= cheapest) {
    if (idea) {
      actions.push({
        id: 'idea',
        tone: 'green',
        text: `Tienes un servidor libre: desarrolla tu idea «${idea.name}».`,
        tab: 'create',
        extra: {
          ideaId: idea.id,
          draft: { name: idea.name, genre: idea.genre, style: idea.style, size: idea.size, techs: idea.techs }
        }
      });
    } else {
      actions.push({
        id: 'servers',
        tone: 'green',
        text: `${plural(freeServers(game), 'servidor libre', 'servidores libres')}: empieza un proyecto nuevo.`,
        tab: 'create'
      });
    }
  }

  const unusedTools = toolsFor(game.ownedAi).filter((tool) => !devProjects.some((project) => project.ai.includes(tool.id)));
  if (unusedTools.length && devProjects.length) {
    actions.push({
      id: 'unused-ai',
      tone: 'orange',
      text: `Pagas ${unusedTools.map((tool) => tool.name).join(', ')} pero no se usa en ningún proyecto.`,
      tab: 'project',
      extra: { projectId: devProjects[0].id }
    });
  }

  return actions;
}
