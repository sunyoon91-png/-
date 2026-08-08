#!/usr/bin/env python3
"""
CLI thumbnail generator that reproduces a fixed visual style:

  - 740x400 canvas, background photo "cover"-cropped to fill it
  - uniform darkening of the background photo
  - a soft dark radial gradient anchored top-left (seats the caption)
  - a dark linear gradient rising from the bottom (seats the big title)
  - a small bold caption block, top-left, white with black outline + drop shadow
  - a large bold title, bottom-left, white with black outline + drop shadow,
    with one optional keyword rendered in the brand color

Usage:
  python thumbnail_generator.py \
      --bg background.jpg \
      --title "생명보험의 가치" \
      --subtitle "마라톤과\n꼬옥이가\n전하는" \
      --highlight "의" \
      --out thumbnail.png

The bold Korean font (Pretendard) ships in fonts/, so --font-bold is only
needed to override it.
"""
from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageFont

# ---------------------------------------------------------------------------
# Style defaults, tuned against the reference thumbnail at 740x400.
# Every value scales with canvas size so --width/--height still look right.
# ---------------------------------------------------------------------------

DEFAULT_WIDTH = 740
DEFAULT_HEIGHT = 400
DEFAULT_BRAND_COLOR = "#0E9B49"

# Checked in order when --font-bold is not given. The bundled Pretendard
# (fonts/Pretendard-Bold.otf, next to this script) is tried first; the rest
# are common system install locations for other Korean-capable bold fonts.
FONT_SEARCH_PATHS = [
    str(Path(__file__).resolve().parent / "fonts" / "Pretendard-Bold.otf"),
    "/usr/share/fonts/truetype/pretendard/Pretendard-Bold.otf",
    "/usr/share/fonts/opentype/pretendard/Pretendard-Bold.otf",
    "/usr/share/fonts/truetype/noto/NotoSansKR-Bold.otf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/truetype/nanum/NanumSquareRoundEB.ttf",
    "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf",
    "C:/Windows/Fonts/malgunbd.ttf",
    "/System/Library/Fonts/Supplemental/AppleSDGothicNeo.ttc",
]


class FontNotFoundError(RuntimeError):
    pass


def resolve_font(path: str | None, size: int) -> ImageFont.FreeTypeFont:
    candidates = [path] if path else FONT_SEARCH_PATHS
    for candidate in candidates:
        if not candidate:
            continue
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    raise FontNotFoundError(
        "No bold Korean-capable font found.\n"
        "Pass one explicitly with --font-bold /path/to/font.ttf (or .otf).\n"
        "Free options: Pretendard, Noto Sans KR, NanumSquareRound Extra Bold."
    )


def hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i : i + 2], 16) for i in (0, 2, 4))


# ---------------------------------------------------------------------------
# Background prep: cover-crop + darken + directional gradients
# ---------------------------------------------------------------------------

def cover_crop(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Resize+center-crop so img fills target_w x target_h exactly, no distortion."""
    img = img.convert("RGB")
    src_w, src_h = img.size
    src_ratio = src_w / src_h
    dst_ratio = target_w / target_h

    if src_ratio > dst_ratio:
        new_h = target_h
        new_w = round(new_h * src_ratio)
    else:
        new_w = target_w
        new_h = round(new_w / src_ratio)

    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return img.crop((left, top, left + target_w, top + target_h))


def radial_gradient_mask(
    size: tuple[int, int],
    center: tuple[float, float],
    radius: float,
    start: int,
    end: int,
) -> Image.Image:
    """Grayscale mask, `start` value at center fading to `end` at radius."""
    w, h = size
    small = 120  # build tiny + upscale: fast and naturally anti-aliased
    base = Image.new("L", (small, small))
    px = base.load()
    cx, cy = center[0] / w * small, center[1] / h * small
    r = radius / max(w, h) * small
    for yy in range(small):
        for xx in range(small):
            d = math.hypot(xx - cx, yy - cy)
            t = min(d / r, 1.0)
            px[xx, yy] = int(start + (end - start) * t)
    return base.resize((w, h), Image.BICUBIC)


def linear_gradient_mask(
    size: tuple[int, int],
    start: int,
    end: int,
    start_pos: float,
    end_pos: float,
) -> Image.Image:
    """Vertical grayscale mask: `start` above start_pos, `end` below end_pos,
    lerped between (start_pos, end_pos), expressed as a fraction of height."""
    w, h = size
    col = Image.new("L", (1, h))
    px = col.load()
    for y in range(h):
        t = y / h
        if t <= start_pos:
            v = start
        elif t >= end_pos:
            v = end
        else:
            frac = (t - start_pos) / (end_pos - start_pos)
            v = int(start + (end - start) * frac)
        px[0, y] = v
    return col.resize((w, h))


def build_background(
    bg_path: str,
    width: int,
    height: int,
    darken: float,
    top_gradient_alpha: int,
    bottom_gradient_alpha: int,
) -> Image.Image:
    bg = Image.open(bg_path)
    bg = cover_crop(bg, width, height)
    bg = ImageEnhance.Brightness(bg).enhance(darken)
    bg = ImageEnhance.Color(bg).enhance(0.92)
    bg = bg.convert("RGBA")

    # Radial dark pocket anchored top-left, seats the caption text.
    top_mask = radial_gradient_mask(
        (width, height),
        center=(width * 0.05, height * 0.32),
        radius=width * 0.85,
        start=top_gradient_alpha,
        end=0,
    )
    # Linear dark rise from the bottom, seats the big title.
    bottom_mask = linear_gradient_mask(
        (width, height),
        start=0,
        end=bottom_gradient_alpha,
        start_pos=0.45,
        end_pos=1.0,
    )
    # Combine by taking the max alpha at each pixel (darker of the two wins).
    combined_mask = ImageChops.lighter(top_mask, bottom_mask)

    black = Image.new("RGBA", (width, height), (0, 0, 0, 255))
    bg = Image.composite(black, bg, combined_mask)
    return bg


# ---------------------------------------------------------------------------
# Text rendering: bold fill + black outline + soft drop shadow
# ---------------------------------------------------------------------------

def draw_outlined_text(
    canvas: Image.Image,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    stroke_width: int = 3,
    stroke_fill: tuple[int, int, int] = (0, 0, 0),
    shadow_offset: tuple[int, int] = (0, 6),
    shadow_blur: int = 10,
    shadow_alpha: int = 140,
) -> None:
    """Draws `text` at xy onto canvas (RGBA), with a blurred drop shadow
    underneath and a hard black stroke for contrast against busy photos."""
    w, h = canvas.size

    shadow_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(shadow_layer).text(
        (xy[0] + shadow_offset[0], xy[1] + shadow_offset[1]),
        text,
        font=font,
        fill=(0, 0, 0, shadow_alpha),
        stroke_width=stroke_width,
        stroke_fill=(0, 0, 0, shadow_alpha),
    )
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(shadow_blur))
    canvas.alpha_composite(shadow_layer)

    text_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(text_layer).text(
        xy,
        text,
        font=font,
        fill=(*fill, 255),
        stroke_width=stroke_width,
        stroke_fill=(*stroke_fill, 255),
    )
    canvas.alpha_composite(text_layer)


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, stroke_width: int) -> tuple[int, int]:
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_subtitle(
    canvas: Image.Image,
    lines: list[str],
    font: ImageFont.FreeTypeFont,
    margin_x: int,
    top_y: int,
    line_gap: int,
    stroke_width: int,
) -> int:
    """Draws stacked caption lines, left-aligned. Returns the y just below
    the last line, so callers can lay out the title below it if desired."""
    scratch = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    y = top_y
    for line in lines:
        draw_outlined_text(
            canvas,
            (margin_x, y),
            line,
            font,
            fill=(255, 255, 255),
            stroke_width=stroke_width,
            shadow_offset=(0, 4),
            shadow_blur=6,
        )
        _, h = text_size(scratch, line, font, stroke_width)
        y += h + line_gap
    return y


def fit_title_font(
    font_path: str | None,
    title: str,
    max_width: int,
    max_size: int,
    min_size: int,
    stroke_width: int,
) -> ImageFont.FreeTypeFont:
    scratch = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    size = max_size
    while size > min_size:
        font = resolve_font(font_path, size)
        w, _ = text_size(scratch, title, font, stroke_width)
        if w <= max_width:
            return font
        size -= 2
    return resolve_font(font_path, min_size)


def draw_title(
    canvas: Image.Image,
    title: str,
    font: ImageFont.FreeTypeFont,
    margin_x: int,
    baseline_from_bottom: int,
    stroke_width: int,
    highlight: str | None,
    brand_color: tuple[int, int, int],
) -> None:
    scratch = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    _, h = text_size(scratch, title, font, stroke_width)
    y = canvas.size[1] - baseline_from_bottom - h

    segments: list[tuple[str, tuple[int, int, int]]]
    if highlight and highlight in title:
        before, _, after = title.partition(highlight)
        segments = [
            (before, (255, 255, 255)),
            (highlight, brand_color),
            (after, (255, 255, 255)),
        ]
        segments = [(s, c) for s, c in segments if s]
    else:
        segments = [(title, (255, 255, 255))]

    x = margin_x
    for text, color in segments:
        draw_outlined_text(
            canvas,
            (x, y),
            text,
            font,
            fill=color,
            stroke_width=stroke_width,
            shadow_offset=(0, 10),
            shadow_blur=16,
            shadow_alpha=200,
        )
        # Advance by the glyphs' natural run width, not the stroke-inflated
        # bbox (text_size) — that overhang made the gap after a highlighted
        # segment look far wider than the surrounding letter spacing.
        w = scratch.textlength(text, font=font)
        x += w


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def generate_thumbnail(
    bg_path: str,
    title: str,
    subtitle: str | None,
    out_path: str,
    width: int = DEFAULT_WIDTH,
    height: int = DEFAULT_HEIGHT,
    brand_color: str = DEFAULT_BRAND_COLOR,
    highlight: str | None = None,
    font_bold: str | None = None,
    font_regular: str | None = None,
    darken: float = 0.78,
    top_gradient_alpha: int = 130,
    bottom_gradient_alpha: int = 165,
    margin: int | None = None,
    subtitle_size: int | None = None,
    title_max_size: int | None = None,
    title_min_size: int | None = None,
) -> None:
    margin = margin if margin is not None else round(width * 0.05)
    subtitle_size = subtitle_size or round(height * 0.10)
    title_max_size = title_max_size or round(height * 0.24)
    title_min_size = title_min_size or round(height * 0.10)
    brand_rgb = hex_to_rgb(brand_color)

    canvas = build_background(
        bg_path, width, height, darken, top_gradient_alpha, bottom_gradient_alpha
    )

    if subtitle:
        lines = subtitle.split("\n")
        sub_font = resolve_font(font_regular or font_bold, subtitle_size)
        draw_subtitle(
            canvas,
            lines,
            sub_font,
            margin_x=margin,
            top_y=round(height * 0.08),
            line_gap=round(subtitle_size * 0.18),
            stroke_width=max(1, round(subtitle_size * 0.035)),
        )

    title_stroke_width = max(2, round(title_max_size * 0.025))
    title_font = fit_title_font(
        font_bold,
        title,
        max_width=width - 2 * margin,
        max_size=title_max_size,
        min_size=title_min_size,
        stroke_width=title_stroke_width,
    )
    draw_title(
        canvas,
        title,
        title_font,
        margin_x=margin,
        baseline_from_bottom=round(height * 0.08),
        stroke_width=title_stroke_width,
        highlight=highlight,
        brand_color=brand_rgb,
    )

    canvas.convert("RGB").save(out_path, quality=95)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a branded video thumbnail from a background photo + title.",
    )
    parser.add_argument("--bg", required=True, help="Path to background image")
    parser.add_argument("--title", required=True, help="Large bottom title text")
    parser.add_argument(
        "--subtitle",
        default=None,
        help=r"Small top-left caption. Use \n for explicit line breaks, e.g. '마라톤과\n꼬옥이가\n전하는'",
    )
    parser.add_argument("--out", default="thumbnail.png", help="Output file path")
    parser.add_argument("--width", type=int, default=DEFAULT_WIDTH)
    parser.add_argument("--height", type=int, default=DEFAULT_HEIGHT)
    parser.add_argument("--brand-color", default=DEFAULT_BRAND_COLOR, help="Hex color, e.g. #0E9B49")
    parser.add_argument(
        "--highlight", default=None, help="Substring inside --title to render in the brand color"
    )
    parser.add_argument("--font-bold", default=None, help="Path to a bold Korean-capable font")
    parser.add_argument(
        "--font-regular", default=None, help="Path to the caption font (defaults to --font-bold)"
    )
    parser.add_argument("--darken", type=float, default=0.78, help="Background brightness factor, 0-1")
    parser.add_argument("--top-gradient-alpha", type=int, default=130, help="0-255")
    parser.add_argument("--bottom-gradient-alpha", type=int, default=165, help="0-255")
    parser.add_argument("--margin", type=int, default=None)
    parser.add_argument("--subtitle-size", type=int, default=None)
    parser.add_argument("--title-max-size", type=int, default=None)
    parser.add_argument("--title-min-size", type=int, default=None)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        generate_thumbnail(
            bg_path=args.bg,
            title=args.title,
            subtitle=args.subtitle.replace("\\n", "\n") if args.subtitle else None,
            out_path=args.out,
            width=args.width,
            height=args.height,
            brand_color=args.brand_color,
            highlight=args.highlight,
            font_bold=args.font_bold,
            font_regular=args.font_regular,
            darken=args.darken,
            top_gradient_alpha=args.top_gradient_alpha,
            bottom_gradient_alpha=args.bottom_gradient_alpha,
            margin=args.margin,
            subtitle_size=args.subtitle_size,
            title_max_size=args.title_max_size,
            title_min_size=args.title_min_size,
        )
    except FontNotFoundError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    except FileNotFoundError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1

    print(f"saved: {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
