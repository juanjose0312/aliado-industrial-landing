/**
 * Manifiesto de fotos. Los componentes solo usan estos objetos.
 * Para reemplazar una foto por la original: cambie el archivo (mismo nombre) o el import.
 * Todas son fotos reales de la empresa, procesadas con scripts/procesar-fotos.py
 * (placas y rótulos de terceros difuminados o recortados).
 */
import type { ImageMetadata } from 'astro';

import equipoAzulPerfil from './equipo-azul-perfil.jpg';
import equipoVerdePerfil from './equipo-verde-perfil.jpg';
import equipoCompacto from './equipo-compacto.jpg';
import tanqueChasisGrande from './tanque-chasis-grande.jpg';
import tanqueSkid from './tanque-skid.jpg';
import equipoVerdeTapa from './equipo-verde-tapa.jpg';
import equipoVerdeSuperior from './equipo-verde-superior.jpg';
import equipoAzulLateral from './equipo-azul-lateral.jpg';
import equipoVerdeNoche from './equipo-verde-noche.jpg';
import equipoAzulCalle from './equipo-azul-calle.jpg';
import equipoVerdeEntrega from './equipo-verde-entrega.jpg';
import tanqueBlancoSuperior from './tanque-blanco-superior.jpg';
import fabricacionTaller from './fabricacion-taller.jpg';
import fabricacionSoldadura from './fabricacion-soldadura.jpg';
import fabricacionMontacargas from './fabricacion-montacargas.jpg';
import tanqueMoradoBlanco from './tanque-morado-blanco.jpg';
import tanqueBlancoPintado from './tanque-blanco-pintado.jpg';
import tanqueBlancoMorado from './tanque-blanco-morado.jpg';

export type Foto = {
  src: ImageMetadata;
  alt: string;
  /** Pie de foto corto para la galería */
  pie: string;
  estado: 'terminado' | 'fabricacion';
};

export const fotos = {
  hero: {
    src: equipoAzulPerfil,
    alt: 'Equipo tipo vactor azul y blanco fabricado por Aliado Industrial, montado sobre camión, visto de perfil',
    pie: 'Equipo tipo vactor terminado',
    estado: 'terminado',
  },
  tipoVactor: {
    src: equipoVerdePerfil,
    alt: 'Camión tipo vactor con tanque de vacío verde y blanco, visto de perfil en la calle',
    pie: 'Equipo tipo vactor sobre camión',
    estado: 'terminado',
  },
  minivactor: {
    src: equipoCompacto,
    alt: 'Equipo compacto sobre ruedas con tanque de vacío blanco y verde y bomba de vacío en la parte superior',
    pie: 'Equipo compacto',
    estado: 'terminado',
  },
  tanque: {
    src: tanqueChasisGrande,
    alt: 'Tanque de vacío de gran capacidad en acero, montado sobre el chasis de un camión',
    pie: 'Tanque de vacío sobre chasis',
    estado: 'fabricacion',
  },
  tanqueSkid: {
    src: tanqueSkid,
    alt: 'Tanque de vacío blanco con bomba y tuberías, montado sobre plataforma',
    pie: 'Tanque de vacío sobre plataforma',
    estado: 'terminado',
  },
  soldadura: {
    src: fabricacionSoldadura,
    alt: 'Soldador trabajando en la tapa de un tanque de vacío montado sobre camión',
    pie: 'Soldadura de la tapa trasera',
    estado: 'fabricacion',
  },
  bandaEquipos: {
    src: equipoVerdeTapa,
    alt: 'Tapa trasera de un tanque de vacío verde con sus cierres de volante',
    pie: 'Tapa trasera con cierres',
    estado: 'terminado',
  },
} satisfies Record<string, Foto>;

/** Galería "Equipos entregados" (en este orden). */
export const galeria: Foto[] = [
  fotos.bandaEquipos,
  {
    src: equipoAzulLateral,
    alt: 'Equipo tipo vactor azul y blanco con escalera y mangueras de succión',
    pie: 'Equipo tipo vactor con mangueras de succión',
    estado: 'terminado',
  },
  {
    src: tanqueBlancoSuperior,
    alt: 'Tanque de vacío blanco visto desde arriba sobre la plataforma',
    pie: 'Tanque blanco',
    estado: 'terminado',
  },
  {
    src: equipoVerdeEntrega,
    alt: 'Equipo tipo vactor verde y blanco estacionado, listo para entrega',
    pie: 'Listo para entrega',
    estado: 'terminado',
  },
  {
    src: equipoAzulCalle,
    alt: 'Tanque de vacío azul montado sobre camión blanco',
    pie: 'Tanque azul sobre camión',
    estado: 'terminado',
  },
  {
    src: equipoVerdeNoche,
    alt: 'Camión tipo vactor verde y blanco con luces de seguridad encendidas, de noche',
    pie: 'Entrega nocturna',
    estado: 'terminado',
  },
  fotos.tanqueSkid,
  {
    src: tanqueBlancoPintado,
    alt: 'Tanque de vacío recién pintado de blanco sobre la plataforma de un camión',
    pie: 'Tanque recién pintado',
    estado: 'fabricacion',
  },
  {
    src: tanqueMoradoBlanco,
    alt: 'Tanque de vacío morado y blanco montado sobre camión',
    pie: 'Tanque morado y blanco',
    estado: 'terminado',
  },
  {
    src: tanqueBlancoMorado,
    alt: 'Vista superior de un tanque de vacío blanco con escotillas y tapa morada',
    pie: 'Escotillas y tapa trasera',
    estado: 'fabricacion',
  },
  fotos.soldadura,
  {
    src: fabricacionTaller,
    alt: 'Cuerpo de un tanque de vacío en acero sin pintar, dentro del taller',
    pie: 'Cuerpo del tanque en acero',
    estado: 'fabricacion',
  },
  {
    src: fabricacionMontacargas,
    alt: 'Montacargas levantando un tanque de vacío en acero',
    pie: 'Montaje del tanque',
    estado: 'fabricacion',
  },
  {
    src: equipoVerdeSuperior,
    alt: 'Vista superior de un tanque de vacío verde con tres escotillas',
    pie: 'Tanque con tres escotillas',
    estado: 'terminado',
  },
];
