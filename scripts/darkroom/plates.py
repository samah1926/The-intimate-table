"""Room plates: the light of each room, rendered once.

Plates are backgrounds, not pictures: plaster lit by the sun, a lamp over a
table. Moving parts (leaf shadows, candle glow, dust) are separate layers
animated in CSS so they can breathe.
"""

import math
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from lib import blur, fractal, grid, palm_shadow, polygon, radial, rgb, save  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), "../../public/house/plates")
TEX = os.path.join(os.path.dirname(__file__), "../../public/house/textures")
os.makedirs(OUT, exist_ok=True)


def tex(name, w, h):
    t = np.asarray(Image.open(f"{TEX}/{name}.webp").convert("RGB"), np.float32) / 255
    reps = (math.ceil(h / t.shape[0]), math.ceil(w / t.shape[1]), 1)
    return np.tile(t, reps)[:h, :w]


def arch_window(cx, top, width, height, shear=0.0, skew_y=0.0):
    """An arched window's light, projected (sheared) onto a wall."""
    pts = []
    r = width / 2
    for i in range(33):
        a = math.pi + math.pi * i / 32
        pts.append((cx + math.cos(a) * r, top + r + math.sin(a) * r))
    pts += [(cx + r, top + height), (cx - r, top + height)]
    return [(x + (y - top) * shear, y + (x - cx) * skew_y) for x, y in pts]


def hall(w=1920, h=1200):
    wall = tex("plaster", w, h)
    x, y = grid(w, h)
    # in shade, late afternoon: warm and a little low
    img = wall * (0.8 - 0.12 * y[..., None]) * rgb("#fff1dd")
    sun = np.zeros((h, w), np.float32)
    for cx in (w * 0.58, w * 0.8):
        sun = np.maximum(sun, polygon(w, h, arch_window(cx, h * 0.12, w * 0.13, h * 0.95, shear=0.55, skew_y=0.08), soft=10))
    sun *= 0.55 + 0.45 * (1 - y)
    img = img * (1 + sun[..., None] * (rgb("#ffe2b0") * 0.55))
    img += radial(w, h, w * 0.7, h * 0.35, w * 0.7, 2.2)[..., None] * rgb("#ffb56b") * 0.08
    save(img, f"{OUT}/hall.webp", 72)


def library(w=1920, h=1200):
    wall = tex("plaster-sage", w, h)
    x, y = grid(w, h)
    daylight = np.clip(1.15 - x * 0.75, 0, 1.2) ** 1.4
    img = wall * (0.62 + 0.42 * daylight[..., None]) * rgb("#f4f6f0")
    # the window's frame, very softly
    for bx in (0.08, 0.2):
        bar = polygon(w, h, [(w * bx, 0), (w * (bx + 0.012), 0), (w * (bx + 0.2), h), (w * (bx + 0.19), h)], soft=26)
        img *= 1 - bar[..., None] * 0.12
    save(img, f"{OUT}/library.webp", 72)


def studio(w=1920, h=1200):
    stone = tex("stone", w, h)
    x, y = grid(w, h)
    img = stone * (0.74 + 0.06 * y[..., None]) * rgb("#eef0f2")
    beams = np.zeros((h, w), np.float32)
    for i, bx in enumerate((0.18, 0.42, 0.66)):
        pts = [(w * bx, 0), (w * (bx + 0.12), 0), (w * (bx + 0.34), h), (w * (bx + 0.2), h)]
        beams = np.maximum(beams, polygon(w, h, pts, soft=18) * (1 - 0.18 * i))
    # window bars inside each beam
    for bx in (0.24, 0.48, 0.72):
        bar = polygon(w, h, [(w * bx, 0), (w * (bx + 0.008), 0), (w * (bx + 0.1), h), (w * (bx + 0.092), h)], soft=4)
        beams *= 1 - bar * 0.85
    img = img * (1 + beams[..., None] * rgb("#fff6e6") * 0.42)
    save(img, f"{OUT}/studio.webp", 72)


def memory(w=1920, h=1200, name="memory", surface_top=0.34):
    """A long walnut surface under one warm lamp, in a quiet room."""
    x, y = grid(w, h)
    img = np.zeros((h, w, 3), np.float32)
    top = int(h * surface_top)
    # the wall
    wall = tex("plaster-dusk", w, top)
    wy = y[:top]
    img[:top] = wall * (0.95 + 0.35 * wy[..., None])
    # the surface, in slight perspective
    wood = tex("wood", 2048, 2048)
    ys = np.linspace(0, 1, h - top)[:, None]
    xs = np.linspace(0, 1, w)[None, :]
    scale = 0.55 + 0.45 * ys  # nearer boards are larger
    u = ((xs - 0.5) / scale + 0.5) * 1400
    v = (ys ** 0.8) * 900
    ui = np.clip(u.astype(int), 0, 2047)
    vi = np.clip((v + 0 * u).astype(int), 0, 2047)
    surf = wood[vi, ui] * 1.05
    img[top:] = surf
    # front edge of the table, catching a little light
    img[top - 2 : top + 3] = img[top - 2 : top + 3] * 0.5 + rgb("#8a6a4c") * 0.25
    # the lamp
    lamp = radial(w, h, w * 0.52, h * 0.58, w * 0.7, 1.5)
    img = img * (0.5 + 1.25 * lamp[..., None]) * rgb("#ffddb0")
    # dust in the air
    haze = blur(fractal(w // 4, h // 4, 3.0, 50), 2)
    haze = np.asarray(Image.fromarray((haze * 255).astype(np.uint8)).resize((w, h)), np.float32) / 255
    img += (haze * radial(w, h, w * 0.52, h * 0.25, w * 0.5, 1.5))[..., None] * rgb("#ffcf94") * 0.05
    # a ring left by a glass, near the right
    ring = (radial(w, h, w * 0.83, h * 0.84, w * 0.03, 0.6) - radial(w, h, w * 0.83, h * 0.84, w * 0.026, 0.6)).clip(0, 1)
    img *= 1 - blur(ring, 1.5)[..., None] * 0.35
    save(img, f"{OUT}/{name}.webp", 74)


def shadows(w=1920, h=1200):
    """Leaf shadows with alpha, laid over plaster and animated in CSS."""
    fronds = [
        (w * 1.04, h * -0.08, math.radians(140), w * 0.62, 0.35, 34, 1.0),
        (w * 1.06, h * 0.22, math.radians(178), w * 0.58, -0.3, 34, 1.0),
        (w * 1.02, h * 0.62, math.radians(205), w * 0.5, 0.25, 30, 0.9),
        (w * 0.7, h * -0.12, math.radians(105), w * 0.42, 0.45, 28, 0.9),
    ]
    m = palm_shadow(w, h, fronds, penumbra=9)
    alpha = (m * 255).astype(np.uint8)
    im = Image.fromarray(np.dstack([np.full_like(alpha, 38), np.full_like(alpha, 28), np.full_like(alpha, 18), alpha]), "RGBA")
    im = im.resize((w // 2, h // 2), Image.LANCZOS)
    im.save(f"{OUT}/leaves.webp", "WEBP", quality=70, method=6)


if __name__ == "__main__":
    hall()
    library()
    studio()
    memory()
    memory(1080, 1700, "memory-portrait", 0.2)
    shadows()
    print("plates ✓")
