# Normaliza sprites: remove o xadrez (vira alfa real) e o texto "WALKx" gravado.
# Lê de assets_raw/, escreve PNG RGBA em assets/. Roda uma vez.
import numpy as np
from PIL import Image
from scipy import ndimage

RAW, OUT = "assets_raw", "assets"

# Caixa da pose idle (canto superior-esquerdo) por personagem, em coords 1024².
# 2x2 limpo -> 512x512 ; 3+2 com rótulo -> ~341x512 (1 de 3 colunas do topo).
IDLE_BOX = {
    "zumbi":       (0, 0, 512, 512),
    "grio":        (0, 0, 512, 512),
    "espiao":      (0, 0, 512, 512),
    "ganga_zumba": (0, 0, 512, 512),   # 2x2 mas com rótulo -> componente maior limpa
    "dandara":     (0, 0, 341, 512),   # 3 colunas no topo
    "domingos":    (0, 0, 341, 512),
}

def remove_checker(rgb):
    """Marca como fundo os pixels cinza+claros conectados à borda."""
    r, g, b = rgb[..., 0].astype(int), rgb[..., 1].astype(int), rgb[..., 2].astype(int)
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    grayish = (mx - mn) <= 26
    bright = (mx >= 105) & (mx <= 248)
    cand = grayish & bright
    lbl, n = ndimage.label(cand)
    border = set(lbl[0, :]) | set(lbl[-1, :]) | set(lbl[:, 0]) | set(lbl[:, -1])
    border.discard(0)
    bg = np.isin(lbl, list(border))
    return ~bg  # True = opaco (figura)

def largest_component(mask):
    lbl, n = ndimage.label(mask)
    if n == 0:
        return mask
    sizes = ndimage.sum(np.ones_like(lbl), lbl, range(1, n + 1))
    keep = np.argmax(sizes) + 1
    return lbl == keep

def trim(rgba):
    a = rgba[..., 3]
    ys, xs = np.where(a > 8)
    if len(xs) == 0:
        return rgba
    p = 14
    y0, y1 = max(0, ys.min() - p), min(rgba.shape[0], ys.max() + p)
    x0, x1 = max(0, xs.min() - p), min(rgba.shape[1], xs.max() + p)
    return rgba[y0:y1, x0:x1]

def process(name, box, keep_largest):
    im = Image.open(f"{RAW}/{name}.png").convert("RGB")
    if box:
        im = im.crop(box)
    rgb = np.array(im)
    mask = remove_checker(rgb)
    if keep_largest:
        mask = largest_component(mask)
    rgba = np.dstack([rgb, np.where(mask, 255, 0).astype(np.uint8)])
    rgba = trim(rgba)
    Image.fromarray(rgba, "RGBA").save(f"{OUT}/{name}.png")
    h, w = rgba.shape[:2]
    cover = round(100 * (rgba[..., 3] > 8).mean(), 1)
    print(f"{name:14s} -> {w}x{h}  alfa-coberto={cover}%")

for n, box in IDLE_BOX.items():
    process(n, box, keep_largest=True)
# povo: multidao inteira (varias pessoas -> NAO filtra componente)
process("povo", (0, 0, 1024, 1024), keep_largest=False)
print("OK")
