import { describe, expect, it } from 'vitest';
import { play } from '../../scripts/strategies.mjs';
import { createInitialGame } from './initialState.js';
import { marketSaturation } from './rules.js';

// Objetivo de diseño (docs/PLAN-PRODUCCION.md, fase 8): un jugador sensato gana en 120-220 meses de juego.
describe('balance', () => {
  it('un jugador sensato gana en el rango objetivo y ve todos los eventos', () => {
    const { wonAt, game } = play('sensato');
    expect(wonAt).toBeGreaterThanOrEqual(120);
    expect(wonAt).toBeLessThanOrEqual(220);
    expect(game.firedEvents).toHaveLength(5);
  });

  it('gastar sin control lleva a la bancarrota', () => {
    expect(play('derrochador').game.gameOver).toBe(true);
  });

  it('repetir campañas no acelera la partida', () => {
    const solo = play('solitario').rows;
    const spam = play('campañas').rows;
    expect(spam[119].level).toBeLessThanOrEqual(solo[119].level);
  });

  it('lanzar muchos productos seguidos satura el mercado', () => {
    const game = createInitialGame();
    const launched = (n) =>
      Array.from({ length: n }, (_, i) => ({ id: `x${i}`, status: 'completed', completedAt: { month: 5, year: 2025 } }));
    expect(marketSaturation(game)).toBe(1);
    expect(marketSaturation({ ...game, projects: launched(5) })).toBeLessThan(0.65);
  });
});
