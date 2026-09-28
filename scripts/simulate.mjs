// Simula partidas completas con distintos estilos de juego para ajustar el balance.
// Uso: npm run simulate            (resumen)
//      npm run simulate -- --csv   (una fila por mes, para hacer gráficas)
import { launchedCount, play, strategies } from './strategies.mjs';

const csv = process.argv.includes('--csv');
if (csv) console.log('estrategia,mes,nivel,dinero,neto,lanzados');
for (const name of Object.keys(strategies)) {
  const { game, rows, wonAt } = play(name);
  if (csv) {
    rows.forEach((row) => console.log([name, row.month, row.level, row.money, row.net, row.launched].join(',')));
    continue;
  }
  const at = (m) => rows[Math.min(m, rows.length) - 1];
  const result = game.gameOver
    ? `QUIEBRA en el mes ${rows.length}`
    : wonAt
      ? `VICTORIA en el mes ${wonAt}`
      : `sin terminar tras ${rows.length} meses`;
  console.log(
    `${name.padEnd(12)} ${result.padEnd(26)} nivel@60=${at(60)?.level ?? '-'} nivel@120=${at(120)?.level ?? '-'} ` +
      `dinero final=${Math.round(game.money).toLocaleString('es-ES')} lanzados=${launchedCount(game)} eventos=${game.firedEvents.join('+') || '-'}`
  );
}
