/**
 * ÚNICA FUENTE DE VERDAD del sitio.
 *
 * Nombre, teléfono, correo, dirección, aviso de no afiliación, IDs de Google Ads y
 * mensajes de WhatsApp salen de aquí. Ningún componente escribe estos datos a mano.
 *
 * Regla: si un dato es `null` o una lista vacía, el componente que lo usa NO se muestra.
 * Nunca se publica "[PENDIENTE]", "TODO" ni texto de relleno.
 *
 * Este archivo solo usa sintaxis TypeScript "borrable" para que los scripts de
 * Node (check:pendientes, generar-og) puedan importarlo directamente.
 */

export const site = {
  url: 'https://aliadoindustrial.com.co',
  nombreCorto: 'Aliado Industrial',
  razonSocial: 'Aliado Industrial S.A.S.',
  ciudad: 'Bogotá',
  pais: 'Colombia',
  /** Número de identificación tributaria. null = no se muestra. */
  nit: null as string | null,
  /** Años de experiencia confirmados por el cliente (el brochure dice otra cifra; ver PENDIENTES.md). */
  aniosExperiencia: 16,
} as const;

export const contacto = {
  /** Formato E.164 para enlaces tel: */
  telefonoE164: '+573239544906',
  /** Formato legible para mostrar */
  telefonoVisible: '323 954 4906',
  telefonoVisibleIntl: '+57 323 954 4906',
  /** Número para wa.me (sin + ni espacios) */
  whatsapp: '573239544906',
  correo: 'orma.aliado@gmail.com',
  /** Dirección del brochure. Se muestra solo cuando pendientes.direccion.falta sea false. */
  direccion: {
    calle: 'Diagonal 59 I # 37-46 Sur',
    ciudad: 'Bogotá',
    region: 'Bogotá D.C.',
    pais: 'CO',
  },
  /** Horario de atención. null = no se muestra. */
  horario: null as string | null,
} as const;

export const redes = {
  facebook: 'https://www.facebook.com/aliadoindustrial/',
} as const;

/** Texto exacto exigido. Se muestra en el pie de las dos landings y bajo la lista de marcas. */
export const avisoNoAfiliacion =
  'Aliado Industrial S.A.S. diseña y fabrica sus propios equipos. "Vactor" se usa como término genérico del sector. No somos distribuidores autorizados ni representantes de Vactor Manufacturing ni de los fabricantes de bombas mencionados en este sitio. Las marcas citadas pertenecen a sus respectivos dueños.';

export const textoConsentimiento =
  'Autorizo a Aliado Industrial S.A.S. a tratar mis datos para responder esta solicitud, según su Política de tratamiento de datos.';

export type TipoLead = 'whatsapp' | 'llamada' | 'formulario';

/**
 * Google Ads. Hoy las tres conversiones apuntan a la misma acción.
 * Para separarlas basta con cambiar la etiqueta aquí.
 */
export const ads = {
  id: 'AW-18349254612',
  conversiones: {
    whatsapp: 'AW-18349254612/y0zNCOel8oIdENTPza1E',
    llamada: 'AW-18349254612/y0zNCOel8oIdENTPza1E',
    formulario: 'AW-18349254612/y0zNCOel8oIdENTPza1E',
  } satisfies Record<TipoLead, string>,
} as const;

const intro = 'Hola, vengo de su página web.';

/** Mensajes prellenados de WhatsApp por página y botón. */
export const mensajesWA = {
  equipos: {
    general: `${intro} Quiero cotizar un equipo tipo vactor.`,
    tipoVactor: `${intro} Quiero cotizar un equipo tipo vactor.`,
    minivactor: `${intro} Quiero cotizar un minivactor.`,
    tanque: `${intro} Quiero cotizar un tanque de vacío.`,
    ficha: `${intro} Quiero cotizar un equipo tipo vactor. La capacidad que necesito es:`,
    sinCamion: `${intro} Quiero cotizar un equipo tipo vactor y necesito ayuda para conseguir el camión.`,
  },
  bombas: {
    general: `${intro} Necesito información sobre bombas de vacío.`,
    placa: 'Hola, les envío la foto de la placa de mi bomba para cotizar mantenimiento o repuestos.',
    venta: `${intro} Quiero cotizar una bomba de vacío.`,
    mantenimiento: `${intro} Necesito mantenimiento para una bomba de vacío.`,
    repuestos: `${intro} Busco repuestos para una bomba de vacío.`,
    asesoria: `${intro} Necesito asesoría para un montaje o central de vacío.`,
    accesorios: `${intro} Quiero cotizar accesorios (acoples, registros o mangueras).`,
  },
  general: `${intro} Quiero más información.`,
} as const;

export const rutas = {
  equipos: '/',
  bombas: '/bombas-de-vacio',
  politica: '/politica-de-datos',
} as const;

/** Bloques opcionales: vacíos = no se muestran. */
export const opcionales = {
  testimonios: [] as { texto: string; autor: string; empresa?: string }[],
  clientes: [] as { nombre: string }[],
  cifras: [] as { valor: string; etiqueta: string }[],
  /** Ej.: { valor: '$XX.XXX.XXX', detalle: 'Tanque de 3.000 L sin camión' } */
  precioDesde: null as { valor: string; detalle: string } | null,
};

type Pendiente = {
  /** true = el dato aún no está confirmado */
  falta: boolean;
  /** true = hace falta antes de apelar o publicar la política completa */
  obligatorio: boolean;
  descripcion: string;
  dondeSeUsa: string;
  mientrasTanto: string;
};

/** Qué datos faltan. Lo lee `npm run check:pendientes`. */
export const pendientes: Record<string, Pendiente> = {
  nit: {
    falta: site.nit === null,
    obligatorio: true,
    descripcion: 'NIT de Aliado Industrial S.A.S.',
    dondeSeUsa: 'Política de datos (responsable) y pie de página',
    mientrasTanto: 'La línea del NIT no se muestra',
  },
  horario: {
    falta: contacto.horario === null,
    obligatorio: false,
    descripcion: 'Horario de atención',
    dondeSeUsa: 'Pie de página y política de datos',
    mientrasTanto: 'No se muestra horario',
  },
  direccion: {
    falta: true,
    obligatorio: true,
    descripcion: 'Confirmar dirección (¿vigente?, ¿es el taller?, ¿reciben visitas?) y perfil de Google Maps',
    dondeSeUsa: 'Pie, política de datos y JSON-LD (pasa a LocalBusiness)',
    mientrasTanto: 'Se muestra solo "Bogotá, Colombia"; la política usa el correo y el teléfono como canal',
  },
  experiencia: {
    falta: true,
    obligatorio: false,
    descripcion: 'Años de experiencia: el brochure dice "más de 30" y el cliente "más de 16"',
    dondeSeUsa: 'Hero, franja de datos, "Por qué Aliado"',
    mientrasTanto: 'Se usa "+16 años"',
  },
  material: {
    falta: true,
    obligatorio: false,
    descripcion: 'Confirmar lámina "cold rolled" de 3/16" (en ese espesor es más común hot rolled)',
    dondeSeUsa: 'Ficha técnica y preguntas frecuentes',
    mientrasTanto: 'Se muestra "lámina de acero de 3/16"" sin especificar el laminado',
  },
};

/** Material mostrado mientras se confirma el tipo de laminado. */
export const materiales = ['Acero inoxidable', 'Lámina de acero de 3/16"'] as const;

/** Datos técnicos confirmados de los equipos. */
export const equipos = {
  capacidadMinL: 60,
  capacidadMaxL: 40000,
  litrosPorGalon: 3.785,
  litrosPorBarril: 159,
  diasFabricacion: 25,
  garantia: '1 año',
  garantiaDetalle: '1 año, excepto daños por mal uso',
} as const;

export const marcasBombas = [
  'Nash',
  'Welch',
  'Siemens',
  'Elmo Rietschle',
  'Masport',
  'Honda',
  'Gast',
  'Toyama',
  'adixen (Pfeiffer Vacuum)',
  'Gardner Denver',
  'Conde',
  'Interpump',
  'Tuthill (Kinney)',
  'Busch',
  'Leybold',
  'SIHI',
  'Cat Pumps',
  'Pompetravaini',
  'DeLaval',
] as const;

export const accesorios = [
  'Acoples rápidos tipo camlock',
  'Registros (válvulas de bola)',
  'Mangueras de succión',
  'Mangueras con refuerzo de alambre',
  'Mangueras hidráulicas',
] as const;
