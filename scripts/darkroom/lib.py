"""Small darkroom toolkit: noise, light, shadow and film for placeholder imagery.

Everything here is procedural so the House has warm, imperfect pictures before
the real photography exists. Replace the outputs with real images at any time.
"""

from __future__ import annotations

import math
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, map_coordinates

RNG = np.random.default_rng(30)


def rgb(hexstr: str) -> np.ndarray:
    h = hexstr.lstrip("#")
    return np.array([int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)


def canvas(w: int, h: int, color: str) -> np.ndarray:
    return np.ones((h, w, 3), np.float32) * rgb(color)


def grid(w: int, h: int):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x / w, y / h


# ── noise ────────────────────────────────────────────────────────────────

def fractal(w: int, h: int, beta: float = 2.0, seed: int | None = None) -> np.ndarray:
    """Periodic (tileable) 1/f^beta noise in [0, 1]."""
    rng = np.random.default_rng(seed) if seed is not None else RNG
    white = rng.standard_normal((h, w))
    fy = np.fft.fftfreq(h)[:, None]
    fx = np.fft.fftfreq(w)[None, :]
    f = np.sqrt(fx**2 + fy**2)
    f[0, 0] = 1
    spec = np.fft.fft2(white) / f ** (beta / 2)
    spec[0, 0] = 0
    n = np.real(np.fft.ifft2(spec))
    n = (n - n.min()) / (n.max() - n.min())
    return n.astype(np.float32)


def blur(a: np.ndarray, s: float) -> np.ndarray:
    if a.ndim == 3:
        return np.stack([gaussian_filter(a[..., c], s) for c in range(a.shape[2])], -1)
    return gaussian_filter(a, s)


# ── shapes as soft masks ─────────────────────────────────────────────────

def mask_from(w: int, h: int, draw_fn, soft: float = 0.0, scale: int = 2) -> np.ndarray:
    """Draw with PIL at `scale`x for antialiasing, return float mask in [0,1]."""
    im = Image.new("L", (w * scale, h * scale), 0)
    d = ImageDraw.Draw(im)
    draw_fn(d, scale)
    im = im.resize((w, h), Image.LANCZOS)
    m = np.asarray(im, np.float32) / 255
    return gaussian_filter(m, soft) if soft else m


def ellipse(w, h, cx, cy, rx, ry, soft=0.0):
    return mask_from(w, h, lambda d, s: d.ellipse([(cx - rx) * s, (cy - ry) * s, (cx + rx) * s, (cy + ry) * s], fill=255), soft)


def polygon(w, h, pts, soft=0.0):
    return mask_from(w, h, lambda d, s: d.polygon([(x * s, y * s) for x, y in pts], fill=255), soft)


def radial(w, h, cx, cy, r, power=2.0):
    x, y = np.mgrid[0:h, 0:w][::-1]
    d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / r
    return np.clip(1 - d, 0, 1) ** power


def mix(img, color, m, opacity=1.0):
    c = rgb(color) if isinstance(color, str) else color
    m = (m * opacity)[..., None]
    return img * (1 - m) + c * m


def multiply(img, m, strength=1.0, tint="#000000"):
    t = rgb(tint)
    m = (m * strength)[..., None]
    return img * (1 - m) + img * t * m


def screen(img, color, m):
    c = rgb(color) if isinstance(color, str) else color
    m = m[..., None]
    return 1 - (1 - img) * (1 - c * m)


# ── foliage shadows (palm fronds, leaves) ────────────────────────────────

def frond(d: ImageDraw.ImageDraw, s: int, x0, y0, angle, length, bend=0.25, leaflets=38, width=1.0, rng=None):
    """A palm frond silhouette: a curved rachis with tapered leaflets."""
    rng = rng or RNG
    pts = []
    for i in range(60):
        t = i / 59
        a = angle + bend * t * t
        if i == 0:
            x, y = x0, y0
        else:
            x = pts[-1][0] + math.cos(a) * length / 59
            y = pts[-1][1] + math.sin(a) * length / 59
        pts.append((x, y, a))
    d.line([(p[0] * s, p[1] * s) for p in pts], fill=255, width=max(1, int(2 * s * width)))
    for k in range(leaflets):
        t = 0.08 + 0.9 * k / leaflets
        px, py, pa = pts[int(t * 59)]
        ll = length * (0.42 * math.sin(math.pi * min(1, t * 1.15)) + 0.08) * (0.85 + 0.3 * rng.random())
        for side in (-1, 1):
            la = pa + side * (0.55 + 0.2 * rng.random()) + 0.1 * t
            droop = 0.35 * rng.random()
            mx = px + math.cos(la) * ll * 0.5
            my = py + math.sin(la) * ll * 0.5 + droop * ll * 0.2
            ex = px + math.cos(la + droop * side * 0.3) * ll
            ey = py + math.sin(la + droop * side * 0.3) * ll + droop * ll * 0.35
            wv = ll * 0.028 * width
            nx, ny = -math.sin(la) * wv, math.cos(la) * wv
            d.polygon(
                [(px * s, py * s), ((mx + nx) * s, (my + ny) * s), (ex * s, ey * s), ((mx - nx) * s, (my - ny) * s)],
                fill=255,
            )


def palm_shadow(w, h, fronds, penumbra=6.0, seed=3):
    rng = np.random.default_rng(seed)

    def draw(d, s):
        for f in fronds:
            frond(d, s, *f, rng=rng)

    return mask_from(w, h, draw, soft=penumbra)


def dapple(w, h, count=260, size=(8, 30), soft=5.0, seed=5, region=None):
    """Tree-leaf dapple: many small overlapping leaf shapes."""
    rng = np.random.default_rng(seed)
    x0, y0, x1, y1 = region or (0, 0, w, h)

    def draw(d, s):
        for _ in range(count):
            cx, cy = rng.uniform(x0, x1), rng.uniform(y0, y1)
            r = rng.uniform(*size)
            a = rng.uniform(0, math.pi)
            pts = [
                (cx + math.cos(a) * r, cy + math.sin(a) * r),
                (cx + math.cos(a + 1.9) * r * 0.35, cy + math.sin(a + 1.9) * r * 0.35),
                (cx - math.cos(a) * r, cy - math.sin(a) * r),
                (cx + math.cos(a - 1.2) * r * 0.35, cy + math.sin(a - 1.2) * r * 0.35),
            ]
            d.polygon([(p[0] * s, p[1] * s) for p in pts], fill=255)

    return mask_from(w, h, draw, soft=soft)


# ── film ─────────────────────────────────────────────────────────────────

def film(img: np.ndarray, grain=0.045, halation=0.35, vignette=0.45, warmth=0.04, lift=0.035, seed=11, fade=0.0, diffusion=0.35, soften=1.4) -> np.ndarray:
    h, w, _ = img.shape
    rng = np.random.default_rng(seed)
    img = np.clip(img, 0, 1.5)
    # the lens is never perfectly sharp; a mist filter lifts the light around edges
    img = blur(img, soften)
    img = img * (1 - diffusion) + blur(img, max(w, h) * 0.01) * diffusion * 1.05
    # halation: warm glow around highlights
    lum = img.mean(-1)
    hi = np.clip(lum - 0.72, 0, 1)
    glow = gaussian_filter(hi, max(w, h) * 0.012)
    img = img + glow[..., None] * rgb("#ff8a4c") * halation
    # tone curve (soft S) and lifted blacks, like a scanned negative
    img = np.clip(img, 0, 1)
    img = img * img * (3 - 2 * img) * 0.55 + img * 0.45
    img = lift + img * (1 - lift - fade * 0.08)
    # split tone: warm highlights, slightly green-blue shadows
    lum = img.mean(-1, keepdims=True)
    img = img + (lum) * np.array([warmth, warmth * 0.35, -warmth]) + (1 - lum) * np.array([-0.01, 0.006, 0.012])
    # vignette
    x, y = grid(w, h)
    v = 1 - vignette * (((x - 0.5) ** 2 + (y - 0.5) ** 2) * 1.9) ** 1.4
    img = img * v[..., None]
    # grain, a little stronger in the mids
    g = rng.standard_normal((h, w)).astype(np.float32)
    g = gaussian_filter(g, 0.6)
    img = img + g[..., None] * grain * (0.5 + 1.2 * lum * (1 - lum))
    return np.clip(img, 0, 1)


def warp(img: np.ndarray, amount=6.0, seed=2) -> np.ndarray:
    """Slight organic distortion so nothing is perfectly straight."""
    h, w = img.shape[:2]
    dx = (fractal(w, h, 3.2, seed) - 0.5) * amount
    dy = (fractal(w, h, 3.2, seed + 1) - 0.5) * amount
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    out = np.empty_like(img)
    for c in range(img.shape[2]):
        out[..., c] = map_coordinates(img[..., c], [y + dy, x + dx], order=1, mode="reflect")
    return out


def save(img: np.ndarray, path: str, quality=74, size=None):
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    if size:
        im = im.resize(size, Image.LANCZOS)
    im.save(path, "WEBP", quality=quality, method=6)


def relief(noise: np.ndarray, strength=6.0, light=(-0.6, -0.8)) -> np.ndarray:
    """Shade a height field as if lit from one side: fabric folds, crumpled paper."""
    gy, gx = np.gradient(noise)
    shade = gx * light[0] + gy * light[1]
    shade = shade / (shade.std() + 1e-9)
    return np.clip(0.92 + shade * strength * 0.1, 0.55, 1.2).astype(np.float32)


def drape(w: int, h: int, seed=1, waves=6, direction=0.4, spread=0.6, freq=(1.5, 4.5), warp_amt=0.9) -> np.ndarray:
    """Height field of draped fabric: long soft ridges, bent by a slow warp."""
    rng = np.random.default_rng(seed)
    x, y = grid(w, h)
    x = x * (w / max(w, h))
    y = y * (h / max(w, h))
    wx = (gaussian_filter(fractal(w, h, 4.0, seed + 100), max(w, h) / 30) - 0.5) * warp_amt * 2
    wy = (gaussian_filter(fractal(w, h, 4.0, seed + 200), max(w, h) / 30) - 0.5) * warp_amt * 2
    field = np.zeros((h, w), np.float32)
    for _ in range(waves):
        a = direction + rng.uniform(-spread, spread)
        f = rng.uniform(*freq) * 2 * math.pi
        field += np.sin(((x + wx) * math.cos(a) + (y + wy) * math.sin(a)) * f + rng.uniform(0, 6.28)) / f ** 0.6
    return gaussian_filter(field, 2)
