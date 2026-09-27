const completed = (game) => game.projects.filter((project) => project.status === 'completed');
const bestQuality = (game) => Math.max(0, ...completed(game).map((project) => project.quality));
const addFans = (game, fans) => ({ ...game, fans: game.fans + fans });

/**
 * Eventos de imperio. Se disparan una sola vez, cuando se cumple `condition`, como un mensaje con decisiones.
 * `image` es el índice en assets.events. Cada opción puede tener `cost` y aplica `apply` al estado.
 */
export const empireEvents = [
  {
    id: 'investor',
    image: 0,
    title: 'Ronda de inversión',
    subtitle: 'Convierte ambición en capital.',
    hint: 'Nivel 4 y un producto lanzado',
    condition: (game) => game.level >= 4 && completed(game).length >= 1,
    from: 'Inversor',
    subject: 'Oferta de financiación',
    body: 'Un fondo ofrece $60.000 a cambio del 15% de tu estudio. Se llevará el 15% de las ventas de tus productos para siempre.',
    choices: [
      {
        label: 'Aceptar $60.000 por el 15%',
        result: 'Recibes $60.000. El fondo cobrará el 15% de las ventas.',
        apply: (game) => ({ ...game, money: game.money + 60000, equitySold: Math.min(0.5, (game.equitySold || 0) + 0.15) })
      },
      {
        label: 'Rechazar y seguir independiente',
        result: 'La prensa valora tu independencia: +200 seguidores.',
        apply: (game) => addFans(game, 200)
      }
    ]
  },
  {
    id: 'worldLaunch',
    image: 1,
    title: 'Lanzamiento mundial',
    subtitle: 'Tu producto llena escenarios y streams.',
    hint: 'Lanza un producto con calidad 85 o más',
    condition: (game) => bestQuality(game) >= 85,
    from: 'Prensa',
    subject: 'Te invitan a una gira de presentación',
    body: 'Tu último éxito ha llamado la atención. Una gira por ferias y streams costaría $8.000, pero te daría mucha visibilidad.',
    choices: [
      {
        label: 'Hacer la gira ($8.000)',
        cost: 8000,
        result: '+3.000 seguidores, +5.000 en la lista de deseados y +30 de experiencia.',
        apply: (game) => ({ ...addFans(game, 3000), wishlist: game.wishlist + 5000, xp: game.xp + 30 })
      },
      {
        label: 'Solo presentación online',
        result: '+600 seguidores.',
        apply: (game) => addFans(game, 600)
      }
    ]
  },
  {
    id: 'acquisition',
    image: 3,
    title: 'Adquisición rival',
    subtitle: 'Compra talento, tecnología y mercado.',
    hint: 'Nivel 8 y $60.000 en caja',
    condition: (game) => game.level >= 8 && game.money >= 60000,
    from: 'Mercado',
    subject: 'Un estudio rival está en venta',
    body: 'Un estudio pequeño quiere venderse por $50.000. Te quedarías con su oficina (+2 plazas) y su comunidad.',
    choices: [
      {
        label: 'Comprarlo ($50.000)',
        cost: 50000,
        result: '+2 plazas de empleado y +2.500 seguidores.',
        apply: (game) => ({ ...addFans(game, 2500), bonusSlots: (game.bonusSlots || 0) + 2 })
      },
      { label: 'Dejar pasar la oportunidad', result: 'Sin cambios.', apply: (game) => game }
    ]
  },
  {
    id: 'awards',
    image: 4,
    title: 'Premios globales',
    subtitle: 'Prestigio que vende por ti.',
    hint: 'Lanza un producto con calidad 90 o más',
    condition: (game) => bestQuality(game) >= 90,
    from: 'Premios',
    subject: '¡Estás nominado!',
    body: 'Uno de tus productos está nominado a los premios del año. Asistir a la gala cuesta $2.000.',
    choices: [
      {
        label: 'Asistir a la gala ($2.000)',
        cost: 2000,
        result: '+5.000 seguidores, +100 gemas y +40 de experiencia.',
        apply: (game) => ({ ...addFans(game, 5000), gems: game.gems + 100, xp: game.xp + 40 })
      },
      { label: 'No ir', result: '+20 gemas por la nominación.', apply: (game) => ({ ...game, gems: game.gems + 20 }) }
    ]
  },
  {
    id: 'ipo',
    image: 2,
    title: 'Salida a bolsa',
    subtitle: 'El estudio se vuelve una potencia pública.',
    hint: 'Nivel 12 y $150.000 en caja',
    condition: (game) => game.level >= 12 && game.money >= 150000,
    from: 'Banco de inversión',
    subject: 'Propuesta de salida a bolsa',
    body: 'Puedes salir a bolsa: recibirías $250.000 y 200 gemas, pero los accionistas se quedarían con otro 20% de las ventas.',
    choices: [
      {
        label: 'Salir a bolsa',
        result: 'Recibes $250.000 y 200 gemas.',
        apply: (game) => ({
          ...game,
          money: game.money + 250000,
          gems: game.gems + 200,
          equitySold: Math.min(0.6, (game.equitySold || 0) + 0.2)
        })
      },
      { label: 'Seguir siendo privada', result: 'Sin cambios.', apply: (game) => game }
    ]
  }
];

export const findEvent = (id) => empireEvents.find((event) => event.id === id);

/** Devuelve el primer evento pendiente cuya condición se cumple, o null. */
export function nextEvent(game) {
  return empireEvents.find((event) => !(game.firedEvents || []).includes(event.id) && event.condition(game)) || null;
}
