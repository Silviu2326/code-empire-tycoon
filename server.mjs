// Servidor estático de producción para dist/ (alternativa a Cloudflare Pages o Netlify).
// Uso: npm run build && npm run serve   (PORT y HOST configurables por variables de entorno)
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const compressible = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.txt', '.svg']);

export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    // https: permite enviar la telemetría opcional (VITE_ANALYTICS_ENDPOINT / VITE_ERROR_ENDPOINT).
    "connect-src 'self' https:",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy': 'same-origin'
};

function cacheControl(path) {
  // Los archivos que genera Vite llevan hash en el nombre: pueden cachearse para siempre.
  if (/\/assets\/.+-[\w-]{8}\.(js|css)$/.test(path)) return 'public, max-age=31536000, immutable';
  if (path.endsWith('.html') || path.endsWith('.webmanifest')) return 'no-cache';
  return 'public, max-age=604800';
}

const compressedCache = new Map();
async function compressed(file, encoding) {
  const key = `${file}:${encoding}`;
  if (!compressedCache.has(key)) {
    const raw = await readFile(file);
    const body =
      encoding === 'br'
        ? brotliCompressSync(raw, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } })
        : gzipSync(raw, { level: 9 });
    compressedCache.set(key, body);
  }
  return compressedCache.get(key);
}

async function resolveFile(root, pathname) {
  const target = normalize(join(root, decodeURIComponent(pathname)));
  if (target !== root && !target.startsWith(root + sep)) return { status: 403 };
  try {
    const info = await stat(target);
    if (info.isFile()) return { file: target };
    if (info.isDirectory()) {
      const index = join(target, 'index.html');
      if ((await stat(index).catch(() => null))?.isFile()) return { file: index };
    }
  } catch {
    // No existe: se decide abajo.
  }
  // Rutas sin extensión (navegación) → la app; archivos con extensión que no existen → 404.
  if (!extname(pathname)) return { file: join(root, 'index.html') };
  return { status: 404 };
}

export function createAppServer(root) {
  return createServer(async (request, response) => {
    for (const [name, value] of Object.entries(securityHeaders)) response.setHeader(name, value);
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    let pathname;
    try {
      pathname = new URL(request.url || '/', 'http://localhost').pathname;
      if (pathname.endsWith('/')) pathname += 'index.html';
    } catch {
      response.writeHead(400).end();
      return;
    }
    const resolved = await resolveFile(root, pathname).catch(() => ({ status: 400 }));
    if (!resolved.file) {
      response.writeHead(resolved.status, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado');
      return;
    }

    const extension = extname(resolved.file);
    const headers = {
      'Content-Type': types[extension] || 'application/octet-stream',
      'Cache-Control': cacheControl(resolved.file.split(sep).join('/')),
      Vary: 'Accept-Encoding'
    };
    const accepts = String(request.headers['accept-encoding'] || '');
    const encoding = !compressible.has(extension)
      ? null
      : /\bbr\b/.test(accepts)
        ? 'br'
        : /\bgzip\b/.test(accepts)
          ? 'gzip'
          : null;

    if (encoding) {
      const body = await compressed(resolved.file, encoding);
      response.writeHead(200, { ...headers, 'Content-Encoding': encoding, 'Content-Length': body.length });
      response.end(request.method === 'HEAD' ? undefined : body);
      return;
    }
    const { size } = await stat(resolved.file);
    response.writeHead(200, { ...headers, 'Content-Length': size });
    if (request.method === 'HEAD') response.end();
    else createReadStream(resolved.file).pipe(response);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
  const port = Number(process.env.PORT || 5173);
  const host = process.env.HOST || '0.0.0.0';
  createAppServer(root).listen(port, host, () => {
    console.log(`Code Empire Tycoon listo en http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`);
  });
}
