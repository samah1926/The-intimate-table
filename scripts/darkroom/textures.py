"""Tileable material textures: paper, linen, plaster, wood, stone, terracotta, zellige."""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from lib import blur, fractal, rgb, save  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), "../../public/house/textures")
os.makedirs(OUT, exist_ok=True)


def paper(n=512):
    fibres = fractal(n, n, 0.6, 1) * 0.5 + fractal(n, n, 1.4, 2) * 0.5
    stretch = blur(fractal(n, n, 0.2, 3), (0.4)) * 0.4
    t = 0.93 + (fibres - 0.5) * 0.06 + (stretch - 0.2) * 0.03 + (fractal(n, n, 2.6, 4) - 0.5) * 0.05
    img = np.stack([t * 0.985, t * 0.975, t * 0.95], -1)
    save(img, f"{OUT}/paper.webp", 80)


def linen(n=512):
    x, y = np.mgrid[0:n, 0:n].astype(np.float32)
    irregular_x = (fractal(n, n, 1.2, 5) - 0.5) * 1.6
    irregular_y = (fractal(n, n, 1.2, 6) - 0.5) * 1.6
    warp = 0.5 + 0.5 * np.sin(2 * math.pi * x / 4 + irregular_x)
    weft = 0.5 + 0.5 * np.sin(2 * math.pi * y / 4 + irregular_y)
    slub = fractal(n, n, 2.2, 7)
    t = 0.88 + 0.05 * warp * weft - 0.04 * (1 - warp) * (1 - weft) + (slub - 0.5) * 0.08
    img = np.stack([t, t * 0.975, t * 0.94], -1)
    save(img, f"{OUT}/linen.webp", 80)


def plaster(n=768, name="plaster", base="#e6d8c4"):
    c = rgb(base)
    low = fractal(n, n, 3.2, 8)
    mid = fractal(n, n, 2.2, 9)
    trowel = blur(fractal(n, n, 1.6, 10), 1.2)
    speck = (fractal(n, n, 0.3, 11) > 0.83).astype(np.float32) * 0.03
    t = 1 + (low - 0.5) * 0.10 + (mid - 0.5) * 0.06 + (trowel - 0.5) * 0.05 - speck
    img = c * t[..., None]
    save(img, f"{OUT}/{name}.webp", 78)


def stretched(n, sx, beta, seed):
    """Noise stretched along x: long fibres, like grain running the length of a board."""
    from PIL import Image as _I
    small = fractal(max(8, n // sx), n, beta, seed)
    return np.asarray(_I.fromarray(small).resize((n, n), _I.BICUBIC), np.float32)


def wood(n=1024, name="wood", dark="#24170f", light="#5e3d27", planks=4):
    rng = np.random.default_rng(12)
    y, x = np.mgrid[0:n, 0:n].astype(np.float32) / n
    img = np.zeros((n, n, 3), np.float32)
    ph = 1 / planks
    for p in range(planks):
        band = (y >= p * ph) & (y < (p + 1) * ph)
        tone = 0.78 + 0.4 * rng.random()
        drift = stretched(n, 16, 3.0, 20 + p)
        rings = np.sin(2 * math.pi * (y * planks * 14 + drift * 5.0 + rng.random()))
        rings = np.sign(rings) * np.abs(rings) ** 0.6
        pores = stretched(n, 40, 0.8, 40 + p)
        figure = stretched(n, 6, 2.4, 60 + p)
        v = 0.42 + 0.16 * rings + (pores - 0.5) * 0.45 + (figure - 0.5) * 0.35
        v = np.clip(v, 0, 1)
        col = rgb(dark) * (1 - v[..., None]) + rgb(light) * v[..., None]
        img[band] = (col * tone)[band]
    for p in range(planks + 1):
        yy = int(p * ph * n) % n
        img[max(0, yy - 1) : yy + 2] *= 0.4
    img = blur(img, 0.5)
    save(img, f"{OUT}/{name}.webp", 76)


def stone(n=768):
    low = fractal(n, n, 2.8, 30)
    fine = fractal(n, n, 1.0, 31)
    fossils = (blur(fractal(n, n, 0.5, 32), 0.8) > 0.8).astype(np.float32)
    t = 0.9 + (low - 0.5) * 0.08 + (fine - 0.5) * 0.05 - fossils * 0.025
    img = np.stack([t * 0.95, t * 0.93, t * 0.88], -1)
    save(img, f"{OUT}/stone.webp", 78)


def terracotta(n=768, tiles=6):
    """Tomettes: square fired-clay tiles, each a little different."""
    rng = np.random.default_rng(33)
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    size = n / tiles
    ix, iy = (x // size).astype(int), (y // size).astype(int)
    tone = rng.uniform(0.82, 1.08, (tiles, tiles))[iy % tiles, ix % tiles]
    hue = rng.uniform(-0.04, 0.04, (tiles, tiles))[iy % tiles, ix % tiles]
    base = rgb("#b47a58")
    mott = fractal(n, n, 2.4, 34)
    img = base * (tone * (0.92 + (mott - 0.5) * 0.25))[..., None] + np.stack([hue, hue * 0.3, -hue], -1)
    gx = np.minimum(x % size, size - x % size)
    gy = np.minimum(y % size, size - y % size)
    grout = np.clip(1 - np.minimum(gx, gy) / 3.0, 0, 1)
    img = img * (1 - grout[..., None] * 0.55) + rgb("#d9c7ae") * grout[..., None] * 0.35
    save(blur(img, 0.5), f"{OUT}/terracotta.webp", 76)


def zellige(n=768, tiles=12):
    """Glazed green zellige: hand-cut, each tile catching light differently."""
    rng = np.random.default_rng(35)
    y, x = np.mgrid[0:n, 0:n].astype(np.float32)
    size = n / tiles
    ix, iy = (x // size).astype(int) % tiles, (y // size).astype(int) % tiles
    tone = rng.uniform(0.6, 1.2, (tiles, tiles))[iy, ix]
    glaze = fractal(n, n, 2.0, 36)
    fx, fy = (x % size) / size, (y % size) / size
    sheen = np.clip(1 - np.hypot(fx - rng.uniform(0.2, 0.8, (tiles, tiles))[iy, ix], fy - 0.3) * 1.6, 0, 1) ** 3
    base = rgb("#2f5a4b")
    img = base * (tone * (0.85 + (glaze - 0.5) * 0.5))[..., None] + sheen[..., None] * 0.18
    gx = np.minimum(x % size, size - x % size)
    gy = np.minimum(y % size, size - y % size)
    grout = np.clip(1 - np.minimum(gx, gy) / 2.2, 0, 1)
    img = img * (1 - grout[..., None]) + rgb("#cfc6b4") * grout[..., None] * 0.8
    save(blur(img, 0.4), f"{OUT}/zellige.webp", 78)


if __name__ == "__main__":
    paper()
    linen()
    plaster()
    plaster(name="plaster-sage", base="#c9c9b8")
    plaster(name="plaster-dusk", base="#4a3a30")
    wood()
    stone()
    terracotta()
    zellige()
    print("textures ✓")
