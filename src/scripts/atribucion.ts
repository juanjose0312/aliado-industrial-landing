/**
 * Guarda gclid y utm_* de la URL de llegada en sessionStorage para enviarlos con el formulario.
 * Si la URL trae parámetros nuevos, reemplazan a los guardados. Todo con try/catch:
 * en modo privado o con almacenamiento bloqueado el sitio sigue funcionando.
 */
import { camposAtribucion } from '../lib/validacion';

const CLAVE = 'aliado:atribucion';
type Atribucion = Partial<Record<(typeof camposAtribucion)[number], string>>;

export function capturarAtribucion(): void {
  try {
    const params = new URLSearchParams(location.search);
    const nuevos: Atribucion = {};
    for (const campo of camposAtribucion) {
      const valor = params.get(campo);
      if (valor) nuevos[campo] = valor.slice(0, 300);
    }
    if (Object.keys(nuevos).length > 0) sessionStorage.setItem(CLAVE, JSON.stringify(nuevos));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function leerAtribucion(): Atribucion {
  try {
    const guardado = sessionStorage.getItem(CLAVE);
    if (guardado) return JSON.parse(guardado) as Atribucion;
  } catch {
    /* almacenamiento no disponible */
  }
  // Sin almacenamiento: al menos lo que traiga la URL actual.
  const params = new URLSearchParams(location.search);
  const actual: Atribucion = {};
  for (const campo of camposAtribucion) {
    const valor = params.get(campo);
    if (valor) actual[campo] = valor;
  }
  return actual;
}
