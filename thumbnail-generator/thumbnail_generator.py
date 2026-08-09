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
    str(Path(__file__).resolve().parent / "fonts" / "Pretendard-Black.otf"),
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

def cover_crop(
    img: Image.Image, target_w: int, target_h: int, focus_y: float = 0.5
) -> Image.Image:
    """Resize+crop so img fills target_w x target_h exactly, no distortion.
    `focus_y` picks which part of the source survives a vertical crop: 0.0
    keeps the top (crops away the bottom), which pushes source content DOWN
    toward the frame's bottom edge; 1.0 keeps the bottom (crops away the
    top), pushing source content UP toward the top edge; 0.5 is centered.
    Only affects images taller than the target aspect ratio — width is
    always centered."""
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
    top = round((new_h - target_h) * focus_y)
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
    highlight_protect: float = 0.0,
    bg_focus_y: float = 0.5,
) -> Image.Image:
    original = Image.open(bg_path)
    original = cover_crop(original, width, height, focus_y=bg_focus_y)
    bg = ImageEnhance.Brightness(original).enhance(darken)
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

    if highlight_protect > 0:
        # Scale the darkening down wherever the source photo is already
        # bright (e.g. a white sign or a spotlit subject), so that object
        # stays closer to its original brightness instead of being darkened
        # by the same amount as its dim surroundings.
        luminance = original.convert("L")
        keep_fraction = luminance.point(lambda v: round(255 - highlight_protect * v))
        combined_mask = ImageChops.multiply(combined_mask, keep_fraction)

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
    anchor: str | None = None,
    letter_spacing: float = 0.0,
) -> float:
    """Draws `text` at xy onto canvas (RGBA), with a blurred drop shadow
    underneath and a hard black stroke for contrast against busy photos.
    `anchor` follows Pillow's text-anchor codes (e.g. "ls" = left-baseline),
    letting differently-sized segments share a baseline when composed side
    by side (see draw_title). `letter_spacing` is a fraction of each glyph's
    advance width added between characters (e.g. -0.04 for -4% tracking).
    Returns the total horizontal advance, so callers can chain runs.

    `anchor` must be a left-based code (e.g. "la", "ls") when letter_spacing
    is non-zero, since tracking is simulated by drawing glyph-by-glyph from
    xy[0] going right — a centered/right anchor would misplace the run."""
    w, h = canvas.size

    shadow_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    text_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_layer)

    if letter_spacing == 0.0:
        shadow_draw.text(
            (xy[0] + shadow_offset[0], xy[1] + shadow_offset[1]),
            text,
            font=font,
            fill=(0, 0, 0, shadow_alpha),
            stroke_width=stroke_width,
            stroke_fill=(0, 0, 0, shadow_alpha),
            anchor=anchor,
        )
        text_draw.text(
            xy,
            text,
            font=font,
            fill=(*fill, 255),
            stroke_width=stroke_width,
            stroke_fill=(*stroke_fill, 255),
            anchor=anchor,
        )
        advance = text_draw.textlength(text, font=font)
    else:
        x = float(xy[0])
        for ch in text:
            shadow_draw.text(
                (x + shadow_offset[0], xy[1] + shadow_offset[1]),
                ch,
                font=font,
                fill=(0, 0, 0, shadow_alpha),
                stroke_width=stroke_width,
                stroke_fill=(0, 0, 0, shadow_alpha),
                anchor=anchor,
            )
            text_draw.text(
                (x, xy[1]),
                ch,
                font=font,
                fill=(*fill, 255),
                stroke_width=stroke_width,
                stroke_fill=(*stroke_fill, 255),
                anchor=anchor,
            )
            x += text_draw.textlength(ch, font=font) * (1 + letter_spacing)
        advance = x - xy[0]

    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(shadow_blur))
    canvas.alpha_composite(shadow_layer)
    canvas.alpha_composite(text_layer)
    return advance


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


def tracked_width(
    draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, letter_spacing: float
) -> float:
    """Mirrors draw_outlined_text's glyph-by-glyph advance exactly, so
    fit_title_size measures the same width that will actually be drawn."""
    if letter_spacing == 0.0:
        return draw.textlength(text, font=font)
    return sum(draw.textlength(ch, font=font) * (1 + letter_spacing) for ch in text)


def _title_segments(
    title: str,
    highlight: str | None,
    highlight_color: tuple[int, int, int],
) -> list[tuple[str, bool]]:
    """Splits title into (text, is_highlight) runs around the first
    occurrence of `highlight`."""
    if highlight and highlight in title:
        before, _, after = title.partition(highlight)
        segments = [(before, False), (highlight, True), (after, False)]
        return [(s, is_hl) for s, is_hl in segments if s]
    return [(title, False)]


def fit_title_size(
    font_path: str | None,
    lines: list[str],
    max_width: int,
    max_size: int,
    min_size: int,
    highlight: str | None,
    highlight_scale: float,
    letter_spacing: float = 0.0,
) -> int:
    """Finds the largest base font size where every title line (with its
    highlighted run possibly scaled up by highlight_scale) still fits
    max_width, sharing a common baseline within its own line."""
    scratch = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    size = max_size
    while size > min_size:
        fits = True
        for line in lines:
            total = 0.0
            for text, is_hl in _title_segments(line, highlight, (0, 0, 0)):
                seg_size = round(size * highlight_scale) if is_hl else size
                font = resolve_font(font_path, seg_size)
                total += tracked_width(scratch, text, font, letter_spacing)
            if total > max_width:
                fits = False
                break
        if fits:
            return size
        size -= 2
    return min_size


def draw_title(
    canvas: Image.Image,
    lines: list[str],
    font_path: str | None,
    size: int,
    margin_x: int,
    baseline_from_bottom: int,
    stroke_width: int,
    highlight: str | None,
    highlight_color: tuple[int, int, int],
    highlight_scale: float,
    letter_spacing: float = 0.0,
    stroke_matches_fill: bool = False,
    shadow_offset: tuple[int, int] = (0, 12),
    shadow_blur: int = 20,
    shadow_alpha: int = 255,
    line_gap: int | None = None,
) -> None:
    """Draws `lines` stacked upward from `baseline_from_bottom`, each line
    laid out independently (its own highlight run, sharing a baseline within
    that line — see draw_outlined_text). `stroke_matches_fill` draws the
    outline in the same color as each segment's fill instead of black —
    fattens the glyphs (faux-bold, for when a heavier weight isn't available)
    without a visible outline, the look to reach for once `stroke_width=0`
    (a pure shadow silhouette) reads too thin."""
    base_font = resolve_font(font_path, size)
    ascent, descent = base_font.getmetrics()
    pitch = ascent + descent + (line_gap if line_gap is not None else round(size * 0.12))
    n = len(lines)
    last_baseline = canvas.size[1] - baseline_from_bottom
    baselines = [last_baseline - pitch * (n - 1 - i) for i in range(n)]

    for line, baseline_y in zip(lines, baselines):
        x = margin_x
        for text, is_hl in _title_segments(line, highlight, highlight_color):
            seg_size = round(size * highlight_scale) if is_hl else size
            font = resolve_font(font_path, seg_size)
            color = highlight_color if is_hl else (255, 255, 255)
            x += draw_outlined_text(
                canvas,
                (x, baseline_y),
                text,
                font,
                fill=color,
                stroke_width=stroke_width,
                stroke_fill=color if stroke_matches_fill else (0, 0, 0),
                shadow_offset=shadow_offset,
                shadow_blur=shadow_blur,
                shadow_alpha=shadow_alpha,
                anchor="ls",
                letter_spacing=letter_spacing,
            )


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
    highlight_color: str | None = None,
    highlight_scale: float = 1.0,
    title_letter_spacing: float = -0.03,
    title_stroke_width: int | None = None,
    title_stroke_matches_fill: bool = False,
    title_bottom_margin: float = 0.10,
    font_bold: str | None = None,
    font_regular: str | None = None,
    darken: float = 0.78,
    top_gradient_alpha: int = 130,
    bottom_gradient_alpha: int = 165,
    protect_highlights: float = 0.0,
    bg_focus_y: float = 0.5,
    margin: int | None = None,
    subtitle_size: int | None = None,
    title_max_size: int | None = None,
    title_min_size: int | None = None,
) -> None:
    margin = margin if margin is not None else round(width * 0.05)
    subtitle_size = subtitle_size or round(height * 0.10)
    title_max_size = title_max_size or round(height * 0.24)
    title_min_size = title_min_size or round(height * 0.10)
    highlight_rgb = hex_to_rgb(highlight_color or brand_color)

    canvas = build_background(
        bg_path,
        width,
        height,
        darken,
        top_gradient_alpha,
        bottom_gradient_alpha,
        highlight_protect=protect_highlights,
        bg_focus_y=bg_focus_y,
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

    if title_stroke_width is None:
        title_stroke_width = max(2, round(title_max_size * 0.025))
    title_lines = title.split("\n")
    title_size = fit_title_size(
        font_bold,
        title_lines,
        max_width=width - 2 * margin,
        max_size=title_max_size,
        min_size=title_min_size,
        highlight=highlight,
        highlight_scale=highlight_scale,
        letter_spacing=title_letter_spacing,
    )
    draw_title(
        canvas,
        title_lines,
        font_bold,
        title_size,
        margin_x=margin,
        baseline_from_bottom=round(height * title_bottom_margin),
        stroke_width=title_stroke_width,
        highlight=highlight,
        highlight_color=highlight_rgb,
        highlight_scale=highlight_scale,
        letter_spacing=title_letter_spacing,
        stroke_matches_fill=title_stroke_matches_fill,
    )

    canvas.convert("RGB").save(out_path, quality=95)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate a branded video thumbnail from a background photo + title.",
    )
    parser.add_argument("--bg", required=True, help="Path to background image")
    parser.add_argument(
        "--title",
        required=True,
        help=r"Large bottom title text. Use \n to force a line break, e.g. '광화문글판은\n어떻게 만들어질까요?' — "
        "without one it stays single-line and auto-shrinks to fit the width.",
    )
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
        "--highlight", default=None, help="Substring inside --title to render in the highlight color"
    )
    parser.add_argument(
        "--highlight-color", default=None, help="Hex color for --highlight (defaults to --brand-color)"
    )
    parser.add_argument(
        "--highlight-scale",
        type=float,
        default=1.0,
        help="Font-size multiplier for the --highlight run, e.g. 1.3 for 30%% bigger",
    )
    parser.add_argument(
        "--title-letter-spacing",
        type=float,
        default=-0.03,
        help="Tracking for the title, as a fraction of glyph width, e.g. -0.04 for -4%%. "
        "Note Pretendard Black starts overlapping past roughly -0.04.",
    )
    parser.add_argument(
        "--title-stroke-width",
        type=int,
        default=None,
        help="Outline thickness around the title, in px (its color is set by "
        "--title-stroke-matches-fill). 0 disables it entirely (shadow-only look). "
        "Defaults to a thin auto-sized outline.",
    )
    parser.add_argument(
        "--title-stroke-matches-fill",
        action="store_true",
        help="Draw the title's outline in the same color as its fill instead of black — "
        "fattens the glyphs (faux-bold) without a visible outline.",
    )
    parser.add_argument(
        "--title-bottom-margin",
        type=float,
        default=0.10,
        help="Gap between the title's baseline and the canvas bottom, as a fraction of "
        "height. Larger lifts the title up, e.g. 0.13.",
    )
    parser.add_argument("--font-bold", default=None, help="Path to a bold Korean-capable font")
    parser.add_argument(
        "--font-regular", default=None, help="Path to the caption font (defaults to --font-bold)"
    )
    parser.add_argument("--darken", type=float, default=0.78, help="Background brightness factor, 0-1")
    parser.add_argument("--top-gradient-alpha", type=int, default=130, help="0-255")
    parser.add_argument("--bottom-gradient-alpha", type=int, default=165, help="0-255")
    parser.add_argument(
        "--protect-highlights",
        type=float,
        default=0.0,
        help="0-1: shield already-bright areas of the photo (a white sign, a spotlit "
        "subject) from the darkening overlays, e.g. 0.6",
    )
    parser.add_argument(
        "--bg-focus-y",
        type=float,
        default=0.5,
        help="0-1: which part of the background photo survives the vertical crop. "
        "Higher values crop away more of the top, pushing the photo's content UP "
        "toward the frame's top edge (e.g. 1.0 to lift a subject away from bottom "
        "title text); 0 keeps the top and pushes content down; 0.5 is centered.",
    )
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
            title=args.title.replace("\\n", "\n"),
            subtitle=args.subtitle.replace("\\n", "\n") if args.subtitle else None,
            out_path=args.out,
            width=args.width,
            height=args.height,
            brand_color=args.brand_color,
            highlight=args.highlight,
            highlight_color=args.highlight_color,
            highlight_scale=args.highlight_scale,
            title_letter_spacing=args.title_letter_spacing,
            title_stroke_width=args.title_stroke_width,
            title_stroke_matches_fill=args.title_stroke_matches_fill,
            title_bottom_margin=args.title_bottom_margin,
            font_bold=args.font_bold,
            font_regular=args.font_regular,
            darken=args.darken,
            top_gradient_alpha=args.top_gradient_alpha,
            bottom_gradient_alpha=args.bottom_gradient_alpha,
            protect_highlights=args.protect_highlights,
            bg_focus_y=args.bg_focus_y,
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
