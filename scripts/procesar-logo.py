"""Quita el fondo blanco del logo y genera los íconos del sitio.

Solo se vuelve transparente el blanco conectado con el borde de la imagen,
así se conserva el blanco interior del engranaje. No se redibuja nada.

Salidas:
  src/assets/logo/logo.png         logo completo transparente
  src/assets/logo/logo-pieza.png   solo la pieza del rompecabezas
  src/assets/logo/logo-texto.png   solo el texto "ALIADO INDUSTRIAL" del logo
  public/favicon.ico, public/favicon-32.png, public/apple-touch-icon.png

Uso:  python scripts/procesar-logo.py
"""

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "assets-source" / "logo.jpeg"
DESTINO = RAIZ / "src" / "assets" / "logo"
PUBLIC = RAIZ / "public"
CARBON = (17, 19, 21)
UMBRAL_BLANCO = 222  # canal mínimo para considerar un píxel "casi blanco"


def quitar_fondo(img):
    rgb = img.convert("RGB")
    ancho, alto = rgb.size

    # 1. Máscara de píxeles casi blancos.
    r, g, b = rgb.split()
    minimo = ImageChops.darker(ImageChops.darker(r, g), b)
    blanco = minimo.point(lambda v: 255 if v >= UMBRAL_BLANCO else 0)

    # 2. Relleno desde los bordes: solo el blanco conectado al borde es fondo.
    marcado = blanco.copy()
    for x in range(0, ancho, 8):
        for y in (0, alto - 1):
            if marcado.getpixel((x, y)) == 255:
                ImageDraw.floodfill(marcado, (x, y), 128)
    for y in range(0, alto, 8):
        for x in (0, ancho - 1):
            if marcado.getpixel((x, y)) == 255:
                ImageDraw.floodfill(marcado, (x, y), 128)
    fondo = marcado.point(lambda v: 255 if v == 128 else 0)

    # 3. Borde suave: en la franja junto al fondo, la opacidad depende de qué tan blanco es el píxel.
    franja = fondo.filter(ImageFilter.MaxFilter(5))
    alfa_suave = minimo.point(lambda v: max(0, min(255, round((255 - v) * 255 / (255 - 150)))))
    alfa = Image.new("L", rgb.size, 255)
    alfa.paste(alfa_suave, mask=franja)
    alfa.paste(0, mask=fondo)

    # 4. Quita el halo blanco de los bordes semitransparentes.
    px = rgb.load()
    pa = alfa.load()
    for y in range(alto):
        for x in range(ancho):
            a = pa[x, y]
            if 0 < a < 255:
                f = a / 255
                px[x, y] = tuple(max(0, min(255, round((c - (1 - f) * 255) / f))) for c in px[x, y])

    salida = rgb.convert("RGBA")
    salida.putalpha(alfa)
    return salida


def recortar_contenido(img, margen=4):
    caja = img.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    x0, y0, x1, y1 = caja
    return img.crop((max(0, x0 - margen), max(0, y0 - margen), min(img.width, x1 + margen), min(img.height, y1 + margen)))


def cuadrado(img, lado, fondo=None, relleno=0.0):
    lienzo = Image.new("RGBA", (lado, lado), fondo + (255,) if fondo else (0, 0, 0, 0))
    util = round(lado * (1 - 2 * relleno))
    escala = util / max(img.size)
    pieza = img.resize((max(1, round(img.width * escala)), max(1, round(img.height * escala))), Image.Resampling.LANCZOS)
    lienzo.alpha_composite(pieza, ((lado - pieza.width) // 2, (lado - pieza.height) // 2))
    return lienzo


def main():
    DESTINO.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    logo = quitar_fondo(Image.open(ORIGEN))
    ancho, alto = logo.size

    completo = recortar_contenido(logo)
    completo.save(DESTINO / "logo.png", optimize=True)

    # La pieza ocupa la parte superior; el texto, la franja inferior (~76 % de la altura).
    corte = round(alto * 0.745)
    pieza = recortar_contenido(logo.crop((0, 0, ancho, corte)))
    texto = recortar_contenido(logo.crop((0, corte, ancho, alto)))
    pieza.save(DESTINO / "logo-pieza.png", optimize=True)
    texto.save(DESTINO / "logo-texto.png", optimize=True)

    cuadrado(pieza, 32).save(PUBLIC / "favicon-32.png", optimize=True)
    cuadrado(pieza, 48).save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    cuadrado(pieza, 180, fondo=CARBON, relleno=0.1).convert("RGB").save(PUBLIC / "apple-touch-icon.png", optimize=True)
    cuadrado(pieza, 512, fondo=CARBON, relleno=0.1).convert("RGB").save(PUBLIC / "icon-512.png", optimize=True)

    for nombre, img in (("logo", completo), ("pieza", pieza), ("texto", texto)):
        print(f"{nombre:6} {img.width}x{img.height}")


if __name__ == "__main__":
    main()
