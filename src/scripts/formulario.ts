/**
 * Formulario de cotización: validación en español, estado de carga, éxito sin recargar
 * (con "Continuar por WhatsApp" y el resumen) y error con alternativas de contacto.
 */
import { validarLead, resumenLead, HONEYPOT, type Lead } from '../lib/validacion';
import { enlaceWhatsApp } from '../lib/whatsapp';
import { leerAtribucion } from './atribucion';
import { trackLead } from './tracking';

function leerFormulario(form: HTMLFormElement): Record<string, unknown> {
  const fd = new FormData(form);
  const datos: Record<string, unknown> = {};
  fd.forEach((valor, clave) => {
    if (typeof valor === 'string') datos[clave] = valor;
  });
  const consentimiento = form.querySelector<HTMLInputElement>('input[name="consentimiento"]');
  datos.consentimiento = consentimiento?.checked === true;
  datos.pagina = form.dataset.pagina;
  datos.origen = `${location.pathname}#${form.id}`;
  return { ...datos, ...leerAtribucion() };
}

function campo(form: HTMLFormElement, nombre: string) {
  return form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${nombre}"]`);
}

function mostrarErrores(form: HTMLFormElement, errores: Record<string, string>, enfocar: boolean) {
  form.querySelectorAll<HTMLElement>('[data-error-para]').forEach((p) => {
    const nombre = p.dataset.errorPara ?? '';
    const mensaje = errores[nombre];
    const control = campo(form, nombre);
    p.textContent = mensaje ?? '';
    p.hidden = !mensaje;
    if (control) {
      if (mensaje) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    }
  });
  if (enfocar) {
    const primero = Object.keys(errores)[0];
    if (primero) campo(form, primero)?.focus();
  }
}

function iniciarFormulario(form: HTMLFormElement) {
  const contenedor = form.closest<HTMLElement>('[data-bloque-formulario]');
  const exito = contenedor?.querySelector<HTMLElement>('[data-estado-exito]');
  const fallo = form.querySelector<HTMLElement>('[data-estado-error]');
  const boton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const textoBoton = boton?.querySelector<HTMLElement>('[data-texto]');
  const textoCargando = boton?.querySelector<HTMLElement>('[data-cargando]');
  let intentado = false;

  const revalidar = () => {
    if (!intentado) return;
    const r = validarLead(leerFormulario(form));
    mostrarErrores(form, r.ok ? {} : r.errores, false);
  };
  form.addEventListener('input', revalidar);
  form.addEventListener('change', revalidar);

  const cargando = (activo: boolean) => {
    if (!boton) return;
    boton.disabled = activo;
    boton.setAttribute('aria-busy', String(activo));
    if (textoBoton) textoBoton.hidden = activo;
    if (textoCargando) textoCargando.hidden = !activo;
  };

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    intentado = true;
    if (fallo) fallo.hidden = true;

    const entrada = leerFormulario(form);
    const r = validarLead(entrada);
    if (!r.ok) {
      mostrarErrores(form, r.errores, true);
      return;
    }
    mostrarErrores(form, {}, false);
    cargando(true);

    try {
      const respuesta = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...entrada, [HONEYPOT]: entrada[HONEYPOT] ?? '' }),
      });
      const cuerpo = (await respuesta.json().catch(() => ({}))) as { ok?: boolean; errores?: Record<string, string> };

      if (respuesta.status === 422 && cuerpo.errores) {
        mostrarErrores(form, cuerpo.errores, true);
        return;
      }
      if (!respuesta.ok || !cuerpo.ok) throw new Error(`HTTP ${respuesta.status}`);

      trackLead('formulario', form.dataset.pagina ?? 'formulario');
      mostrarExito(r.datos);
    } catch (error) {
      console.error('[formulario]', error);
      if (fallo) {
        fallo.hidden = false;
        fallo.focus();
      }
    } finally {
      cargando(false);
    }
  });

  function mostrarExito(datos: Lead) {
    if (!exito) return;
    const enlace = exito.querySelector<HTMLAnchorElement>('[data-wa-resumen]');
    if (enlace) enlace.href = enlaceWhatsApp(resumenLead(datos));
    const nombre = exito.querySelector<HTMLElement>('[data-nombre]');
    if (nombre) nombre.textContent = datos.nombre.split(' ')[0];
    form.hidden = true;
    exito.hidden = false;
    exito.focus();
  }
}

export function iniciarFormularios(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-formulario-lead]').forEach(iniciarFormulario);
}
