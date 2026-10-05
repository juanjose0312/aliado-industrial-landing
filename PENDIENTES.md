# Datos pendientes — Aliado Industrial

Qué falta confirmar con el cliente, dónde se usa y qué muestra el sitio mientras tanto.
Regla del sitio: **si un dato no está confirmado, no se publica**. Nunca aparece "[PENDIENTE]" ni texto de relleno.

Los datos de contacto y de empresa se cambian en un solo lugar: [`src/config/site.ts`](src/config/site.ts).
`npm run check:pendientes` lista los datos de ese archivo que siguen vacíos.

## 1. Obligatorios antes de la apelación de Google Ads

| Dato | Dónde se usa | Mientras tanto | Cómo completarlo |
|---|---|---|---|
| **NIT** | Política de datos (responsable) y pie de página | La línea del NIT no se muestra | `site.nit` en `site.ts` |
| **Dirección**: ¿sigue vigente Diagonal 59 I # 37-46 Sur? ¿Es el taller? ¿Reciben visitas? ¿Tienen perfil en Google Maps? | Pie, política de datos y JSON-LD | Solo se muestra "Bogotá, Colombia" y el JSON-LD es `Organization` | Si se confirma: `pendientes.direccion.falta = false`. La dirección aparece en el pie y en la política, y el JSON-LD pasa a `LocalBusiness`. |

> Indicio a favor: en varias fotos la fachada tiene el número **37-46** y el letrero de Aliado Industrial. Aun así, falta la confirmación del cliente.

## 2. Datos de la empresa

| Dato | Dónde se usa | Mientras tanto |
|---|---|---|
| Horario de atención | Pie y política de datos | No se muestra (`contacto.horario = null`) |
| Años de experiencia: el brochure dice "más de 30" y el cliente respondió "más de 16" | Hero, franja de datos, "Por qué Aliado", banda de bombas | "+16 años" (`site.aniosExperiencia`) |
| Formas de pago y si emiten factura electrónica | No se usa | Nada |
| Clientes que se puedan nombrar (con permiso por escrito) | Componente `Clientes` | Oculto (`opcionales.clientes = []`) |
| Testimonios reales | Componente `Testimonios` | Oculto (`opcionales.testimonios = []`) |
| Cifras verificables (equipos fabricados, etc.) y un caso real | Componente `Cifras` | Oculto (`opcionales.cifras = []`) |
| Precio "desde" | Componente `PrecioDesde` (en "Por qué Aliado") | Oculto (`opcionales.precioDesde = null`) |
| Certificados del tanque | No se usa | Nada |

## 3. Equipos tipo vactor, minivactor y tanques

| Dato | Dónde se usa | Mientras tanto |
|---|---|---|
| **Material**: ¿lámina cold rolled de 3/16"? En ese espesor es más común la hot rolled | Ficha técnica y pregunta frecuente | "Lámina de acero de 3/16"" (sin especificar el laminado) |
| Qué incluye el equipo tipo vactor: ¿solo succión o también presión? | Tarjeta "Equipo tipo vactor" | "Equipo de succión por vacío montado sobre camión", sin mencionar presión |
| Especificaciones del minivactor | Tarjeta "Minivactor" | Solo "La versión compacta del equipo tipo vactor." |
| **Proceso de trabajo**: confirmar que es así | Sección "Cómo trabajamos" | 1) Nos cuenta qué necesita (residuo, capacidad, camión) · 2) Definimos el diseño y enviamos la cotización · 3) Fabricamos en 25 días hábiles · 4) Entregamos con garantía de 1 año |

## 4. Bombas de vacío

| Dato | Dónde se usa | Mientras tanto |
|---|---|---|
| ¿Venden bombas nuevas, reconstruidas o ambas? | Servicio "Venta" | No se especifica |
| ¿El mantenimiento es en el taller o en la empresa del cliente? | Servicio "Mantenimiento" | No se especifica |
| ¿Qué ciudades atienden en bombas? | — | No se especifica (en equipos: "todo el país", confirmado) |
| Flujo real del mantenimiento | — | No se describe |
| **Revisar la descripción de cada tipo de bomba** | Sección "Tipos de bomba" en `src/pages/bombas-de-vacio.astro` | Textos generales: ver abajo |
| ¿Venden accesorios por separado? ¿Envían a todo el país? | Sección "Accesorios" | Solo la lista y "Cotizar accesorios" |

Textos de los tipos de bomba para que el cliente los revise:

- **Anillo líquido:** Un rotor excéntrico gira dentro de un anillo de líquido, normalmente agua, que sella las cámaras. Toleran humedad, vapores y arrastre de líquido.
- **Émbolo giratorio:** Un pistón montado sobre una excéntrica gira dentro del cilindro y desplaza el gas. Son robustas y manejan caudales grandes en procesos industriales.
- **Lubricadas por aceite:** El aceite sella, lubrica y refrigera las paletas. Alcanzan un vacío más profundo que una bomba en seco del mismo tamaño.
- **Autolubricadas:** Trabajan sin aceite en la cámara: las paletas son de un material autolubricante. El aire sale sin neblina de aceite.

## 5. Fotos y logo

| Pendiente | Mientras tanto |
|---|---|
| Fotos y videos originales en alta calidad, sobre todo de **bombas y accesorios propios** | Bombas y accesorios usan una ilustración de línea, sin fotos de catálogo |
| **Logo en vector** (SVG, AI o PDF) | Se usa el PNG sin fondo que sale de `logo.jpeg` (`npm run logo`) |
| Confirmar que la foto del **equipo compacto sobre ruedas** (WhatsApp 1.54.52) es un **minivactor** | Se usa en la tarjeta "Minivactor" |
| Confirmar qué hace **Industrias Metálicas Perficort S.A.S.** en la fabricación (casi todas las fotos de fabricación se tomaron frente a su taller). Si hacen corte o rolado como proveedor, "fabricamos" sigue siendo exacto, pero conviene saberlo antes de la apelación. | Su letrero está recortado o difuminado en todas las fotos |
| Qué relación hay con **"Aliado Ambiental"**, rotulado en un camión | Esa foto no se usa |

Fotos excluidas a propósito:
- 140913: "Aliado Ambiental", "jetter" y letreros de la fachada con logos de marcas.
- IMG-WA0021: baja resolución y equipo rotulado.
- 6.31.25: unidad combinada con carrete de alta presión frente a Perficort.
- 6.31.27 PM: letrero de "Válvulas Rodríguez" con logos de marcas.
- 184145: la placa es la protagonista.
- 6.31.20 (4): cara de un trabajador junto al letrero de otra empresa.

Para reemplazar una foto: ponga el archivo nuevo en `assets-source/` y ajuste `scripts/procesar-fotos.py` (recorte y zonas a difuminar). Si conserva el nombre de salida, no hay que tocar ningún componente.

## 6. Cumplimiento (no cambiar sin revisar)

- Antes de cada despliegue: `npm run check:marca`.
- El aviso de no afiliación y la pregunta "¿Son distribuidores autorizados?" son las únicas excepciones permitidas.
