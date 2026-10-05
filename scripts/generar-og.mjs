/**
 * Genera las imágenes Open Graph (1200×630) de cada landing en public/og/.
 * Renderiza una plantilla HTML con Playwright usando las fuentes, el logo y las fotos del proyecto.
 *
 * Uso:  npm run og
 */
import { chromium } from 'playwright';
import { readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const raiz = new URL('../', import.meta.url);
const ruta = (p) => fileURLToPath(new URL(p, raiz));
const base64 = async (p) => (await readFile(ruta(p))).toString('base64');

const { site, equipos, contacto } = await import('../src/config/site.ts');

const fuente = async (paquete, archivo) =>
  `url(data:font/woff2;base64,${await base64(`node_modules/@fontsource/${paquete}/files/${archivo}`)}) format('woff2')`;

const css = `
@font-face { font-family: 'BSD'; font-weight: 800; src: ${await fuente('big-shoulders-display', 'big-shoulders-display-latin-800-normal.woff2')}; }
@font-face { font-family: 'Barlow'; font-weight: 500; src: ${await fuente('barlow', 'barlow-latin-500-normal.woff2')}; }
@font-face { font-family: 'Mono'; font-weight: 500; src: ${await fuente('ibm-plex-mono', 'ibm-plex-mono-latin-500-normal.woff2')}; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #111315; color: #fff; font-family: 'Barlow'; overflow: hidden; position: relative; }
.rejilla { position: absolute; inset: 0; background-image: linear-gradient(rgb(255 255 255 / .04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / .04) 1px, transparent 1px); background-size: 40px 40px; }
.texto { position: absolute; left: 64px; top: 56px; width: 600px; }
.marca { display: flex; align-items: center; gap: 14px; font-family: 'BSD'; font-size: 30px; text-transform: uppercase; letter-spacing: .02em; }
.marca img { height: 54px; }
.marca span { color: #ff4d55; }
h1 { margin-top: 44px; font-family: 'BSD'; font-weight: 800; font-size: 88px; line-height: .92; text-transform: uppercase; }
h1 em { font-style: normal; color: #ff4d55; }
.datos { position: absolute; left: 64px; bottom: 62px; display: flex; gap: 34px; font-family: 'Mono'; font-size: 22px; }
.datos small { display: block; font-family: 'Barlow'; font-size: 17px; color: #a3acb6; margin-top: 4px; }
.media { position: absolute; right: 0; top: 0; bottom: 22px; width: 560px; clip-path: polygon(14% 0, 100% 0, 100% 100%, 0 100%); }
.media img { width: 100%; height: 100%; object-fit: cover; }
.cinta { position: absolute; left: 0; right: 0; bottom: 0; height: 22px; background: repeating-linear-gradient(90deg, #ee1922 0 56px, #f3f4f5 56px 112px); }
.tel { position: absolute; right: 40px; top: 40px; font-family: 'Mono'; font-size: 22px; background: rgb(17 19 21 / .85); padding: 8px 14px; z-index: 2; }
`;

const logo = `data:image/png;base64,${await base64('src/assets/logo/logo-pieza.png')}`;

const bombaSvg = `
<svg viewBox="0 0 560 400" fill="none" style="width:100%;height:100%;padding:70px 40px 40px 90px">
  <g stroke="#a3acb6" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M30 330h500M48 330v-18h464v18M70 312v-14h170v14M330 312v-14h160v14"/>
    <rect x="44" y="150" width="200" height="148" rx="10"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${58 + i * 14} 158v132" stroke-opacity=".55"/>`).join('')}
    <rect x="22" y="182" width="22" height="84" rx="4"/><rect x="120" y="118" width="64" height="32" rx="4"/>
    <rect x="244" y="200" width="44" height="48" rx="3"/>
    <rect x="288" y="132" width="230" height="166" rx="14"/><circle cx="403" cy="215" r="70"/>
    <circle cx="390" cy="222" r="40" stroke="#ee1922" stroke-width="3"/>
    <path d="M390 182l-6-26M425 205l26-10M406 258l14 22M356 236l-26 12" stroke="#ee1922" stroke-width="3"/>
    <path d="M340 132v-46h-24v-16h80v16h-24v46M456 132v-30h22v-16h32v16h-22"/>
  </g>
</svg>`;

const plantillas = {
  equipos: {
    titulo: 'Fabricamos su <em>equipo tipo vactor</em> a precio de fábrica',
    media: `<img src="data:image/jpeg;base64,${await base64('src/assets/fotos/equipo-azul-perfil.jpg')}">`,
    datos: [
      [`${equipos.diasFabricacion} días hábiles`, 'Fabricación'],
      [equipos.garantia, 'Garantía'],
      ['60 a 40.000 L', 'Capacidad'],
    ],
  },
  bombas: {
    titulo: 'Venta y mantenimiento de <em>bombas de vacío</em>',
    media: `<div style="width:100%;height:100%;background:#1a1d21">${bombaSvg}</div>`,
    datos: [
      [`+${site.aniosExperiencia} años`, 'En el vacío'],
      ['Repuestos', 'Envíe la foto de la placa'],
      ['Asesoría', 'Centrales de vacío'],
    ],
  },
};

await mkdir(ruta('public/og'), { recursive: true });
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 } });

for (const [nombre, p] of Object.entries(plantillas)) {
  await pagina.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}</style></head><body>
    <div class="rejilla"></div>
    <div class="media">${p.media}</div>
    <div class="tel">${contacto.telefonoVisibleIntl}</div>
    <div class="texto">
      <div class="marca"><img src="${logo}" alt=""> Aliado <span>Industrial</span></div>
      <h1>${p.titulo}</h1>
    </div>
    <div class="datos">${p.datos.map(([v, e]) => `<div>${v}<small>${e}</small></div>`).join('')}</div>
    <div class="cinta"></div>
  </body></html>`);
  await pagina.evaluate(() => document.fonts.ready);
  const salida = ruta(`public/og/${nombre}.jpg`);
  await pagina.screenshot({ path: salida, type: 'jpeg', quality: 86 });
  console.log(`og ${salida}`);
}

await navegador.close();
