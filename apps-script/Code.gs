/**
 * Aliado Industrial — recepción de leads del sitio web.
 *
 * Recibe el POST que hace la función /api/lead de Vercel (servidor a servidor),
 * verifica el secreto, agrega una fila en la hoja "Leads" y envía un aviso por correo.
 *
 * Propiedades del script (Configuración del proyecto → Propiedades del script):
 *   SECRET        (obligatoria) mismo valor que la variable SHEETS_SECRET de Vercel
 *   NOTIFY_EMAIL  (opcional)    correo(s) que reciben el aviso, separados por coma
 *
 * Instrucciones completas: docs/formulario-google-sheets.md
 */

var NOMBRE_HOJA = 'Leads';

// Orden de las columnas de la hoja. Clave del lead → encabezado visible.
var COLUMNAS = [
  ['fecha', 'Fecha (Bogotá)'],
  ['pagina', 'Página'],
  ['nombre', 'Nombre'],
  ['empresa', 'Empresa'],
  ['celular', 'Celular'],
  ['ciudad', 'Ciudad'],
  ['tipoEquipo', 'Tipo de equipo'],
  ['capacidad', 'Capacidad aprox.'],
  ['camion', '¿Tiene camión?'],
  ['necesidad', 'Necesidad (bombas)'],
  ['marcaModelo', 'Marca y modelo'],
  ['mensaje', 'Mensaje'],
  ['consentimiento', 'Autorizó datos'],
  ['origen', 'Origen'],
  ['gclid', 'gclid'],
  ['utm_source', 'utm_source'],
  ['utm_medium', 'utm_medium'],
  ['utm_campaign', 'utm_campaign'],
  ['utm_term', 'utm_term'],
  ['utm_content', 'utm_content'],
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // 1. Leer el JSON
    if (!e || !e.postData || !e.postData.contents) return responder({ ok: false, error: 'Sin cuerpo' });
    var cuerpo;
    try {
      cuerpo = JSON.parse(e.postData.contents);
    } catch (err) {
      return responder({ ok: false, error: 'JSON inválido' });
    }

    // 2. Verificar el secreto
    var props = PropertiesService.getScriptProperties();
    var secreto = props.getProperty('SECRET');
    if (!secreto) return responder({ ok: false, error: 'Falta la propiedad SECRET en el script' });
    if (cuerpo.secret !== secreto) return responder({ ok: false, error: 'No autorizado' });

    var lead = cuerpo.lead || {};

    // 3. Evitar que dos envíos simultáneos se pisen
    lock.waitLock(20000);

    // 4. Crear la hoja con encabezados si no existe
    var libro = SpreadsheetApp.getActiveSpreadsheet();
    var hoja = libro.getSheetByName(NOMBRE_HOJA);
    if (!hoja) {
      hoja = libro.insertSheet(NOMBRE_HOJA);
      hoja.appendRow(COLUMNAS.map(function (c) { return c[1]; }));
      hoja.setFrozenRows(1);
      hoja.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold');
    }

    // 5. Agregar la fila. Todo como texto (el prefijo ' evita que Sheets interprete fórmulas o números).
    var fila = COLUMNAS.map(function (c) {
      var valor = lead[c[0]];
      if (valor === true) return 'Sí';
      if (valor === undefined || valor === null) return '';
      return "'" + String(valor).slice(0, 2000);
    });
    hoja.appendRow(fila);
    SpreadsheetApp.flush();
    lock.releaseLock();

    // 6. Aviso por correo (opcional)
    var destino = props.getProperty('NOTIFY_EMAIL');
    if (destino) {
      try {
        enviarAviso(destino, lead, libro.getUrl());
      } catch (errCorreo) {
        console.error('No se pudo enviar el aviso: ' + errCorreo);
      }
    }

    // 7. Responder con JSON
    return responder({ ok: true });
  } catch (err) {
    console.error(err);
    return responder({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) { /* ya liberado */ }
  }
}

/** Para probar en el navegador que la aplicación web está publicada. */
function doGet() {
  return responder({ ok: true, servicio: 'leads Aliado Industrial' });
}

function enviarAviso(destino, lead, urlHoja) {
  var linea = lead.pagina === 'bombas' ? 'Bombas de vacío' : 'Equipos tipo vactor y tanques';
  var asunto = 'Nuevo lead (' + linea + '): ' + (lead.nombre || '') + ' — ' + (lead.ciudad || '');
  var detalle = COLUMNAS
    .filter(function (c) { return lead[c[0]] !== undefined && lead[c[0]] !== '' && lead[c[0]] !== null; })
    .map(function (c) { return c[1] + ': ' + (lead[c[0]] === true ? 'Sí' : lead[c[0]]); })
    .join('\n');
  var wa = lead.celular ? '\n\nResponder por WhatsApp: https://wa.me/57' + lead.celular : '';
  MailApp.sendEmail({
    to: destino,
    subject: asunto,
    body: detalle + wa + '\n\nHoja de leads: ' + urlHoja,
  });
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
