"""Placeholder photographs, in the manner of a film camera at dinner.

Soft focus, grain, halation, warm skin of light. They stand in for the real
photography of Chapter 0 and are meant to be replaced (see media_assets.url).
"""

import math
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(__file__))
from lib import (  # noqa: E402
    blur, ellipse, film, fractal, grid, mix, drape, palm_shadow, polygon, radial, relief, rgb, save, screen, warp,
)

OUT = os.path.join(os.path.dirname(__file__), "../../public/house/photos")
TEX = os.path.join(os.path.dirname(__file__), "../../public/house/textures")
os.makedirs(OUT, exist_ok=True)


def tex(name, w, h, zoom=1.0):
    t = Image.open(f"{TEX}/{name}.webp").convert("RGB")
    if zoom != 1:
        t = t.resize((int(t.width * zoom), int(t.height * zoom)), Image.LANCZOS)
    t = np.asarray(t, np.float32) / 255
    reps = (math.ceil(h / t.shape[0]), math.ceil(w / t.shape[1]), 1)
    return np.tile(t, reps)[:h, :w]


def dof(img, focus, amount=6.0):
    """Depth of field: blur where focus is low."""
    soft = blur(img, amount)
    f = np.clip(focus, 0, 1)[..., None]
    return img * f + soft * (1 - f)


def folds(w, h, seed, strength=1.4, direction=0.4):
    """Shading of fabric folds: soft draped ridges, lit from one side."""
    return relief(drape(w, h, seed, direction=direction, spread=0.35, warp_amt=0.5), strength)


# ── the table, after dinner (square, for the Polaroid) ──────────────────

def table_night(w=1000, h=1000):
    img = tex("wood", w, h, 0.7) * 0.9
    # a linen runner laid diagonally
    runner = polygon(w, h, [(-100, h * 0.62), (w * 0.62, -100), (w * 0.92, -40), (w * 0.12, h + 60)], soft=2)
    linen = tex("linen", w, h) * folds(w, h, 3, 1.0, 2.3)[..., None] * rgb("#f3ece0")
    img = img * (1 - runner[..., None]) + linen * runner[..., None]
    rng = np.random.default_rng(7)
    # plates, not quite cleared
    for cx, cy, r in [(290, 520, 118), (560, 300, 112), (650, 690, 116), (170, 860, 100), (860, 130, 96)]:
        img = mix(img, "#000000", ellipse(w, h, cx + 10, cy + 14, r, r * 0.97, 14), 0.35)
        img = mix(img, "#f7f4ee", ellipse(w, h, cx, cy, r, r, 1.2))
        img = mix(img, "#e5dfd3", ellipse(w, h, cx, cy, r * 0.66, r * 0.66, 3), 0.8)
        for _ in range(3):
            a, d = rng.uniform(0, 6.28), rng.uniform(0, r * 0.4)
            img = mix(img, rng.choice(["#8a4b2c", "#b0703d", "#6f7a3a", "#c89b5c"]),
                      ellipse(w, h, cx + math.cos(a) * d, cy + math.sin(a) * d, rng.uniform(8, 26), rng.uniform(5, 14), 4), 0.75)
    # glasses: a rim of light and what's left of the wine
    for cx, cy in [(430, 380, ), (780, 520), (390, 760), (120, 330)]:
        img = mix(img, "#5a1822", ellipse(w, h, cx + 6, cy + 6, 30, 30, 5), 0.5)
        rim = ellipse(w, h, cx, cy, 42, 42, 1) - ellipse(w, h, cx, cy, 38, 38, 1)
        img = screen(img, "#fff4e0", np.clip(rim, 0, 1) * 0.8)
        img = mix(img, "#000000", ellipse(w, h, cx + 22, cy + 26, 44, 44, 16), 0.12)
    # a burgundy napkin, dropped
    nap = polygon(w, h, [(700, 820), (820, 760), (930, 840), (900, 960), (760, 980), (690, 900)], soft=3)
    napkin = rgb("#5b2129") * folds(w, h, 9, 1.8)[..., None]
    img = img * (1 - nap[..., None]) + napkin * nap[..., None]
    # crumbs
    for _ in range(140):
        x, y = rng.uniform(150, 700), rng.uniform(250, 750)
        img = mix(img, "#c9a574", ellipse(w, h, x, y, rng.uniform(1.5, 4), rng.uniform(1.5, 3.5), 0.6), 0.9)
    # candles: they light everything
    light = np.zeros((h, w), np.float32)
    for cx, cy in [(470, 560), (720, 360), (240, 690)]:
        img = mix(img, "#efe4cc", ellipse(w, h, cx, cy, 16, 16, 1))
        img = mix(img, "#d8c7a2", ellipse(w, h, cx + 20, cy + 2, 12, 9, 3), 0.8)  # wax
        light += radial(w, h, cx, cy, 520, 1.6)
        img = screen(img, "#ffc774", radial(w, h, cx, cy, 70, 2.2) * 0.9)
    img = img * (0.22 + 1.0 * np.clip(light, 0, 1.3)[..., None]) * rgb("#ffd9a8")
    x, y = grid(w, h)
    focus = 1 - np.clip(np.hypot(x - 0.45, y - 0.55) * 1.4, 0, 1)
    img = dof(warp(img, 4), focus, 7)
    save(film(img, grain=0.06, halation=0.5, vignette=0.55, warmth=0.05), f"{OUT}/table-night.webp", 76)


def candles(w=1200, h=900):
    img = np.ones((h, w, 3), np.float32) * rgb("#1c120c")
    rng = np.random.default_rng(4)
    for _ in range(26):
        cx, cy, r = rng.uniform(0, w), rng.uniform(h * 0.1, h * 0.9), rng.uniform(25, 110)
        col = rng.choice(["#f7c77e", "#ffdca3", "#e9a863", "#c98a4f", "#f2b86f"])
        disc = ellipse(w, h, cx, cy, r, r, 2)
        edge = np.clip(disc - ellipse(w, h, cx, cy, r * 0.9, r * 0.9, 2), 0, 1)
        img = screen(img, col, disc * rng.uniform(0.15, 0.45) + edge * 0.25)
    # one candle, nearly in focus
    img = mix(img, "#efe4d0", polygon(w, h, [(560, 470), (620, 470), (622, 900), (558, 900)], 1.5))
    img = screen(img, "#fff1cf", ellipse(w, h, 590, 420, 13, 34, 3))
    img = screen(img, "#ff9b45", radial(w, h, 590, 430, 260, 2.0) * 0.8)
    save(film(img, grain=0.07, halation=0.6, vignette=0.4, warmth=0.05), f"{OUT}/candles.webp", 76)


def glasses(w=1200, h=900):
    """The last glasses, around one in the morning."""
    img = tex("wood", w, h, 0.9) * 0.35
    img = mix(img, "#1a120d", np.ones((h, w), np.float32) * (grid(w, h)[1] < 0.42), 0.9)
    rng = np.random.default_rng(8)
    for _ in range(18):
        cx, cy, r = rng.uniform(0, w), rng.uniform(0, h * 0.4), rng.uniform(20, 70)
        img = screen(img, rng.choice(["#f2b86f", "#e9a863", "#ffd9a0"]), ellipse(w, h, cx, cy, r, r, 3) * rng.uniform(0.15, 0.4))
    for gx, gy, s_, wine in [(0.36, 0.5, 1.0, 0.35), (0.62, 0.56, 0.9, 0.12), (0.8, 0.44, 0.7, 0.0)]:
        cx, cy, r = w * gx, h * gy, 120 * s_
        bowl = ellipse(w, h, cx, cy, r, r * 1.15, 1.5)
        img = img * (1 - bowl[..., None] * 0.35)
        if wine:
            level = ((grid(w, h)[1] * h) > cy + r * (0.9 - wine * 2.4)).astype(np.float32) * bowl
            img = mix(img, "#4a0f19", level, 0.85)
            img = screen(img, "#b3383f", level * radial(w, h, cx - r * 0.3, cy + r * 0.6, r, 1.5) * 0.6)
        rim = np.clip(bowl - ellipse(w, h, cx, cy, r * 0.93, r * 1.08, 1.5), 0, 1)
        img = screen(img, "#ffe9c8", rim * 0.7)
        img = screen(img, "#fff6e6", ellipse(w, h, cx - r * 0.45, cy - r * 0.35, r * 0.08, r * 0.35, 4) * 0.9)
        img = mix(img, "#d9c6a8", polygon(w, h, [(cx - 5, cy + r * 1.1), (cx + 5, cy + r * 1.1), (cx + 4, cy + r * 2.3), (cx - 4, cy + r * 2.3)], 1.5), 0.5)
        img = mix(img, "#e9dcc6", ellipse(w, h, cx, cy + r * 2.35, r * 0.6, r * 0.12, 2), 0.45)
    img = screen(img, "#ffae5c", radial(w, h, w * 0.15, h * 0.6, w * 0.5, 1.6) * 0.5)
    img *= rgb("#ffe2bc")
    save(film(img, grain=0.065, halation=0.6, vignette=0.5, warmth=0.05, diffusion=0.45, soften=2.2), f"{OUT}/glasses.webp", 76)


def sky(w, h, horizon, top="#6f7f95", mid="#e8a38c", low="#f6cf9a"):
    x, y = grid(w, h)
    t = np.clip(y / horizon, 0, 1)[..., None]
    col = rgb(top) * (1 - t) ** 1.4 + rgb(mid) * (1 - np.abs(t - 0.6) * 2.2).clip(0, 1) + rgb(low) * t ** 3
    streak = fractal(w // 6, h, 2.4, 21)
    streak = np.asarray(Image.fromarray(streak).resize((w, h), Image.BICUBIC), np.float32)
    col = col * (0.92 + 0.14 * streak[..., None])
    return col


def road(w=1200, h=900):
    horizon = h * 0.52
    img = sky(w, h, horizon)
    img = screen(img, "#ffe7b8", radial(w, h, w * 0.62, horizon - 10, w * 0.5, 1.8) * 0.8)
    x, y = grid(w, h)
    # hills, layered in haze
    for i, (col, amp, seed) in enumerate([("#8f7f86", 50, 1), ("#6d5b5a", 34, 2), ("#4a3b35", 22, 3)]):
        ridge = horizon - 20 + i * 14 - amp * fractal(w, 8, 2.5, seed)[3]
        m = (y * h > ridge[None, :]).astype(np.float32)
        img = mix(img, col, blur(m, 2), 0.9)
    ground = (y * h > horizon).astype(np.float32)
    grass = rgb("#8b6a45") * (0.7 + 0.4 * fractal(w, h, 1.2, 22))[..., None]
    img = img * (1 - ground[..., None]) + grass * ground[..., None]
    # the road
    rd = polygon(w, h, [(w * 0.49, horizon), (w * 0.51, horizon), (w * 0.95, h), (w * 0.05, h)], 1.5)
    img = mix(img, "#7b716c", rd)
    img = screen(img, "#ffd6a0", rd * radial(w, h, w * 0.5, horizon, h * 0.7, 1.4) * 0.4)
    for k in range(9):
        t0, t1 = (k / 9) ** 1.8, ((k + 0.45) / 9) ** 1.8
        y0, y1 = horizon + (h - horizon) * t0, horizon + (h - horizon) * t1
        wd = 1 + 8 * t1
        img = mix(img, "#efe6d6", polygon(w, h, [(w * 0.5 - wd * 0.3, y0), (w * 0.5 + wd * 0.3, y0), (w * 0.5 + wd, y1), (w * 0.5 - wd, y1)], 0.8), 0.85)
    # three runners, far away, not looking back
    for rx, s in [(0.505, 1.0), (0.515, 0.9), (0.498, 0.8)]:
        img = mix(img, "#2b2220", ellipse(w, h, w * rx, horizon + 26 / s, 3 * s, 10 * s, 0.8))
    save(film(warp(img, 3), grain=0.06, halation=0.5, vignette=0.4, warmth=0.03, diffusion=0.45, soften=2.0), f"{OUT}/road-dawn.webp", 76)


def sea(w=1200, h=900):
    horizon = h * 0.5
    img = sky(w, h, horizon, "#8a8fa8", "#f0a28a", "#ffd59c")
    img = screen(img, "#fff0c8", radial(w, h, w * 0.38, horizon - 14, 60, 1.2))
    img = screen(img, "#ffbf80", radial(w, h, w * 0.38, horizon, w * 0.6, 2.2) * 0.6)
    x, y = grid(w, h)
    water = (y * h > horizon).astype(np.float32)
    waves = fractal(w // 10, h, 2.0, 31)
    waves = np.asarray(Image.fromarray(waves).resize((w, h), Image.BICUBIC), np.float32)
    sea_col = rgb("#6f6f82") * (1 - (y - 0.5).clip(0, 1)[..., None] * 0.4) * (0.85 + 0.25 * waves[..., None])
    img = img * (1 - water[..., None]) + sea_col * water[..., None]
    glitter = water * np.exp(-((x - 0.38) ** 2) / 0.004) * (waves > 0.55)
    img = screen(img, "#ffe3b0", blur(glitter.astype(np.float32), 1.2) * 0.9)
    img = screen(img, "#ffffff", blur((np.abs(y * h - h * 0.8 - 18 * np.sin(x * 9)) < 5).astype(np.float32), 3) * 0.35)
    save(film(img, grain=0.05, halation=0.45, vignette=0.35, warmth=0.03), f"{OUT}/sea-dawn.webp", 76)


def window_linen(w=1200, h=900):
    x, y = grid(w, h)
    img = np.ones((h, w, 3), np.float32) * rgb("#cdbfa9")
    win = polygon(w, h, [(0, 0), (w * 0.44, 0), (w * 0.4, h * 0.55), (0, h * 0.62)], 30)
    img = screen(img, "#fffaf0", win)
    sheer = (0.6 + 0.4 * np.sin(x * 70 + fractal(w, h, 3, 41) * 6)) * win
    img = mix(img, "#fbf4e8", sheer, 0.5)
    bed = (y > 0.52 + 0.06 * np.sin(x * 3)).astype(np.float32)
    sheet = rgb("#f1e9dc") * folds(w, h, 42, 1.6, 0.2)[..., None]
    img = img * (1 - blur(bed, 3)[..., None]) + sheet * blur(bed, 3)[..., None]
    shade = palm_shadow(w, h, [(w * 1.1, h * 0.4, math.radians(195), w * 0.7, 0.2, 30, 1.2)], penumbra=12)
    img *= (1 - shade * 0.3)[..., None]
    img *= (0.72 + 0.5 * radial(w, h, w * 0.15, h * 0.2, w * 1.1, 1.3))[..., None]
    save(film(img, grain=0.05, halation=0.6, vignette=0.3, warmth=0.035, lift=0.06, diffusion=0.55, soften=2.5), f"{OUT}/window-linen.webp", 76)


def napkin(w=1200, h=900):
    img = tex("zellige", w, h, 1.6) * 0.8
    cloth = polygon(w, h, [(w * 0.35, -20), (w * 1.05, -20), (w * 1.05, h + 20), (w * 0.5, h + 20), (w * 0.42, h * 0.6)], 6)
    fabric = rgb("#5a2028") * folds(w, h, 51, 1.8, 1.4)[..., None] * 1.1
    img = img * (1 - cloth[..., None]) + fabric * cloth[..., None]
    shade = palm_shadow(w, h, [(-60, h * 0.2, math.radians(10), w * 0.8, 0.3, 30, 1.2)], penumbra=6)
    img *= (1 - shade * 0.45)[..., None]
    img *= (0.6 + 0.6 * radial(w, h, w * 0.3, h * 0.3, w, 1.2))[..., None] * rgb("#fff0dc")
    save(film(img, grain=0.05, halation=0.3, warmth=0.04), f"{OUT}/linen-burgundy.webp", 76)


def tea(w=1000, h=1000):
    img = tex("zellige", w, h, 1.2) * 0.9
    img = mix(img, "#000000", ellipse(w, h, 530, 540, 380, 380, 30), 0.35)
    tray = ellipse(w, h, 500, 500, 370, 370, 1.5)
    brass = rgb("#b8955a") * (0.75 + 0.35 * radial(w, h, 380, 360, 600, 1.0))[..., None]
    img = img * (1 - tray[..., None]) + brass * tray[..., None]
    rim = np.clip(tray - ellipse(w, h, 500, 500, 335, 335, 1.5), 0, 1)
    img = mix(img, "#8f6f3c", rim, 0.6)
    for k in range(48):
        a = k / 48 * 6.283
        img = mix(img, "#e2c68c", ellipse(w, h, 500 + math.cos(a) * 352, 500 + math.sin(a) * 352, 5, 5, 1), 0.6)
    # the teapot from above, and two glasses
    img = mix(img, "#000000", ellipse(w, h, 450, 440, 150, 150, 18), 0.3)
    img = mix(img, "#cfcac2", ellipse(w, h, 430, 420, 140, 140, 1.5))
    img = screen(img, "#ffffff", ellipse(w, h, 390, 370, 70, 50, 20) * 0.7)
    img = mix(img, "#9d978e", ellipse(w, h, 430, 420, 36, 36, 1.5))
    for cx, cy in [(690, 560), (600, 720)]:
        img = mix(img, "#000000", ellipse(w, h, cx + 16, cy + 18, 58, 58, 10), 0.3)
        img = mix(img, "#c77f2b", ellipse(w, h, cx, cy, 54, 54, 1.5), 0.9)
        img = screen(img, "#ffd98a", ellipse(w, h, cx - 12, cy - 14, 30, 26, 8) * 0.8)
        ring = np.clip(ellipse(w, h, cx, cy, 58, 58, 1) - ellipse(w, h, cx, cy, 54, 54, 1), 0, 1)
        img = screen(img, "#fff4de", ring)
    rng = np.random.default_rng(3)
    for _ in range(9):
        cx, cy = 760 + rng.normal(0, 40), 380 + rng.normal(0, 40)
        img = mix(img, rng.choice(["#4f7a3a", "#6b9447", "#3d6130"]), ellipse(w, h, cx, cy, 22, 13, 2), 0.95)
    shade = palm_shadow(w, h, [(w * 1.1, -40, math.radians(140), w * 0.9, 0.3, 34, 1.3)], penumbra=7)
    img *= (1 - shade * 0.5)[..., None]
    img *= rgb("#fff1dc")
    save(film(img, grain=0.05, halation=0.35, warmth=0.04), f"{OUT}/tea.webp", 76)


def arch(w=900, h=1200):
    x, y = grid(w, h)
    wall = tex("plaster", w, h) * rgb("#f2dfc6") * 1.02
    img = wall.copy()
    # a horseshoe arch opening onto a bright garden
    cx, top, r = w * 0.5, h * 0.2, w * 0.3
    pts = [(cx + math.cos(a) * r, top + r + math.sin(a) * r) for a in np.linspace(math.pi * 0.83, math.pi * 2.17, 60)]
    pts += [(cx + r * 0.86, h * 0.92), (cx - r * 0.86, h * 0.92)]
    opening = polygon(w, h, pts, 1.5)
    garden = rgb("#e9e3d1") * 1.02
    garden = garden * np.ones((h, w, 1), np.float32)
    leaves = blur((fractal(w, h, 1.4, 61) > 0.55).astype(np.float32), 4) * (y > 0.45)
    garden = mix(garden, "#56643c", leaves, 0.9)
    garden = mix(garden, "#7a8452", blur((fractal(w, h, 1.0, 62) > 0.6).astype(np.float32), 2) * (y > 0.72), 0.9)
    img = img * (1 - opening[..., None]) + blur(garden, 5) * opening[..., None]
    # reveal of the arch's thickness
    img = mix(img, "#c9b294", np.clip(polygon(w, h, [(p[0] + 18, p[1] + 10) for p in pts], 2) - opening, 0, 1), 0.45)
    shade = palm_shadow(w, h, [(-80, h * 0.1, math.radians(20), w * 0.9, 0.4, 32, 1.3), (-60, h * 0.7, math.radians(-15), w * 0.7, -0.2, 30, 1.1)], penumbra=6)
    img *= (1 - shade * 0.38)[..., None]
    img *= (0.8 + 0.3 * (1 - y))[..., None]
    save(film(img, grain=0.05, halation=0.45, vignette=0.3, warmth=0.035, lift=0.05, diffusion=0.4, soften=1.8), f"{OUT}/arch.webp", 76)


if __name__ == "__main__":
    for fn in (table_night, candles, glasses, road, sea, window_linen, napkin, tea, arch):
        fn()
        print("✓", fn.__name__)
