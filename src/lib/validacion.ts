/**
 * Validación del formulario de cotización.
 * La usan el navegador (mensajes inmediatos) y /api/lead (fuente de verdad).
 */

export type Pagina = 'equipos' | 'bombas';

export const opcionesTipoEquipo = [
  { valor: 'tipo-vactor', etiqueta: 'Equipo tipo vactor' },
  { valor: 'minivactor', etiqueta: 'Minivactor' },
  { valor: 'tanque', etiqueta: 'Tanque de vacío' },
  { valor: 'no-seguro', etiqueta: 'No estoy seguro' },
] as const;

export const opcionesCamion = [
  { valor: 'si', etiqueta: 'Sí, ya tengo camión' },
  { valor: 'no-ayuda', etiqueta: 'No, necesito ayuda para conseguirlo' },
] as const;

export const opcionesNecesidad = [
  { valor: 'comprar', etiqueta: 'Comprar una bomba' },
  { valor: 'mantenimiento', etiqueta: 'Mantenimiento' },
  { valor: 'repuestos', etiqueta: 'Repuestos' },
  { valor: 'asesoria', etiqueta: 'Asesoría en montajes o centrales de vacío' },
  { valor: 'accesorios', etiqueta: 'Accesorios' },
] as const;

export const camposAtribucion = [
  'gclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export const HONEYPOT = 'sitio_web';

export const LIMITES = {
  nombre: 80,
  empresa: 100,
  celular: 20,
  ciudad: 60,
  capacidad: 60,
  marcaModelo: 120,
  mensaje: 1000,
  atribucion: 300,
  origen: 300,
} as const;

export type Lead = {
  pagina: Pagina;
  nombre: string;
  empresa: string;
  celular: string;
  ciudad: string;
  tipoEquipo: string;
  capacidad: string;
  camion: string;
  necesidad: string;
  marcaModelo: string;
  mensaje: string;
  consentimiento: true;
  origen: string;
} & Record<(typeof camposAtribucion)[number], string>;

export type Resultado =
  | { ok: true; datos: Lead; spam: boolean }
  | { ok: false; errores: Record<string, string> };

const texto = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');
const textoLargo = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/** Normaliza un celular colombiano a 10 dígitos. Acepta +57, 57, espacios, guiones y paréntesis. */
export function normalizarCelular(valor: string): string | null {
  let d = valor.replace(/[\s\-().]/g, '');
  if (d.startsWith('+57')) d = d.slice(3);
  else if (d.startsWith('57') && d.length === 12) d = d.slice(2);
  return /^3\d{9}$/.test(d) ? d : null;
}

const valores = (lista: readonly { valor: string }[]) => lista.map((o) => o.valor);

export function validarLead(entrada: Record<string, unknown>): Resultado {
  const errores: Record<string, string> = {};
  const pagina: Pagina = entrada.pagina === 'bombas' ? 'bombas' : 'equipos';

  const nombre = texto(entrada.nombre);
  const empresa = texto(entrada.empresa);
  const celularCrudo = texto(entrada.celular);
  const ciudad = texto(entrada.ciudad);
  const mensaje = textoLargo(entrada.mensaje);
  const tipoEquipo = texto(entrada.tipoEquipo);
  const capacidad = texto(entrada.capacidad);
  const camion = texto(entrada.camion);
  const necesidad = texto(entrada.necesidad);
  const marcaModelo = texto(entrada.marcaModelo);

  if (!nombre) errores.nombre = 'Escriba su nombre.';
  else if (nombre.length > LIMITES.nombre) errores.nombre = `Máximo ${LIMITES.nombre} caracteres.`;

  if (empresa.length > LIMITES.empresa) errores.empresa = `Máximo ${LIMITES.empresa} caracteres.`;

  const celular = normalizarCelular(celularCrudo);
  if (!celularCrudo) errores.celular = 'Escriba su celular o WhatsApp.';
  else if (!celular) errores.celular = 'Escriba un celular colombiano de 10 dígitos que empiece por 3. Ej.: 300 123 4567.';

  if (!ciudad) errores.ciudad = 'Escriba su ciudad.';
  else if (ciudad.length > LIMITES.ciudad) errores.ciudad = `Máximo ${LIMITES.ciudad} caracteres.`;

  if (pagina === 'equipos') {
    if (!valores(opcionesTipoEquipo).includes(tipoEquipo)) errores.tipoEquipo = 'Elija el tipo de equipo.';
    if (capacidad.length > LIMITES.capacidad) errores.capacidad = `Máximo ${LIMITES.capacidad} caracteres.`;
    if (camion && !valores(opcionesCamion).includes(camion)) errores.camion = 'Elija una opción.';
  } else {
    if (!valores(opcionesNecesidad).includes(necesidad)) errores.necesidad = 'Elija qué necesita.';
    if (marcaModelo.length > LIMITES.marcaModelo) errores.marcaModelo = `Máximo ${LIMITES.marcaModelo} caracteres.`;
  }

  if (mensaje.length > LIMITES.mensaje) errores.mensaje = `Máximo ${LIMITES.mensaje} caracteres.`;

  if (entrada.consentimiento !== true && entrada.consentimiento !== 'on' && entrada.consentimiento !== 'true') {
    errores.consentimiento = 'Debe autorizar el tratamiento de datos para enviar la solicitud.';
  }

  if (Object.keys(errores).length > 0) return { ok: false, errores };

  const atribucion = Object.fromEntries(
    camposAtribucion.map((c) => [c, texto(entrada[c]).slice(0, LIMITES.atribucion)]),
  ) as Record<(typeof camposAtribucion)[number], string>;

  return {
    ok: true,
    spam: texto(entrada[HONEYPOT]) !== '',
    datos: {
      pagina,
      nombre,
      empresa,
      celular: celular as string,
      ciudad,
      tipoEquipo: pagina === 'equipos' ? tipoEquipo : '',
      capacidad: pagina === 'equipos' ? capacidad : '',
      camion: pagina === 'equipos' ? camion : '',
      necesidad: pagina === 'bombas' ? necesidad : '',
      marcaModelo: pagina === 'bombas' ? marcaModelo : '',
      mensaje,
      consentimiento: true,
      origen: texto(entrada.origen).slice(0, LIMITES.origen),
      ...atribucion,
    },
  };
}

const etiqueta = (lista: readonly { valor: string; etiqueta: string }[], valor: string) =>
  lista.find((o) => o.valor === valor)?.etiqueta ?? valor;

/** Resumen legible para el mensaje de WhatsApp posterior al formulario. */
export function resumenLead(d: Lead): string {
  const lineas = ['Hola, acabo de enviar una solicitud desde su página web.', `Nombre: ${d.nombre}`];
  if (d.empresa) lineas.push(`Empresa: ${d.empresa}`);
  lineas.push(`Ciudad: ${d.ciudad}`);
  if (d.pagina === 'equipos') {
    lineas.push(`Equipo: ${etiqueta(opcionesTipoEquipo, d.tipoEquipo)}`);
    if (d.capacidad) lineas.push(`Capacidad aproximada: ${d.capacidad}`);
    if (d.camion) lineas.push(`Camión: ${etiqueta(opcionesCamion, d.camion)}`);
  } else {
    lineas.push(`Necesito: ${etiqueta(opcionesNecesidad, d.necesidad)}`);
    if (d.marcaModelo) lineas.push(`Bomba (marca y modelo): ${d.marcaModelo}`);
  }
  if (d.mensaje) lineas.push(`Mensaje: ${d.mensaje}`);
  return lineas.join('\n');
}

export const etiquetas = { opcionesTipoEquipo, opcionesCamion, opcionesNecesidad, etiqueta };
