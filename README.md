# Aliado Industrial — landings de conversión

Dos landings para las campañas de Google Ads de **Aliado Industrial S.A.S.** (Bogotá), en `aliadoindustrial.com.co`:

| Ruta | Campaña |
|---|---|
| `/` | Equipos tipo vactor, minivactor y tanques de vacío |
| `/bombas-de-vacio` | Venta, mantenimiento y repuestos de bombas de vacío |
| `/politica-de-datos` | Política de tratamiento de datos (Ley 1581 de 2012) |
| `/api/lead` | Endpoint del formulario (POST → Google Sheets) |

Stack: Astro 7 (salida estática), Tailwind CSS 4, TypeScript y el adaptador `@astrojs/vercel`. Solo `/api/lead` corre como función. No usa frameworks de UI.

> **Antes de tocar textos:** lea las reglas de cumplimiento en la sección [Cumplimiento](#cumplimiento) y corra `npm run check:marca`.

---

## Correr en local

Requisitos: **Node 22.18 o superior** (recomendado Node 24) y npm. Python 3 con Pillow solo hace falta si va a reprocesar fotos o el logo.

```bash
npm install
npm run dev          # http://localhost:4321
```

En desarrollo:
- El formulario funciona sin configuración: `/api/lead` muestra el lead en la consola y responde OK.
- La medición no envía nada a Google Ads: cada conversión aparece como `console.info('[trackLead] …')` en la consola del navegador.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (salida en `.vercel/output`) |
| `npm run servir` | Sirve el build estático con compresión en http://localhost:4400 (para Lighthouse; no ejecuta `/api/lead`) |
| `npm run check` | Revisión de tipos (`astro check`) |
| `npm run check:marca` | Revisión de cumplimiento de marca. **Debe salir limpio.** |
| `npm run check:pendientes` | Lista los datos de la empresa que faltan. Solo avisa. |
| `npm run fotos` | Reprocesa las fotos de `assets-source/` (recortes y placas difuminadas) |
| `npm run logo` | Regenera el logo transparente, el favicon y el apple-touch-icon |
| `npm run og` | Regenera las imágenes Open Graph de `public/og/` |
| `npm run capturas` | Capturas a 390 y 1440 px y verificación de scroll horizontal desde 360 px (requiere el sitio corriendo; `BASE_URL` opcional) |

Para `fotos` y `logo`: `pip install pillow`. Para `og` y `capturas`: `npx playwright install chromium` una vez.

---

## Variables de entorno

Copie `.env.example` a `.env` para pruebas locales y configure las mismas variables en Vercel (**Settings → Environment Variables**).

| Variable | Para qué |
|---|---|
| `SHEETS_WEBHOOK_URL` | URL `/exec` de la aplicación web de Google Apps Script |
| `SHEETS_SECRET` | Secreto compartido; igual a la propiedad `SECRET` del script |

Sin estas variables, el formulario muestra "Solicitud recibida", pero **no guarda los datos** (solo quedan en los logs de Vercel).

👉 Paso a paso para crear la hoja y el script: **[docs/formulario-google-sheets.md](docs/formulario-google-sheets.md)**.

---

## Desplegar en Vercel

1. Suba el proyecto a un repositorio de GitHub, GitLab o Bitbucket.
2. En [vercel.com/new](https://vercel.com/new), importe el repositorio. Vercel detecta Astro; no cambie los comandos (`npm run build`).
3. En **Settings → Environment Variables**, agregue `SHEETS_WEBHOOK_URL` y `SHEETS_SECRET` (entorno *Production*).
4. Despliegue. Cada `git push` a la rama principal publica una versión nueva; las demás ramas generan vistas previas.

Si cambia variables de entorno, vuelva a desplegar (**Deployments → ⋯ → Redeploy**).

### Conectar el dominio aliadoindustrial.com.co

Según la documentación de Vercel ("Adding & Configuring a Custom Domain", actualizada el 16-09-2026):

1. En el proyecto, abra **Settings → Domains** y haga clic en **Add Domain**.
2. Escriba `aliadoindustrial.com.co`. Vercel ofrece agregar también `www.aliadoindustrial.com.co`: acéptelo.
3. **Dominio principal:** el sitio usa `https://aliadoindustrial.com.co` (sin `www`) en el canonical, el sitemap y el JSON-LD. Configure `www.aliadoindustrial.com.co` para que **redirija** a `aliadoindustrial.com.co` (y no al revés).
4. En el proveedor donde compró el dominio `.com.co`, cree los registros DNS **exactamente con los valores que muestra Vercel** en la tarjeta de cada dominio:
   - **Dominio raíz** (`aliadoindustrial.com.co`): un registro **A**. El valor general es `76.76.21.21`, pero use el que muestre su tarjeta.
   - **`www`**: un registro **CNAME** con el valor propio del proyecto que muestre Vercel (del tipo `xxxxxxxx.vercel-dns-0xx.com`).
   - Borre cualquier otro registro A, AAAA o CNAME para esos mismos nombres, porque generan "Invalid Configuration".
   - **No toque los registros MX ni TXT** del correo.
5. Espere a que Vercel marque ambos dominios como **Valid Configuration**. El certificado HTTPS se emite solo. La propagación DNS puede tardar desde minutos hasta horas.

Alternativa: delegar los *nameservers* del dominio a Vercel. Antes copie a Vercel todos los registros existentes (sobre todo los de correo).

> ⚠️ `aliadoindustrial.com` (sin `.co`) es de **otra empresa, en Perú**. No lo use en ningún enlace ni configuración.

### Google Ads

- Etiqueta: `AW-18349254612`. Conversión: `AW-18349254612/y0zNCOel8oIdENTPza1E`, la misma para WhatsApp, llamada y formulario. Se configura en `src/config/site.ts → ads.conversiones`. Para separar las conversiones, basta con cambiar las etiquetas ahí.
- Se dispara **solo** con clics en WhatsApp o `tel:` y con una respuesta OK del formulario; nunca al cargar la página. El código está en `src/scripts/tracking.ts`.
- `gtag.js` se descarga de forma asíncrona tras la primera interacción o unos segundos después de cargar la página. Las conversiones se encolan en `dataLayer`, así que no se pierden.
- Para comprobar en producción: Google Tag Assistant, o en DevTools → Network buscando `googleadservices.com/pagead/conversion` al hacer clic en WhatsApp.
- El módulo admite más adaptadores (GA4, Meta Pixel), pero hoy no tiene ninguno activo.

---

## Estructura

```
src/
  config/site.ts          ← ÚNICA fuente: empresa, contacto, aviso, Ads, mensajes WhatsApp, pendientes
  assets/fotos/index.ts   ← manifiesto de fotos (cambie fotos aquí, no en los componentes)
  assets/logo/            ← logo transparente generado desde assets-source/logo.jpeg
  components/             ← Header + selector, Hero, FichaTecnica, Galeria, Formulario, Faq, Footer…
  components/opcionales/  ← Testimonios, Clientes, Cifras, PrecioDesde (no se muestran si están vacíos)
  lib/                    ← validacion.ts (cliente y servidor), whatsapp.ts, unidades.ts
  scripts/                ← JS del cliente: tracking, formulario, atribución (gclid/utm), unidades, galería
  pages/                  ← index, bombas-de-vacio, politica-de-datos, 404, api/lead.ts
apps-script/Code.gs       ← código de Google Apps Script
docs/                     ← guía del formulario
scripts/                  ← fotos, logo, OG, capturas, checks
assets-source/            ← originales (brochure, logo, fotos); no se publican
PENDIENTES.md             ← datos por confirmar con el cliente
```

### Cambiar datos de la empresa

Todo está en [`src/config/site.ts`](src/config/site.ts): teléfono, correo, NIT, horario, dirección, mensajes de WhatsApp, marcas, accesorios, testimonios y precio "desde". Un dato en `null` o una lista vacía hace que el bloque correspondiente **no se muestre**.

Para publicar la dirección: confírmela y ponga `pendientes.direccion.falta = false`. Aparece en el pie y en la política, y el JSON-LD pasa a `LocalBusiness`.

---

## Cumplimiento

La cuenta de Google Ads fue suspendida por "Prácticas comerciales inaceptables". Estas reglas están por encima de cualquier cambio de diseño o de texto:

- "Vactor" es marca de Vactor Manufacturing. Escriba solo **"equipo tipo vactor"**, **"camión tipo vactor"** o **"minivactor"**. Nunca "Vactor" solo, nunca números de modelo y nunca logos de esa marca.
- Las marcas de bombas van solo en la sección **Marcas** de `/bombas-de-vacio`, en texto o logos monocromo grises (nunca a color), siempre junto al aviso de no afiliación. Los logos están en `src/assets/marcas/` (nombre de archivo = nombre de la marca en minúsculas con guiones); las marcas sin logo se muestran en texto.
- No use "distribuidor", "autorizado", "oficial" ni "representante" aplicados a la empresa, salvo en el aviso y en la pregunta frecuente que los niega.
- No invente cifras, testimonios, clientes, certificaciones, precios ni tiempos de respuesta.
- No mencione importación, hidroexcavación, hidrolavado, alta presión ni venta de camiones.
- Use solo fotos reales, con las placas y los nombres de clientes difuminados.

`npm run check:marca` revisa automáticamente buena parte de estas reglas. Córralo antes de cada despliegue.
