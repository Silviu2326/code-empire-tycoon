import { createContext, useContext } from 'react';

/**
 * game      – estado de la partida (se guarda)
 * dispatch  – acciones del reducer
 * ui        – estado de interfaz: pestaña, proyecto abierto, borrador… (no se guarda)
 * navigate  – cambia de pestaña, opcionalmente con más estado de interfaz
 * ask       – abre un diálogo de confirmación
 */
export const GameContext = createContext(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame debe usarse dentro de GameContext');
  return context;
}
