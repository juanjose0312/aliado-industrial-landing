import type { APIRoute } from 'astro';
import { validarLead, etiquetas } from '../../lib/validacion';

// Único endpoint renderizado bajo demanda (función de Vercel).
export const prerender = false;

const json = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/** Fecha y hora de Bogotá, p. ej. "2026-10-03 14:05:09". */
function fechaBogota(d = new Date()): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  const p = Object.fromEntries(partes.map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

export const POST: APIRoute = async ({ request }) => {
  let entrada: Record<string, unknown>;
  try {
    entrada = await request.json();
    if (!entrada || typeof entrada !== 'object') throw new Error('cuerpo inválido');
  } catch {
    return json({ ok: false, error: 'Solicitud inválida.' }, 400);
  }

  const resultado = validarLead(entrada);
  if (!resultado.ok) return json({ ok: false, errores: resultado.errores }, 422);

  // Honeypot lleno: respondemos OK sin guardar nada.
  if (resultado.spam) return json({ ok: true });

  const d = resultado.datos;
  const fila = {
    fecha: fechaBogota(),
    ...d,
    tipoEquipo: d.tipoEquipo ? etiquetas.etiqueta(etiquetas.opcionesTipoEquipo, d.tipoEquipo) : '',
    camion: d.camion ? etiquetas.etiqueta(etiquetas.opcionesCamion, d.camion) : '',
    necesidad: d.necesidad ? etiquetas.etiqueta(etiquetas.opcionesNecesidad, d.necesidad) : '',
  };

  const url = import.meta.env.SHEETS_WEBHOOK_URL;
  const secreto = import.meta.env.SHEETS_SECRET;

  // Desarrollo / sin configurar: registrar y responder OK para probar la interfaz.
  if (!url || !secreto) {
    console.info('[api/lead] Sin SHEETS_WEBHOOK_URL/SHEETS_SECRET. Lead recibido (no se guardó):', fila);
    return json({ ok: true, simulado: true });
  }

  try {
    // Apps Script responde 302 hacia googleusercontent.com; fetch la sigue (redirect: 'follow')
    // y el cuerpo final es el JSON de doPost. text/plain evita problemas de tipo de contenido.
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ secret: secreto, lead: fila }),
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    });
    const texto = await respuesta.text();
    let cuerpo: { ok?: boolean; error?: string } = {};
    try {
      cuerpo = JSON.parse(texto);
    } catch {
      throw new Error(`Respuesta no JSON de Apps Script (HTTP ${respuesta.status}): ${texto.slice(0, 200)}`);
    }
    if (!respuesta.ok || !cuerpo.ok) {
      throw new Error(`Apps Script rechazó el lead (HTTP ${respuesta.status}): ${cuerpo.error ?? 'sin detalle'}`);
    }
    return json({ ok: true });
  } catch (error) {
    console.error('[api/lead] No se pudo guardar el lead:', error, fila);
    return json({ ok: false, error: 'No pudimos registrar su solicitud.' }, 502);
  }
};

export const ALL: APIRoute = () => json({ ok: false, error: 'Método no permitido.' }, 405);
