# Conectar el formulario con Google Sheets

Esta guía es para alguien que nunca ha usado Apps Script. Toma unos 15 minutos.

**Cómo funciona:** el formulario de la página envía los datos a `/api/lead`, una función que corre en Vercel. Esa función valida los datos y los reenvía a una pequeña aplicación de Google Apps Script. La aplicación agrega una fila en la hoja **Leads** y, si usted lo configura, le avisa por correo.

```
Navegador → /api/lead (Vercel) → Apps Script → Hoja "Leads" + correo de aviso
```

Mientras no haga estos pasos, el formulario funciona igual en la página (muestra "Solicitud recibida"), pero **los datos no se guardan**: solo quedan en los registros de Vercel.

---

## 1. Crear la hoja

1. Entre a [sheets.google.com](https://sheets.google.com) con la cuenta de Google de la empresa (por ejemplo, orma.aliado@gmail.com).
2. Cree una hoja en blanco y póngale un nombre, por ejemplo **Leads sitio web — Aliado Industrial**.
3. No hace falta crear columnas: el script crea la pestaña **Leads** con sus encabezados la primera vez que llega un dato.

## 2. Abrir Apps Script y pegar el código

1. En la hoja, abra el menú **Extensiones → Apps Script**. Se abre una pestaña nueva con un archivo `Código.gs`.
2. Borre todo lo que tenga ese archivo.
3. Abra el archivo [`apps-script/Code.gs`](../apps-script/Code.gs) de este proyecto, copie **todo** su contenido y péguelo.
4. Arriba, cambie el nombre del proyecto ("Proyecto sin título") por **Leads Aliado Industrial**.
5. Haga clic en el ícono de guardar (💾) o presione `Ctrl + S`.

## 3. Configurar las propiedades del script

Las propiedades guardan datos privados sin escribirlos dentro del código.

1. En el menú de la izquierda, haga clic en el engranaje **Configuración del proyecto**.
2. Baje hasta **Propiedades del script** y haga clic en **Agregar propiedad del script**.
3. Agregue:

   | Propiedad | Valor | ¿Obligatoria? |
   |---|---|---|
   | `SECRET` | Una clave larga e inventada, por ejemplo de 32 letras y números al azar. **Anótela**: la va a necesitar en el paso 6. | Sí |
   | `NOTIFY_EMAIL` | El correo que recibe el aviso de cada lead, por ejemplo `orma.aliado@gmail.com`. Puede poner varios separados por coma. | No |

4. Haga clic en **Guardar propiedades del script**.

> Para inventar un secreto seguro puede usar un generador de contraseñas, sin espacios ni comillas.

## 4. Publicar como aplicación web

1. Arriba a la derecha, haga clic en **Implementar → Nueva implementación**.
2. Al lado de "Seleccionar tipo", haga clic en el engranaje y elija **Aplicación web**.
3. Complete:
   - **Descripción:** `Leads sitio web`
   - **Ejecutar como:** **Yo** (su correo)
   - **Quién tiene acceso:** **Cualquier usuario**
4. Haga clic en **Implementar**.
5. Google le pide **Autorizar acceso**. Elija su cuenta. Si aparece "Google no verificó esta aplicación", haga clic en **Configuración avanzada → Ir a Leads Aliado Industrial (no seguro)** y luego en **Permitir**. Es normal: la aplicación es suya y solo usted la usa.

"Cualquier usuario" significa que la función de Vercel puede enviarle datos sin iniciar sesión. Nadie más puede escribir en la hoja sin conocer el `SECRET`.

## 5. Copiar la URL

Al terminar, Google muestra la **URL de la aplicación web**. Termina en `/exec`, por ejemplo:

```
https://script.google.com/macros/s/AKfycb.../exec
```

Cópiela. Para comprobarla, ábrala en el navegador: debe mostrar `{"ok":true,"servicio":"leads Aliado Industrial"}`.

## 6. Poner las variables de entorno en Vercel

1. Entre a [vercel.com](https://vercel.com), abra el proyecto del sitio y vaya a **Settings → Environment Variables**.
2. Agregue estas dos variables y marque el entorno **Production** (y **Preview**, si quiere probar en las vistas previas):

   | Nombre | Valor |
   |---|---|
   | `SHEETS_WEBHOOK_URL` | La URL `/exec` del paso 5 |
   | `SHEETS_SECRET` | El mismo valor exacto de la propiedad `SECRET` del paso 3 |

3. Guarde.

Para probar en su computador, cree un archivo `.env` en la raíz del proyecto, copiando `.env.example`, con los mismos dos valores. Ese archivo no se sube al repositorio.

## 7. Volver a desplegar

Las variables nuevas solo se aplican en un despliegue nuevo.

- En Vercel, vaya a **Deployments**, abra el último despliegue y elija **⋯ → Redeploy**, o
- haga un `git push` a la rama principal.

## 8. Enviar una prueba

1. Abra https://aliadoindustrial.com.co, baje hasta el formulario y envíe una solicitud de prueba con datos reales: celular de 10 dígitos que empiece por 3 y la casilla de autorización marcada.
2. Debe ver **"Solicitud recibida"**.
3. En la hoja aparece la pestaña **Leads** con una fila nueva. Si configuró `NOTIFY_EMAIL`, le llega un correo.
4. Borre la fila de prueba.

---

## Si algo falla

| Síntoma | Causa probable | Solución |
|---|---|---|
| La página muestra "No pudimos enviar su solicitud" | La función no pudo guardar en Apps Script | En Vercel, abra **Logs** y busque `[api/lead]`: ahí aparece el motivo y los datos del lead, para no perderlo. |
| En los logs: `No autorizado` | `SHEETS_SECRET` (Vercel) y `SECRET` (script) no coinciden | Cópielos de nuevo, sin espacios al inicio o al final, y vuelva a desplegar. |
| En los logs: `Respuesta no JSON… HTTP 401/403` o una página de inicio de sesión | La aplicación web no está en "Cualquier usuario" | Repita el paso 4. |
| Cambié el código del script y no se nota | Apps Script sigue sirviendo la versión anterior | **Implementar → Administrar implementaciones → ✏️ Editar → Versión: Nueva versión → Implementar**. Así la URL no cambia. |
| No llega el correo | Falta `NOTIFY_EMAIL` o se superó la cuota diaria de MailApp | Revise la propiedad. Las cuentas gratuitas de Gmail tienen un límite diario de correos. |

**Importante:** si hace una **Nueva implementación** en lugar de editar la existente, la URL cambia y debe actualizar `SHEETS_WEBHOOK_URL` en Vercel.
