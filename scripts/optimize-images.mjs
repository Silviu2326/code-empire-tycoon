// Genera las imágenes WebP del juego a partir de los PNG originales de assets-src/.
// Uso: npm run images
import { mkdir, readdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = 'assets-src';
const OUT = 'public/assets';

// Ancho máximo según el tamaño al que se muestra cada imagen (aprox. 2x del tamaño en pantalla).
const rules = [
  [/^hero-start/, 900],
  [/^stage-/, 1200],
  [/^project-landscape/, 1000],
  [/^event-/, 720],
  [/^sheet-/, 720],
  [/^(employee-portraits|ai-tools|marketing-icons)/, 400],
  [/^founder-/, 240],
  [/^icon-/, 256]
];

// Originales que el juego ya no usa: se guardan en assets-src pero no se publican.
const unused = new Set(['office-scene.png', 'empire-global-map.png', 'empire-data-center.png']);

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let before = 0;
let after = 0;
for (const file of (await readdir(SRC)).filter((name) => name.endsWith('.png')).sort()) {
  if (unused.has(file)) continue;
  const width = rules.find(([pattern]) => pattern.test(file))?.[1] ?? 800;
  const target = join(OUT, file.replace(/\.png$/, '.webp'));
  const info = await sharp(join(SRC, file))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(target);
  const original = (await stat(join(SRC, file))).size;
  before += original;
  after += info.size;
  console.log(`${file.padEnd(28)} ${info.width}x${info.height}  ${(original / 1024) | 0} KB → ${(info.size / 1024) | 0} KB`);
}

// Iconos de la app (favicon, pantalla de inicio en móvil y manifest).
const iconSource = join(SRC, 'icon-code-quest.png');
for (const size of [32, 180, 192, 512]) {
  const name = size === 180 ? 'apple-touch-icon.png' : size === 32 ? 'favicon-32.png' : `icon-${size}.png`;
  await sharp(iconSource).resize(size, size).png({ compressionLevel: 9, palette: true }).toFile(join('public', name));
}

console.log(`\nTotal: ${(before / 1048576).toFixed(1)} MB → ${(after / 1048576).toFixed(2)} MB`);
