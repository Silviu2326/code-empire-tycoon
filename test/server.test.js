import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createAppServer } from '../server.mjs';

let server;
let base;

beforeAll(async () => {
  const root = await mkdtemp(join(tmpdir(), 'cet-dist-'));
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'index.html'), '<!doctype html><title>Code Empire</title>' + 'x'.repeat(2000));
  await writeFile(join(root, 'assets', 'index-AbCd1234.js'), 'console.log("hola");'.repeat(200));
  await writeFile(join(root, 'assets', 'hero-start.webp'), Buffer.from([1, 2, 3]));
  server = createAppServer(root);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

describe('server.mjs', () => {
  it('sirve index.html sin caché y con cabeceras de seguridad', async () => {
    const response = await fetch(`${base}/`);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-cache');
    expect(response.headers.get('content-security-policy')).toContain("script-src 'self'");
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it('las rutas de la app sin extensión devuelven index.html', async () => {
    const response = await fetch(`${base}/partida/nueva`);
    expect(response.status).toBe(200);
    expect(await response.text()).toContain('<title>Code Empire</title>');
  });

  it('los archivos que no existen devuelven 404, no la app', async () => {
    expect((await fetch(`${base}/assets/no-existe.webp`)).status).toBe(404);
    expect((await fetch(`${base}/robots.txt`)).status).toBe(404);
  });

  it('los assets con hash se cachean para siempre y se comprimen', async () => {
    const response = await fetch(`${base}/assets/index-AbCd1234.js`, { headers: { 'Accept-Encoding': 'br' } });
    expect(response.headers.get('cache-control')).toContain('immutable');
    expect(response.headers.get('content-encoding')).toBe('br');
    expect(await response.text()).toContain('console.log');
  });

  it('sirve WebP con su tipo y sin comprimir', async () => {
    const response = await fetch(`${base}/assets/hero-start.webp`, { headers: { 'Accept-Encoding': 'gzip' } });
    expect(response.headers.get('content-type')).toBe('image/webp');
    expect(response.headers.get('content-encoding')).toBeNull();
  });

  it('no deja salir de la carpeta publicada', async () => {
    const response = await fetch(`${base}/..%2f..%2fetc%2fpasswd`);
    expect([403, 404]).toContain(response.status);
  });
});
