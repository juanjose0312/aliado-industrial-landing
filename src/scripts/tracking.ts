/**
 * Medición de contactos. Un solo punto de entrada: trackLead(tipo, origen).
 *
 * - Se dispara solo por acción del usuario (clic en WhatsApp / tel:, o envío OK del formulario).
 *   Nunca al cargar la página.
 * - Delegación por atributos: <a data-lead="whatsapp" data-origen="hero">.
 * - En desarrollo hace console.info en lugar de enviar.
 * - Para sumar GA4 o el Pixel de Meta, agregue un adaptador a `adaptadores`.
 */
import { ads, type TipoLead } from '../config/site';

type Adaptador = (tipo: TipoLead, origen: string) => void;

const googleAds: Adaptador = (tipo, origen) => {
  window.dataLayer = window.dataLayer || [];
  const gtag =
    window.gtag ??
    function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };
  gtag('event', 'conversion', {
    send_to: ads.conversiones[tipo],
    event_category: 'lead',
    event_label: `${tipo}:${origen}`,
  });
};

const adaptadores: Adaptador[] = [googleAds];

const TIPOS: readonly TipoLead[] = ['whatsapp', 'llamada', 'formulario'];

export function trackLead(tipo: TipoLead, origen: string): void {
  const pagina = location.pathname;
  const etiqueta = `${pagina}#${origen}`;
  if (import.meta.env.DEV) {
    console.info('[trackLead]', { tipo, origen: etiqueta, send_to: ads.conversiones[tipo] });
    return;
  }
  for (const adaptador of adaptadores) {
    try {
      adaptador(tipo, etiqueta);
    } catch (error) {
      console.error('[trackLead]', error);
    }
  }
}

/** Un único listener delegado: cada clic dispara como máximo una conversión. */
export function iniciarTracking(): void {
  if (window.__aliadoTracking) return;
  window.__aliadoTracking = true;
  document.addEventListener(
    'click',
    (evento) => {
      const objetivo = evento.target instanceof Element ? evento.target.closest<HTMLElement>('[data-lead]') : null;
      if (!objetivo) return;
      const tipo = objetivo.dataset.lead as TipoLead;
      if (!TIPOS.includes(tipo) || tipo === 'formulario') return;
      trackLead(tipo, objetivo.dataset.origen ?? 'sin-origen');
    },
    { capture: true },
  );
}
