import { monthNames } from '../data/catalog.js';

const numberFormat = new Intl.NumberFormat('es-ES', { useGrouping: 'always' });

export function currency(value) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  return `${sign}$${numberFormat.format(Math.abs(rounded))}`;
}

export function number(value) {
  return numberFormat.format(Math.round(value));
}

export function formatDate({ month, year }) {
  return `${monthNames[month - 1]} ${year}`;
}

export function addMonths({ month, year }, count) {
  const index = year * 12 + (month - 1) + count;
  return { month: (index % 12) + 1, year: Math.floor(index / 12) };
}

export function monthsBetween(from, to) {
  return to.year * 12 + to.month - (from.year * 12 + from.month);
}

export function relativeTime(date, now) {
  const diff = monthsBetween(date, now);
  if (diff <= 0) return 'Este mes';
  if (diff === 1) return 'Hace 1 mes';
  if (diff < 12) return `Hace ${diff} meses`;
  return formatDate(date);
}
