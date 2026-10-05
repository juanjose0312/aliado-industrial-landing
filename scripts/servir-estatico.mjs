/**
 * Sirve la salida estática del build (.vercel/output/static) con compresión Brotli/gzip,
 * como lo hace Vercel, para medir con Lighthouse en local. No ejecuta /api/lead.
 *
 * Uso:  npm run build && npm run servir   →  http://localhost:4400
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';

const RAIZ = fileURLToPath(new URL('../.vercel/output/static/', import.meta.url));
const PUERTO = Number(process.env.PORT ?? 4400);
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};
const COMPRIMIBLES = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg']);

async function resolver(url) {
  const ruta = normalize(decodeURIComponent(new URL(url, 'http://x').pathname)).replace(/^([\\/])+/, '');
  for (const candidato of [ruta, join(ruta, 'index.html'), `${ruta}.html`]) {
    const archivo = join(RAIZ, candidato);
    if (!archivo.startsWith(RAIZ)) continue;
    try {
      if ((await stat(archivo)).isFile()) return archivo;
    } catch {
      /* siguiente */
    }
  }
  return null;
}

createServer(async (req, res) => {
  const archivo = (await resolver(req.url ?? '/')) ?? join(RAIZ, '404.html');
  const ext = extname(archivo);
  let cuerpo = await readFile(archivo);
  const cabeceras = { 'content-type': TIPOS[ext] ?? 'application/octet-stream' };
  if (req.url?.startsWith('/_astro/')) cabeceras['cache-control'] = 'public, max-age=31536000, immutable';
  const acepta = String(req.headers['accept-encoding'] ?? '');
  if (COMPRIMIBLES.has(ext)) {
    if (acepta.includes('br')) {
      cuerpo = brotliCompressSync(cuerpo, { params: { [constants.BROTLI_PARAM_QUALITY]: 9 } });
      cabeceras['content-encoding'] = 'br';
    } else if (acepta.includes('gzip')) {
      cuerpo = gzipSync(cuerpo);
      cabeceras['content-encoding'] = 'gzip';
    }
  }
  res.writeHead(archivo.endsWith('404.html') && !req.url?.startsWith('/404') ? 404 : 200, cabeceras);
  res.end(cuerpo);
}).listen(PUERTO, () => console.log(`Sirviendo ${RAIZ} en http://localhost:${PUERTO}`));
