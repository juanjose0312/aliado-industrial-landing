/**
 * Revisión de cumplimiento de marca (Google Ads, "Prácticas comerciales inaceptables").
 * Recorre src/ y falla si encuentra términos que sugieran afiliación falsa u ofertas no confirmadas.
 *
 * Uso:  npm run check:marca
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(RAIZ, 'src');
const EXTENSIONES = ['.astro', '.ts', '.js', '.mjs', '.css', '.md', '.mdx', '.json', '.html', '.svg'];

const reglas = [
  {
    nombre: '"vactor" sin "tipo" delante (use "equipo tipo vactor" o "minivactor")',
    // \b evita "minivactor"; se descarta si lo antecede "tipo " o "tipo-".
    patron: /\bvactor\b/gi,
    permitido: (linea, i) => /tipo[\s-]+$/i.test(linea.slice(Math.max(0, i - 6), i)),
  },
  { nombre: 'Número de modelo de otra marca (2100 / 2110)', patron: /2100|2110/g },
  { nombre: '"importad…" (importación no confirmada)', patron: /importad/gi },
  { nombre: '"hidroexcav…" (servicio no confirmado)', patron: /hidroexcav/gi },
  { nombre: '"autorizado/a" (afiliación)', patron: /autorizad[oa]s?\b/gi },
  { nombre: '"oficial" (afiliación)', patron: /\boficial(es)?\b/gi },
  { nombre: '"representante" (afiliación)', patron: /\brepresentantes?\b/gi },
  { nombre: 'Dominio aliadoindustrial.com sin .co (es de otra empresa)', patron: /aliadoindustrial\.com(?!\.co)/gi },
];

/**
 * Excepciones permitidas, solo por archivo + texto de la línea:
 * el aviso de no afiliación y la pregunta frecuente de distribuidores.
 */
const excepciones = [
  { archivo: 'src/config/site.ts', contiene: 'No somos distribuidores autorizados ni representantes de Vactor Manufacturing' },
  { archivo: 'src/pages/bombas-de-vacio.astro', contiene: "pregunta: '¿Son distribuidores autorizados?'" },
  { archivo: 'src/pages/bombas-de-vacio.astro', contiene: 'no es distribuidor autorizado ni representante de ninguna de las marcas' },
];

async function* archivos(dir) {
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) yield* archivos(ruta);
    else if (EXTENSIONES.some((e) => entrada.name.endsWith(e))) yield ruta;
  }
}

const hallazgos = [];
let revisados = 0;
for await (const ruta of archivos(SRC)) {
  revisados++;
  const rel = relative(RAIZ, ruta).split(sep).join('/');
  // Los nombres de archivo también cuentan (p. ej. imágenes importadas).
  const lineas = (await readFile(ruta, 'utf8')).split(/\r?\n/);
  lineas.forEach((linea, n) => {
    if (excepciones.some((e) => e.archivo === rel && linea.includes(e.contiene))) return;
    for (const regla of reglas) {
      for (const m of linea.matchAll(regla.patron)) {
        if (regla.permitido?.(linea, m.index)) continue;
        hallazgos.push({ rel, linea: n + 1, regla: regla.nombre, texto: linea.trim().slice(0, 140) });
      }
    }
  });
}

// Nombres de archivos dentro de src/ (fotos, componentes)
for await (const ruta of (async function* recorrer(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const r = join(dir, e.name);
    if (e.isDirectory()) yield* recorrer(r);
    else yield r;
  }
})(SRC)) {
  const nombre = relative(RAIZ, ruta).split(sep).join('/');
  if (/(^|[^i])vactor/i.test(nombre.replace(/minivactor/gi, ''))) {
    hallazgos.push({ rel: nombre, linea: 0, regla: 'Nombre de archivo con "vactor"', texto: nombre });
  }
}

if (hallazgos.length === 0) {
  console.log(`check:marca OK — ${revisados} archivos revisados en src/, sin hallazgos.`);
} else {
  console.error(`check:marca: ${hallazgos.length} hallazgo(s)\n`);
  for (const h of hallazgos) console.error(`  ${h.rel}:${h.linea}  [${h.regla}]\n    ${h.texto}\n`);
  process.exit(1);
}
