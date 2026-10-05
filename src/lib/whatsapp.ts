import { contacto } from '../config/site';

/** Enlace wa.me con mensaje prellenado. */
export function enlaceWhatsApp(mensaje: string): string {
  return `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

export const enlaceTelefono = `tel:${contacto.telefonoE164}`;
