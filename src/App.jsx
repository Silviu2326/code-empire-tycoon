import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { EconomyDialog, GameOverDialog, IntroDialog, OptionsDialog, PauseMenu, VictoryDialog } from './components/Dialogs.jsx';
import { GameContext } from './components/GameContext.js';
import { BottomNav, TopBar } from './components/TopBar.jsx';
import { ConfirmDialog, Toast } from './components/ui.jsx';
import { createInitialGame } from './game/initialState.js';
import { gameReducer } from './game/reducer.js';
import { clearSave, loadSave, writeSave } from './game/save.js';
import { AiScreen } from './screens/AiScreen.jsx';
import { CreateProject } from './screens/CreateProject.jsx';
import { Empire } from './screens/Empire.jsx';
import { Employees } from './screens/Employees.jsx';
import { Marketing } from './screens/Marketing.jsx';
import { Office } from './screens/Office.jsx';
import { ProjectDetail } from './screens/ProjectDetail.jsx';
import { Projects } from './screens/Projects.jsx';
import { StartScreen } from './screens/StartScreen.jsx';

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

  const navigate = useCallback((tab, extra = {}) => {
    setUi({ tab, ...extra });
  }, []);

  const ask = useCallback((request) => setConfirm(request), []);

  const context = useMemo(() => ({ game, dispatch, ui, navigate, ask }), [game, ui, navigate, ask]);

  function startNewGame() {
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

  const confirmDialog = confirm && <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />;
  const optionsDialog = modal === 'options' && (
    <OptionsDialog
      hasSave={Boolean(save.game) || playing}
      onClearSave={requestClearSave}
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
            <Screen key={`${ui.tab}-${ui.projectId || ''}-${ui.ideaId || ''}`} />
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
