import { equipos } from '../config/site';

export type Unidad = 'L' | 'gal' | 'bbl';

export const nombresUnidad: Record<Unidad, { corto: string; largo: string }> = {
  L: { corto: 'L', largo: 'litros' },
  gal: { corto: 'gal', largo: 'galones' },
  bbl: { corto: 'bbl', largo: 'barriles' },
};

const formato = (n: number, decimales = 0) =>
  n.toLocaleString('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

/** Convierte litros a la unidad pedida y lo devuelve con formato colombiano. */
export function convertir(litros: number, unidad: Unidad): string {
  if (unidad === 'L') return formato(litros);
  if (unidad === 'gal') {
    const galones = litros / equipos.litrosPorGalon;
    // Cifras grandes redondeadas a la decena: 40.000 L ≈ 10.570 gal
    return formato(galones >= 1000 ? Math.round(galones / 10) * 10 : Math.round(galones));
  }
  const barriles = litros / equipos.litrosPorBarril;
  return barriles < 10 ? formato(barriles, 1) : formato(Math.round(barriles));
}

/** Rango de capacidad en las tres unidades, p. ej. { L: ['60', '40.000'], ... } */
export function rangoCapacidad(): Record<Unidad, [string, string]> {
  const { capacidadMinL: min, capacidadMaxL: max } = equipos;
  return {
    L: [convertir(min, 'L'), convertir(max, 'L')],
    gal: [convertir(min, 'gal'), convertir(max, 'gal')],
    bbl: [convertir(min, 'bbl'), convertir(max, 'bbl')],
  };
}
