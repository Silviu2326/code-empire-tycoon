import { aiTools, campaigns, candidates, findById } from '../data/catalog.js';
import { currency } from './format.js';
import { createInitialGame } from './initialState.js';
import {
  CANCEL_REFUND,
  MAX_OFFICE_LEVEL,
  availableCandidates,
  campaignEffectiveness,
  draftProblems,
  projectFromDraft,
  projectOfStaff,
  staffCapacity,
  upgradeCost
} from './rules.js';
import { advanceMonth } from './tick.js';

const SPEEDS = [1, 2, 4];

function notify(state, text, tone = 'green') {
  const seq = (state.feedback?.seq || 0) + 1;
  return { ...state, feedback: { seq, text, tone } };
}

const fail = (state, text) => notify(state, text, 'red');

function updateProject(state, projectId, change) {
  return { ...state, projects: state.projects.map((project) => (project.id === projectId ? change(project) : project)) };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'NEW_GAME':
      return createInitialGame();

    case 'LOAD':
      return action.game;

    case 'TICK':
      return advanceMonth(state);

    case 'TOGGLE_PAUSE':
      return state.gameOver ? state : { ...state, paused: !state.paused };

    case 'SET_PAUSED':
      return state.gameOver ? state : { ...state, paused: action.paused };

    case 'CYCLE_SPEED':
      return { ...state, speed: SPEEDS[(SPEEDS.indexOf(state.speed) + 1) % SPEEDS.length] };

    case 'UPGRADE_OFFICE': {
      if (state.officeLevel >= MAX_OFFICE_LEVEL) return fail(state, 'La oficina ya está al nivel máximo.');
      const cost = upgradeCost(state.officeLevel);
      if (state.money < cost) return fail(state, `Necesitas ${currency(cost)} para mejorar la oficina.`);
      return notify(
        {
          ...state,
          money: state.money - cost,
          officeLevel: state.officeLevel + 1,
          maxServers: state.maxServers + 1
        },
        `Oficina mejorada a nivel ${state.officeLevel + 1}: +1 servidor y +2 plazas.`
      );
    }

    case 'CREATE_PROJECT': {
      const problems = draftProblems(action.draft, state);
      if (problems.length) return fail(state, problems[0]);
      const project = projectFromDraft(action.draft);
      const id = `p${state.nextId}`;
      const freeStaff = state.staff.filter((staffId) => !projectOfStaff(state, staffId));
      const projects = state.projects.filter((item) => item.id !== action.ideaId);
      return notify(
        {
          ...state,
          nextId: state.nextId + 1,
          money: state.money - project.cost,
          projects: [
            {
              id,
              ...project,
              progress: 2,
              status: 'dev',
              team: freeStaff.slice(0, 3),
              ai: state.ownedAi.slice(0, 2),
              spent: project.cost,
              startedAt: { month: state.month, year: state.year },
              monthlySales: 0,
              revenue: 0
            },
            ...projects
          ]
        },
        `${project.name} entra en desarrollo.`
      );
    }

    case 'CANCEL_PROJECT': {
      const project = state.projects.find((item) => item.id === action.projectId);
      if (!project || project.status !== 'dev') return state;
      const refund = Math.round(project.spent * CANCEL_REFUND);
      return notify(
        {
          ...updateProject(state, project.id, (item) => ({ ...item, status: 'cancelled', team: [], ai: [] })),
          money: state.money + refund
        },
        `${project.name} cancelado. Recuperas ${currency(refund)}.`,
        'orange'
      );
    }

    case 'TOGGLE_STAFF_ON_PROJECT': {
      const project = state.projects.find((item) => item.id === action.projectId);
      if (!project || project.status !== 'dev' || !state.staff.includes(action.staffId)) return state;
      if (project.team.includes(action.staffId)) {
        return updateProject(state, project.id, (item) => ({ ...item, team: item.team.filter((id) => id !== action.staffId) }));
      }
      // Una persona solo trabaja en un proyecto: se la quita del anterior.
      const moved = {
        ...state,
        projects: state.projects.map((item) =>
          item.status === 'dev' && item.team.includes(action.staffId)
            ? { ...item, team: item.team.filter((id) => id !== action.staffId) }
            : item
        )
      };
      return updateProject(moved, project.id, (item) => ({ ...item, team: [...item.team, action.staffId] }));
    }

    case 'TOGGLE_AI_ON_PROJECT': {
      const project = state.projects.find((item) => item.id === action.projectId);
      if (!project || project.status !== 'dev' || !state.ownedAi.includes(action.toolId)) return state;
      return updateProject(state, project.id, (item) => ({
        ...item,
        ai: item.ai.includes(action.toolId) ? item.ai.filter((id) => id !== action.toolId) : [...item.ai, action.toolId]
      }));
    }

    case 'HIRE': {
      const person = findById(candidates, action.staffId);
      if (!person || state.staff.includes(person.id)) return state;
      if (!availableCandidates(state).some((item) => item.id === person.id))
        return fail(state, 'Ese candidato ya no está disponible.');
      if (state.staff.length >= staffCapacity(state.officeLevel)) {
        return fail(state, 'No quedan plazas: mejora la oficina para contratar a más gente.');
      }
      if (state.money < person.salary) return fail(state, `Necesitas al menos un mes de salario (${currency(person.salary)}).`);
      return notify(
        {
          ...state,
          staff: [...state.staff, person.id],
          messages: [
            {
              id: `m${state.nextId}`,
              from: 'RRHH',
              subject: `${person.name} se une al equipo`,
              body: `Cobrará ${currency(person.salary)} al mes. Asígnale un proyecto desde la pestaña Equipo del proyecto.`,
              tone: 'blue',
              month: state.month,
              year: state.year,
              read: false
            },
            ...state.messages
          ],
          nextId: state.nextId + 1
        },
        `${person.name} contratado/a.`
      );
    }

    case 'FIRE': {
      if (!state.staff.includes(action.staffId)) return state;
      const person = findById(candidates, action.staffId);
      return notify(
        {
          ...state,
          staff: state.staff.filter((id) => id !== action.staffId),
          projects: state.projects.map((project) =>
            project.status === 'dev' ? { ...project, team: project.team.filter((id) => id !== action.staffId) } : project
          )
        },
        `${person?.name ?? 'Empleado'} deja el estudio.`,
        'orange'
      );
    }

    case 'BUY_AI': {
      const tool = findById(aiTools, action.toolId);
      if (!tool || state.ownedAi.includes(tool.id)) return state;
      if (state.money < tool.setup) return fail(state, `Necesitas ${currency(tool.setup)} para activar ${tool.name}.`);
      return notify(
        { ...state, money: state.money - tool.setup, ownedAi: [...state.ownedAi, tool.id] },
        `${tool.name} activado. Asígnalo a tus proyectos.`
      );
    }

    case 'CANCEL_AI': {
      if (!state.ownedAi.includes(action.toolId)) return state;
      const tool = findById(aiTools, action.toolId);
      return notify(
        {
          ...state,
          ownedAi: state.ownedAi.filter((id) => id !== action.toolId),
          projects: state.projects.map((project) =>
            project.status === 'dev' ? { ...project, ai: project.ai.filter((id) => id !== action.toolId) } : project
          )
        },
        `Suscripción a ${tool?.name ?? 'la herramienta'} cancelada.`,
        'orange'
      );
    }

    case 'START_CAMPAIGN': {
      const campaign = findById(campaigns, action.campaignId);
      if (!campaign) return state;
      if (state.activeCampaigns.some((active) => active.id === campaign.id)) return fail(state, 'Esa campaña ya está en marcha.');
      if (state.money < campaign.price) return fail(state, `Necesitas ${currency(campaign.price)} para esta campaña.`);
      const timesRun = state.campaignRuns[campaign.id] || 0;
      return notify(
        {
          ...state,
          money: state.money - campaign.price,
          campaignRuns: { ...state.campaignRuns, [campaign.id]: timesRun + 1 },
          activeCampaigns: [
            ...state.activeCampaigns,
            { id: campaign.id, monthsLeft: campaign.duration, effectiveness: campaignEffectiveness(timesRun) }
          ]
        },
        `${campaign.name} en marcha durante ${campaign.duration} ${campaign.duration === 1 ? 'mes' : 'meses'}.`
      );
    }

    case 'READ_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((message) => (message.id === action.messageId ? { ...message, read: true } : message))
      };

    default:
      return state;
  }
}
