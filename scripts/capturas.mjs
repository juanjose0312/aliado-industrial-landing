/**
 * Capturas de las landings a 390 px y 1440 px, y verificación de scroll horizontal desde 360 px.
 *
 * Uso:  BASE_URL=http://localhost:4321 node scripts/capturas.mjs
 * (sirva antes el sitio: `npm run dev` o un servidor estático de .vercel/output/static)
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL ?? 'http://localhost:4321';
const SALIDA = new URL('../capturas/', import.meta.url);
const paginas = [
  { nombre: 'equipos', ruta: '/' },
  { nombre: 'bombas', ruta: '/bombas-de-vacio' },
];
const anchos = [
  { ancho: 390, alto: 844, movil: true },
  { ancho: 1440, alto: 900, movil: false },
];

await mkdir(SALIDA, { recursive: true });
const navegador = await chromium.launch();
let fallos = 0;

for (const p of paginas) {
  // Sin scroll horizontal desde 360 px
  for (const ancho of [360, 390, 768, 1024, 1440]) {
    const ctx = await navegador.newContext({ viewport: { width: ancho, height: 800 } });
    const page = await ctx.newPage();
    await page.goto(BASE + p.ruta, { waitUntil: 'networkidle', timeout: 180_000 });
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    const ok = scrollWidth <= innerWidth;
    if (!ok) fallos++;
    console.log(`${ok ? 'OK ' : 'ERR'} ${p.ruta} @${ancho}px  scrollWidth=${scrollWidth} innerWidth=${innerWidth}`);
    await ctx.close();
  }

  for (const v of anchos) {
    const ctx = await navegador.newContext({
      viewport: { width: v.ancho, height: v.alto },
      deviceScaleFactor: v.movil ? 2 : 1,
      isMobile: v.movil,
      hasTouch: v.movil,
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    await page.goto(BASE + p.ruta, { waitUntil: 'networkidle', timeout: 180_000 });
    // Fuerza la carga de las imágenes diferidas antes de la captura completa.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    const archivo = fileURLToPath(new URL(`${p.nombre}-${v.ancho}.png`, SALIDA));
    await page.screenshot({ path: archivo, fullPage: true });
    console.log(`captura ${archivo}`);
    await ctx.close();
  }
}

await navegador.close();
if (fallos) {
  console.error(`${fallos} vista(s) con scroll horizontal`);
  process.exit(1);
}
