#!/usr/bin/env python3
"""Generate BookmarkWizard toolbar icons.

Draws the icon once at 1024x1024 (purple rounded square, white bookmark
ribbon, two sparkles) and downscales to the sizes Chrome wants.

Usage: python3 scripts/generate_icons.py   (run from the extension root)
Requires: pillow
"""

import math
from pathlib import Path

from PIL import Image, ImageDraw

SIZE = 1024
CORNER_RADIUS = 230
GRADIENT_TOP = (139, 110, 245)
GRADIENT_BOTTOM = (88, 56, 213)
OUT_DIR = Path(__file__).resolve().parent.parent / "icons"
SIZES = (16, 32, 48, 128)


def gradient(size, top, bottom):
    img = Image.new("RGBA", (size, size))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        color = tuple(round(a + (b - a) * t) for a, b in zip(top, bottom))
        draw.line([(0, y), (size, y)], fill=color + (255,))
    return img


def sparkle(draw, cx, cy, radius, fill):
    points = []
    for i in range(8):
        angle = i * math.pi / 4 - math.pi / 2
        r = radius if i % 2 == 0 else radius * 0.36
        points.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    draw.polygon(points, fill=fill)


def build():
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))

    background_mask = Image.new("L", (SIZE, SIZE), 0)
    ImageDraw.Draw(background_mask).rounded_rectangle(
        [0, 0, SIZE - 1, SIZE - 1], radius=CORNER_RADIUS, fill=255
    )
    img.paste(gradient(SIZE, GRADIENT_TOP, GRADIENT_BOTTOM), (0, 0), background_mask)

    # Bookmark ribbon: rounded top corners, notched bottom.
    ribbon_mask = Image.new("L", (SIZE, SIZE), 0)
    ribbon_draw = ImageDraw.Draw(ribbon_mask)
    ribbon_draw.rounded_rectangle(
        [352, 240, 672, 784], radius=56, fill=255, corners=(True, True, False, False)
    )
    ribbon_draw.polygon([(352, 786), (672, 786), (512, 668)], fill=0)
    img.paste(Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255)), (0, 0), ribbon_mask)

    overlay = ImageDraw.Draw(img)
    sparkle(overlay, 782, 262, 92, (255, 255, 255, 235))
    sparkle(overlay, 268, 792, 44, (255, 255, 255, 185))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for size in SIZES:
        img.resize((size, size), Image.LANCZOS).save(OUT_DIR / f"icon{size}.png")
        print(f"icons/icon{size}.png")


if __name__ == "__main__":
    build()
