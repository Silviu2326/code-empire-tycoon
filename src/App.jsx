import { Suspense, lazy, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { EconomyDialog, GameOverDialog, IntroDialog, OptionsDialog, PauseMenu, VictoryDialog } from './components/Dialogs.jsx';
import { GameContext } from './components/GameContext.js';
import { BottomNav, TopBar } from './components/TopBar.jsx';
import { ConfirmDialog, Toast } from './components/ui.jsx';
import { formatDate } from './game/format.js';
import { createInitialGame } from './game/initialState.js';
import { gameReducer } from './game/reducer.js';
import { clearSave, loadSave, writeSave } from './game/save.js';
import { Office } from './screens/Office.jsx';
import { gameEvents, track } from './telemetry.js';
import { StartScreen } from './screens/StartScreen.jsx';

// La oficina se carga al momento; el resto de pantallas, bajo demanda.
const screenLoaders = [];
const lazyScreen = (load, name) => {
  screenLoaders.push(load);
  return lazy(() => load().then((module) => ({ default: module[name] })));
};
const Projects = lazyScreen(() => import('./screens/Projects.jsx'), 'Projects');
const CreateProject = lazyScreen(() => import('./screens/CreateProject.jsx'), 'CreateProject');
const ProjectDetail = lazyScreen(() => import('./screens/ProjectDetail.jsx'), 'ProjectDetail');
const AiScreen = lazyScreen(() => import('./screens/AiScreen.jsx'), 'AiScreen');
const Employees = lazyScreen(() => import('./screens/Employees.jsx'), 'Employees');
const Marketing = lazyScreen(() => import('./screens/Marketing.jsx'), 'Marketing');
const Empire = lazyScreen(() => import('./screens/Empire.jsx'), 'Empire');

const MONTH_MS = 4200;
const TOAST_MS = 3000;
const screens = {
  office: Office,
  empire: Empire,
  projects: Projects,
  create: CreateProject,
  project: ProjectDetail,
  ai: AiScreen,
  employees: Employees,
  marketing: Marketing
};

function useGameLoop(game, dispatch, running) {
  useEffect(() => {
    if (!running || game.paused || game.gameOver) return undefined;
    const timer = window.setInterval(() => dispatch({ type: 'TICK' }), MONTH_MS / game.speed);
    return () => window.clearInterval(timer);
  }, [running, game.paused, game.gameOver, game.speed, dispatch]);
}

function App() {
  const [save, setSave] = useState(loadSave);
  const [game, dispatch] = useReducer(gameReducer, null, createInitialGame);
  const [playing, setPlaying] = useState(false);
  const [ui, setUi] = useState({ tab: 'office' });
  const [modal, setModal] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [dismissedToast, setDismissedToast] = useState(0);

  const showIntro = playing && !game.introSeen;
  const showVictory = playing && game.won && !game.victorySeen;
  const menuOpen = playing && (modal !== null || confirm !== null || showIntro || showVictory);
  useGameLoop(game, dispatch, playing && !menuOpen);

  // Guardado automático, agrupando cambios seguidos.
  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(() => {
      if (writeSave(game)) setSave({ game, status: 'ok' });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [game, playing]);

  const toast = game.feedback && game.feedback.seq !== dismissedToast ? game.feedback : null;
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setDismissedToast(toast.seq), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Espacio pausa/reanuda, salvo si se está escribiendo o hay una ventana abierta.
  useEffect(() => {
    if (!playing) return undefined;
    const onKey = (event) => {
      const typing = ['INPUT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName);
      if (event.code === 'Space' && !typing && !menuOpen) {
        event.preventDefault();
        dispatch({ type: 'TOGGLE_PAUSE' });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing, menuOpen]);

  // Una vez en la partida, precarga el resto de pantallas para que no haya esperas al navegar.
  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(() => screenLoaders.forEach((load) => load()), 1000);
    return () => window.clearTimeout(timer);
  }, [playing]);

  const navigate = useCallback((tab, extra = {}) => {
    setUi({ tab, ...extra });
  }, []);

  const ask = useCallback((request) => setConfirm(request), []);

  // Estadísticas anónimas (solo si están configuradas y el jugador no las ha desactivado).
  const previousGame = useRef(null);
  useEffect(() => {
    if (playing) gameEvents(previousGame.current, game).forEach(([event, props]) => track(event, props));
    previousGame.current = playing ? game : null;
  }, [game, playing]);

  const context = useMemo(() => ({ game, dispatch, ui, navigate, ask }), [game, ui, navigate, ask]);

  function startNewGame() {
    track('game_start');
    dispatch({ type: 'NEW_GAME' });
    setUi({ tab: 'office' });
    setModal(null);
    setPlaying(true);
  }

  function requestNewGame() {
    if (!save.game) return startNewGame();
    ask({
      title: 'Nueva partida',
      text: `Ya tienes una partida guardada (nivel ${save.game.level}). Si empiezas otra, se sobrescribirá.`,
      confirmLabel: 'Empezar de nuevo',
      danger: true,
      onConfirm: startNewGame
    });
  }

  function loadGame() {
    track('game_load', { level: save.game?.level });
    if (!save.game) return;
    dispatch({ type: 'LOAD', game: save.game });
    setUi({ tab: 'office' });
    setPlaying(true);
  }

  function exitToMenu() {
    writeSave(game);
    setSave(loadSave());
    setModal(null);
    setPlaying(false);
  }

  function requestClearSave() {
    ask({
      title: 'Borrar partida',
      text: 'Se borrará la partida guardada en este navegador. No se puede deshacer.',
      confirmLabel: 'Borrar',
      danger: true,
      onConfirm: () => {
        clearSave();
        setSave({ game: null, status: 'empty' });
        setModal(null);
        setPlaying(false);
      }
    });
  }

  function requestImport(imported) {
    ask({
      title: 'Importar partida',
      text: `Se cargará la partida importada (nivel ${imported.level}, ${formatDate(imported)}) y sustituirá a la actual.`,
      confirmLabel: 'Importar y jugar',
      danger: Boolean(save.game) || playing,
      onConfirm: () => {
        writeSave(imported);
        setSave(loadSave());
        dispatch({ type: 'LOAD', game: imported });
        setUi({ tab: 'office' });
        setModal(null);
        setPlaying(true);
      }
    });
  }

  const confirmDialog = confirm && <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />;
  const optionsDialog = modal === 'options' && (
    <OptionsDialog
      exportable={playing ? game : save.game}
      onClearSave={requestClearSave}
      onImport={requestImport}
      onClose={() => setModal(playing ? 'menu' : null)}
    />
  );

  if (!playing) {
    return (
      <>
        <StartScreen save={save} onNew={requestNewGame} onLoad={loadGame} onOptions={() => setModal('options')} />
        {optionsDialog}
        {confirmDialog}
      </>
    );
  }

  const Screen = screens[ui.tab] || Office;
  return (
    <GameContext.Provider value={context}>
      <main className="app-shell">
        <section className="phone-frame">
          <TopBar onOpenMenu={() => setModal('menu')} onOpenEconomy={() => setModal('economy')} />
          <div className="screen-body">
            <Suspense fallback={<p className="hint">Cargando…</p>}>
              <Screen key={`${ui.tab}-${ui.projectId || ''}-${ui.ideaId || ''}`} />
            </Suspense>
          </div>
          <BottomNav />
          <Toast feedback={toast} />
        </section>
      </main>
      {modal === 'menu' && (
        <PauseMenu onResume={() => setModal(null)} onOptions={() => setModal('options')} onExit={exitToMenu} />
      )}
      {modal === 'economy' && <EconomyDialog game={game} onClose={() => setModal(null)} />}
      {optionsDialog}
      {showIntro && !confirm && <IntroDialog onClose={() => dispatch({ type: 'DISMISS_INTRO' })} />}
      {showVictory && !confirm && (
        <VictoryDialog game={game} onContinue={() => dispatch({ type: 'DISMISS_VICTORY' })} onMenu={exitToMenu} />
      )}
      {game.gameOver && !confirm && (
        <GameOverDialog
          game={game}
          onNewGame={startNewGame}
          onMenu={() => {
            clearSave();
            setSave({ game: null, status: 'empty' });
            setPlaying(false);
          }}
        />
      )}
      {confirmDialog}
    </GameContext.Provider>
  );
}

export default function AppWithBoundary() {
  return (
    <ErrorBoundary
      onReset={() => {
        clearSave();
        window.location.reload();
      }}
    >
      <App />
    </ErrorBoundary>
  );
}
