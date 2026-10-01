"""The paper grain laid over every page. Everything else in the House is photographed."""

import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(__file__))
from lib import blur, fractal, save  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), "../../public/house/textures")
os.makedirs(OUT, exist_ok=True)


def paper(n=512):
    fibres = fractal(n, n, 0.6, 1) * 0.5 + fractal(n, n, 1.4, 2) * 0.5
    stretch = blur(fractal(n, n, 0.2, 3), (0.4)) * 0.4
    t = 0.93 + (fibres - 0.5) * 0.06 + (stretch - 0.2) * 0.03 + (fractal(n, n, 2.6, 4) - 0.5) * 0.05
    img = np.stack([t * 0.985, t * 0.975, t * 0.95], -1)
    save(img, f"{OUT}/paper.webp", 80)



if __name__ == "__main__":
    paper()
    print("paper ✓")
