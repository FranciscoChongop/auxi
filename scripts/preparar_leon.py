"""Prepara las imágenes de León para la app.

- A1 a A8: quita el fondo lila liso, recorta y guarda WebP liviano con transparencia.
- A9: genera los íconos de la app (PWA, iPhone y favicon).
- Vida (B1 a B9): lo mismo desde originales/leon/vida hacia public/leon/vida
  (B9 solo se guarda como WebP; los íconos de la app siguen siendo los de A9).

Uso: npm run imagenes  (lee originales/leon/*.png y escribe public/leon/*.webp y public/icons/*.png)
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "originales" / "leon"  # PNG originales (no se publican)
LEON = RAIZ / "public" / "leon"
ICONOS = RAIZ / "public" / "icons"

POSES = [
    "A1-saluda",
    "A2-celebra",
    "A3-concentrado",
    "A4-pensativo",
    "A5-anima",
    "A6-sorprendido",
    "A7-duerme",
    "A8-caras",
]

POSES_VIDA = [
    "B1-saluda",
    "B2-celebra",
    "B3-alcancia",
    "B4-detective",
    "B5-alerta",
    "B6-anima",
    "B7-celular",
    "B8-caras",
]

LADO_TRABAJO = 1100  # se procesa a este tamaño máximo
LADO_FINAL = 640  # tamaño máximo del WebP (sirve para pantallas 2x)
UMBRAL_DURO = 14  # distancia al fondo: por debajo, transparente total
UMBRAL_SUAVE = 44  # por encima, opaco total
MARCA = (255, 0, 255)


def color_de_fondo(im: Image.Image) -> np.ndarray:
    a = np.asarray(im).astype(np.int32)
    borde = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    return np.median(borde, axis=0)


def quitar_fondo(ruta: Path) -> Image.Image:
    im = Image.open(ruta).convert("RGB")
    im.thumbnail((LADO_TRABAJO, LADO_TRABAJO), Image.LANCZOS)
    w, h = im.size
    fondo = color_de_fondo(im)

    # Relleno desde los bordes: solo marca el fondo conectado con el borde
    # (así no se borran los blancos de los ojos ni la panza).
    marcado = im.copy()
    semillas = [(x, y) for x in range(0, w, 40) for y in (0, h - 1)]
    semillas += [(x, y) for y in range(0, h, 40) for x in (0, w - 1)]
    for s in semillas:
        if marcado.getpixel(s) != MARCA:
            ImageDraw.floodfill(marcado, s, MARCA, thresh=UMBRAL_SUAVE)

    rgb = np.asarray(im).astype(np.float32)
    region = np.all(np.asarray(marcado) == MARCA, axis=-1)
    dist = np.sqrt(((rgb - fondo) ** 2).sum(axis=-1))
    alfa = np.ones((h, w), np.float32)
    suave = np.clip((dist - UMBRAL_DURO) / (UMBRAL_SUAVE - UMBRAL_DURO), 0, 1)
    alfa[region] = suave[region]

    # Quita el tinte lila de los bordes semitransparentes.
    a3 = np.maximum(alfa, 1e-3)[..., None]
    limpio = np.where(alfa[..., None] < 1, (rgb - (1 - a3) * fondo) / a3, rgb)
    limpio = np.clip(limpio, 0, 255)

    rgba = np.dstack([limpio, alfa * 255]).astype(np.uint8)
    out = Image.fromarray(rgba, "RGBA")
    caja = out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if caja:
        m = 8
        caja = (max(caja[0] - m, 0), max(caja[1] - m, 0), min(caja[2] + m, w), min(caja[3] + m, h))
        out = out.crop(caja)
    out.thumbnail((LADO_FINAL, LADO_FINAL), Image.LANCZOS)
    return out


def iconos() -> None:
    ICONOS.mkdir(parents=True, exist_ok=True)
    im = Image.open(ORIGEN / "A9-icono.png").convert("RGB")
    w, h = im.size
    # El original es un cuadrado redondeado sobre fondo claro: se recorta hacia
    # adentro para obtener un cuadrado lleno (el sistema pone las esquinas).
    rec = int(min(w, h) * 0.05)
    cuadrado = im.crop((rec, rec, w - rec, h - rec))
    for lado, nombre in [(512, "icon-512.png"), (192, "icon-192.png"), (180, "apple-touch-icon.png"), (32, "favicon-32.png")]:
        cuadrado.resize((lado, lado), Image.LANCZOS).save(ICONOS / nombre, optimize=True)
    # Maskable: León debe caber en la zona segura (círculo del 80 %).
    lienzo = Image.new("RGB", (512, 512), cuadrado.getpixel((4, cuadrado.height // 2)))
    chico = cuadrado.resize((420, 420), Image.LANCZOS)
    lienzo.paste(chico, (46, 46))
    lienzo.save(ICONOS / "icon-maskable-512.png", optimize=True)
    cuadrado.resize((512, 512), Image.LANCZOS).save(LEON / "A9-icono.webp", "WEBP", quality=82, method=6)


def caras(hoja_ruta: Path, carpeta: Path, nombres: list[str]) -> None:
    """Recorta las 6 caras de la hoja A8 o B8 (3 x 2) para los círculos de 40 px."""
    hoja = Image.open(hoja_ruta).convert("RGBA")
    w, h = hoja.size
    carpeta.mkdir(exist_ok=True)
    for i, nombre in enumerate(nombres):
        f, c = divmod(i, 3)
        celda = hoja.crop((c * w // 3, f * h // 2, (c + 1) * w // 3, (f + 1) * h // 2))
        celda = celda.crop(celda.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox())
        lado = celda.width
        cara = celda.crop((0, 0, lado, min(lado, celda.height)))
        cara.resize((120, 120), Image.LANCZOS).save(carpeta / f"{nombre}.webp", "WEBP", quality=85)


def poses(nombres: list[str], origen_dir: Path, destino_dir: Path) -> None:
    destino_dir.mkdir(parents=True, exist_ok=True)
    for nombre in nombres:
        origen = origen_dir / f"{nombre}.png"
        if not origen.exists():
            print(f"falta {origen.name}, se usará el reemplazo")
            continue
        out = quitar_fondo(origen)
        destino = destino_dir / f"{nombre}.webp"
        out.save(destino, "WEBP", quality=82, method=6)
        print(f"{destino.name}: {out.size[0]}x{out.size[1]}, {destino.stat().st_size // 1024} KB")


def icono_vida() -> None:
    """B9: mismo recorte que A9, solo como WebP (para la app Vida, no para la PWA)."""
    origen = ORIGEN / "vida" / "B9-icono.png"
    if not origen.exists():
        return
    im = Image.open(origen).convert("RGB")
    w, h = im.size
    rec = int(min(w, h) * 0.05)
    cuadrado = im.crop((rec, rec, w - rec, h - rec))
    cuadrado.resize((512, 512), Image.LANCZOS).save(LEON / "vida" / "B9-icono.webp", "WEBP", quality=82, method=6)


def main() -> None:
    poses(POSES, ORIGEN, LEON)
    if (LEON / "A8-caras.webp").exists():
        caras(LEON / "A8-caras.webp", LEON / "caras", ["feliz", "guino", "sorpresa", "lengua", "tierno", "lentes"])
    iconos()

    vida = LEON / "vida"
    poses(POSES_VIDA, ORIGEN / "vida", vida)
    if (vida / "B8-caras.webp").exists():
        caras(vida / "B8-caras.webp", vida / "caras", ["feliz", "risa", "sorpresa", "serio", "tierno", "curioso"])
    icono_vida()
    print("caras e íconos listos")


if __name__ == "__main__":
    main()
