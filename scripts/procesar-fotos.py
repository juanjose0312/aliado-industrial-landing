"""Procesa las fotos reales de assets-source/ para el sitio.

- Recorta letreros de terceros, marcas de agua y bordes sobrantes.
- Difumina placas de vehículos, nombres de clientes y etiquetas de marca.
- Corrige la orientación EXIF y limita el ancho a 2400 px (Astro genera AVIF/WebP).

Todas las coordenadas son fracciones (0-1) del tamaño de la foto ORIGINAL,
para que no dependan de la resolución.

Uso:  python scripts/procesar-fotos.py
"""

from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "assets-source" / "imagenes de tabajo"
DESTINO = RAIZ / "src" / "assets" / "fotos"
ANCHO_MAX = 2400

# nombre de salida -> archivo origen, recorte (x0, y0, x1, y1) y zonas a difuminar
FOTOS = {
    # Hero de "/": equipo tipo vactor azul y blanco, de perfil.
    "equipo-azul-perfil": {
        "origen": "20210907_113828.jpg",
        "recorte": (0.0, 0.20, 0.975, 0.84),
        "difuminar": [
            (0.712, 0.405, 0.795, 0.462),  # rótulo en la cabina
        ],
    },
    # Tarjeta "Equipo tipo vactor": se recorta el letrero de la fachada.
    "equipo-verde-perfil": {
        "origen": "20211009_085630.jpg",
        "recorte": (0.06, 0.285, 1.0, 0.78),
        "difuminar": [
            (0.740, 0.440, 0.800, 0.488),  # SYR-531 en la puerta
            (0.915, 0.538, 0.958, 0.572),  # placa del carro vecino
            (0.475, 0.315, 0.535, 0.345),  # número de la casa
        ],
    },
    # Tarjeta "Minivactor": equipo compacto sobre ruedas.
    "equipo-compacto": {
        "origen": "WhatsApp Image 2026-07-06 at 1.54.52 PM.jpeg",
        "recorte": None,
        "difuminar": [
            (0.380, 0.085, 0.445, 0.285),  # etiqueta de marca de la bomba
        ],
    },
    # Tarjeta "Tanques de vacío": tanque grande sobre chasis.
    "tanque-chasis-grande": {
        "origen": "WhatsApp Image 2026-07-23 at 6.31.27 PM (4).jpeg",
        "recorte": (0.0, 0.0, 1.0, 0.885),  # marca de agua abajo a la izquierda
        "difuminar": [
            (0.785, 0.440, 0.835, 0.495),  # placa en la cabina
            (0.685, 0.480, 0.720, 0.520),  # placa delantera
        ],
    },
    "tanque-skid": {
        "origen": "WhatsApp Image 2026-07-06 at 1.59.37 PM.jpeg",
        "recorte": None,
        "difuminar": [],
    },
    # --- Galería ---
    "equipo-verde-tapa": {
        "origen": "20210426_100628.jpg",
        "recorte": None,
        "difuminar": [
            (0.762, 0.255, 0.802, 0.300),  # logo de otra marca en el fondo
        ],
    },
    "equipo-verde-superior": {
        "origen": "20210426_100711.jpg",
        "recorte": None,
        "difuminar": [
            (0.115, 0.065, 0.150, 0.100),  # placa del bus del fondo
            (0.080, 0.035, 0.140, 0.065),  # rótulo del bus
        ],
    },
    "equipo-azul-lateral": {
        "origen": "20210907_113853.jpg",
        "recorte": (0.12, 0.13, 1.0, 0.86),
        "difuminar": [
            (0.150, 0.375, 0.255, 0.420),  # nombre del cliente
            (0.305, 0.380, 0.345, 0.410),  # etiqueta pequeña del tanque
        ],
    },
    "equipo-verde-noche": {
        "origen": "20210930_184159.jpg",
        "recorte": (0.0, 0.30, 1.0, 0.86),
        "difuminar": [
            (0.790, 0.480, 0.932, 0.560),  # SYR-531 en la puerta
        ],
    },
    "equipo-azul-calle": {
        "origen": "20211204_123231.jpg",
        "recorte": None,
        "difuminar": [
            (0.185, 0.480, 0.218, 0.508),  # placa del carro del fondo
        ],
    },
    "equipo-verde-entrega": {
        "origen": "20211112_175436.jpg",
        "recorte": (0.36, 0.22, 1.0, 0.86),
        "difuminar": [
            (0.540, 0.120, 0.735, 0.300),  # letreros de la fachada
            (0.295, 0.405, 0.355, 0.430),  # placa en la cabina del camión del fondo
        ],
    },
    "tanque-blanco-superior": {
        "origen": "WhatsApp Image 2026-07-23 at 6.31.19 PM.jpeg",
        "recorte": None,
        "difuminar": [
            (0.465, 0.178, 0.535, 0.207),  # placa SNF
            (0.815, 0.243, 0.865, 0.262),  # placa del carro
        ],
    },
    "fabricacion-taller": {
        "origen": "WhatsApp Image 2026-07-23 at 6.31.20 PM.jpeg",
        "recorte": None,
        "difuminar": [],
    },
    "fabricacion-soldadura": {
        "origen": "WhatsApp Image 2026-07-23 at 6.31.21 PM (4).jpeg",
        "recorte": None,
        "difuminar": [
            (0.625, 0.770, 0.672, 0.840),  # placa trasera
        ],
    },
    "fabricacion-montacargas": {
        "origen": "WhatsApp Image 2026-07-23 at 6.31.23 PM (3).jpeg",
        "recorte": None,
        "difuminar": [],
    },
    "tanque-morado-blanco": {
        "origen": "WhatsApp Image 2026-07-23 at 6.31.27 PM (3).jpeg",
        "recorte": (0.0, 0.0, 1.0, 0.885),
        "difuminar": [
            (0.630, 0.330, 0.700, 0.380),  # rótulo de la fábrica del fondo
        ],
    },
    "tanque-blanco-pintado": {
        "origen": "WhatsApp Image 2026-07-23 at 6.31.28 PM (2).jpeg",
        "recorte": (0.0, 0.0, 1.0, 0.885),
        "difuminar": [
            (0.905, 0.460, 0.950, 0.500),  # placa del carro
        ],
    },
    "tanque-blanco-morado": {
        "origen": "WhatsApp Image 2026-07-23 at 6.31.28 PM (4).jpeg",
        "recorte": (0.0, 0.0, 1.0, 0.885),
        "difuminar": [
            (0.330, 0.090, 0.420, 0.200),  # rótulo de la ambulancia
        ],
    },
}


def a_pixeles(caja, ancho, alto):
    x0, y0, x1, y1 = caja
    return (round(x0 * ancho), round(y0 * alto), round(x1 * ancho), round(y1 * alto))


def difuminar(img, caja):
    """Pixela y difumina la zona para que no se pueda leer."""
    zona = img.crop(caja)
    w, h = zona.size
    pequena = zona.resize((max(1, w // 12), max(1, h // 12)), Image.Resampling.BILINEAR)
    zona = pequena.resize((w, h), Image.Resampling.BILINEAR)
    zona = zona.filter(ImageFilter.GaussianBlur(radius=max(4, min(w, h) // 6)))
    img.paste(zona, caja)


def procesar(nombre, cfg):
    img = Image.open(ORIGEN / cfg["origen"])
    img = ImageOps.exif_transpose(img).convert("RGB")
    ancho, alto = img.size

    for caja in cfg["difuminar"]:
        difuminar(img, a_pixeles(caja, ancho, alto))

    if cfg["recorte"]:
        img = img.crop(a_pixeles(cfg["recorte"], ancho, alto))

    if img.width > ANCHO_MAX:
        nuevo_alto = round(img.height * ANCHO_MAX / img.width)
        img = img.resize((ANCHO_MAX, nuevo_alto), Image.Resampling.LANCZOS)

    salida = DESTINO / f"{nombre}.jpg"
    img.save(salida, "JPEG", quality=86, optimize=True, progressive=True)
    print(f"{salida.name:32} {img.width}x{img.height}")


def main():
    DESTINO.mkdir(parents=True, exist_ok=True)
    for nombre, cfg in FOTOS.items():
        procesar(nombre, cfg)


if __name__ == "__main__":
    main()
