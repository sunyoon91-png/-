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
import re
import shutil
import sys
from datetime import date
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

# Regular-weight companion for lighter text (bylines, small captions) where
# the bold/black title weights would look too heavy. Falls back to whatever
# --font-bold resolves to if this bundled file is missing.
BUNDLED_REGULAR_FONT = str(Path(__file__).resolve().parent / "fonts" / "Pretendard-Regular.otf")


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
    img: Image.Image,
    target_w: int,
    target_h: int,
    focus_x: float = 0.5,
    focus_y: float = 0.5,
    zoom: float = 1.0,
) -> Image.Image:
    """Resize+crop so img fills target_w x target_h exactly, no distortion.
    The image is scaled to the minimum size that covers the target box, then
    `zoom` (>=1.0) scales it further, creating slack to reposition within.
    `focus_x`/`focus_y` pick where the crop window sits in that slack: 0.0
    keeps that axis' start edge (crops away the far edge), which pushes
    source content toward the frame's far edge; 1.0 keeps the far edge
    (crops away the start), pushing content toward the start edge; 0.5 is
    centered. At zoom=1.0 the axis matching the target's aspect ratio has no
    slack at all — only the other axis (and cropped-away edges) still moves.
    Note the source's own composition sets the ceiling: focus/zoom can only
    recenter within what the photo already contains, not create a framing
    that was never captured."""
    img = img.convert("RGB")
    src_w, src_h = img.size
    scale = max(target_w / src_w, target_h / src_h) * zoom
    new_w, new_h = round(src_w * scale), round(src_h * scale)

    img = img.resize((new_w, new_h), Image.LANCZOS)
    left = round((new_w - target_w) * focus_x)
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
    bg_focus_x: float = 0.5,
    bg_focus_y: float = 0.5,
    bg_zoom: float = 1.0,
) -> Image.Image:
    original = Image.open(bg_path)
    original = cover_crop(
        original, width, height, focus_x=bg_focus_x, focus_y=bg_focus_y, zoom=bg_zoom
    )
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


def draw_badge(
    canvas: Image.Image,
    text: str,
    font: ImageFont.FreeTypeFont,
    xy: tuple[int, int],
    bg_color: tuple[int, int, int],
    text_color: tuple[int, int, int] = (255, 255, 255),
    pad_x: int = 14,
    pad_y: int = 7,
    radius: int | None = None,
) -> int:
    """Draws a filled rounded-rect pill with `text` inside, top-left anchored
    at xy (e.g. a small "창립 68주년 기념식" label above a title). Returns
    the y just below the badge, so callers can stack a title under it."""
    scratch = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    bbox = scratch.textbbox((0, 0), text, font=font)
    text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    w, h = text_w + pad_x * 2, text_h + pad_y * 2
    if radius is None:
        radius = h // 2

    badge = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(badge).rounded_rectangle((0, 0, w, h), radius=radius, fill=(*bg_color, 255))
    ImageDraw.Draw(badge).text(
        (pad_x - bbox[0], pad_y - bbox[1]), text, font=font, fill=(*text_color, 255)
    )
    canvas.alpha_composite(badge, dest=xy)
    return xy[1] + h


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
    max_height: int | None = None,
    line_gap: int | None = None,
) -> int:
    """Finds the largest base font size where every title line (with its
    highlighted run possibly scaled up by highlight_scale) still fits
    max_width, sharing a common baseline within its own line, and where the
    full stack of lines fits max_height (matching draw_title's pitch math —
    only matters for multi-line titles with a badge/byline eating into the
    vertical budget)."""
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
        if fits and max_height is not None and len(lines) > 1:
            base_font = resolve_font(font_path, size)
            ascent, descent = base_font.getmetrics()
            pitch = ascent + descent + (line_gap if line_gap is not None else round(size * 0.12))
            if pitch * len(lines) > max_height:
                fits = False
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
    highlight_underline: bool = False,
    underline_thickness: int | None = None,
    underline_gap: int | None = None,
) -> None:
    """Draws `lines` stacked upward from `baseline_from_bottom`, each line
    laid out independently (its own highlight run, sharing a baseline within
    that line — see draw_outlined_text). `stroke_matches_fill` draws the
    outline in the same color as each segment's fill instead of black —
    fattens the glyphs (faux-bold, for when a heavier weight isn't available)
    without a visible outline, the look to reach for once `stroke_width=0`
    (a pure shadow silhouette) reads too thin. `highlight_underline` draws a
    solid bar in the highlight color under each highlighted run, spanning
    just that run's width."""
    base_font = resolve_font(font_path, size)
    ascent, descent = base_font.getmetrics()
    pitch = ascent + descent + (line_gap if line_gap is not None else round(size * 0.12))
    n = len(lines)
    last_baseline = canvas.size[1] - baseline_from_bottom
    baselines = [last_baseline - pitch * (n - 1 - i) for i in range(n)]
    underline_thickness = underline_thickness or max(2, round(size * 0.045))
    underline_gap = underline_gap if underline_gap is not None else round(size * 0.08)
    underline_draw = ImageDraw.Draw(canvas)

    for line, baseline_y in zip(lines, baselines):
        x = margin_x
        for text, is_hl in _title_segments(line, highlight, highlight_color):
            seg_size = round(size * highlight_scale) if is_hl else size
            font = resolve_font(font_path, seg_size)
            color = highlight_color if is_hl else (255, 255, 255)
            seg_start_x = x
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
            if is_hl and highlight_underline:
                bar_y = baseline_y + underline_gap
                underline_draw.rectangle(
                    (seg_start_x, bar_y, x, bar_y + underline_thickness),
                    fill=(*highlight_color, 255),
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
    highlight_underline: bool = False,
    badge: str | None = None,
    badge_color: str | None = None,
    byline: str | None = None,
    byline_size: int | None = None,
    font_bold: str | None = None,
    font_regular: str | None = None,
    darken: float = 0.78,
    top_gradient_alpha: int = 130,
    bottom_gradient_alpha: int = 165,
    protect_highlights: float = 0.0,
    bg_focus_x: float = 0.5,
    bg_focus_y: float = 0.5,
    bg_zoom: float = 1.0,
    margin: int | None = None,
    subtitle_size: int | None = None,
    title_max_size: int | None = None,
    title_min_size: int | None = None,
) -> None:
    margin = margin if margin is not None else round(width * 0.05)
    subtitle_size = subtitle_size or round(height * 0.10)
    byline_size = byline_size or round(height * 0.045)
    regular_font_path = font_regular or (
        BUNDLED_REGULAR_FONT if Path(BUNDLED_REGULAR_FONT).exists() else font_bold
    )
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
        bg_focus_x=bg_focus_x,
        bg_focus_y=bg_focus_y,
        bg_zoom=bg_zoom,
    )

    top_y = round(height * 0.06)
    if badge:
        badge_font = resolve_font(font_bold, round(byline_size * 1.05))
        top_y = draw_badge(
            canvas,
            badge,
            badge_font,
            (margin, top_y),
            bg_color=hex_to_rgb(badge_color or brand_color),
        )
        top_y += round(byline_size * 0.5)

    if subtitle:
        lines = subtitle.split("\n")
        sub_font = resolve_font(regular_font_path, subtitle_size)
        draw_subtitle(
            canvas,
            lines,
            sub_font,
            margin_x=margin,
            top_y=top_y,
            line_gap=round(subtitle_size * 0.18),
            stroke_width=max(1, round(subtitle_size * 0.035)),
        )

    title_bottom_px = round(height * title_bottom_margin)
    if byline:
        byline_font = resolve_font(regular_font_path, byline_size)
        byline_ascent, byline_descent = byline_font.getmetrics()
        byline_baseline = height - title_bottom_px
        draw_outlined_text(
            canvas,
            (margin, byline_baseline),
            byline,
            byline_font,
            fill=(255, 255, 255),
            stroke_width=0,
            shadow_offset=(0, 4),
            shadow_blur=8,
            shadow_alpha=180,
            anchor="ls",
        )
        title_bottom_px += byline_ascent + byline_descent + round(byline_size * 0.6)

    if title_stroke_width is None:
        title_stroke_width = max(2, round(title_max_size * 0.025))
    title_lines = title.split("\n")
    title_max_height = height - top_y - title_bottom_px
    title_size = fit_title_size(
        font_bold,
        title_lines,
        max_width=width - 2 * margin,
        max_size=title_max_size,
        min_size=title_min_size,
        highlight=highlight,
        highlight_scale=highlight_scale,
        letter_spacing=title_letter_spacing,
        max_height=title_max_height,
    )
    draw_title(
        canvas,
        title_lines,
        font_bold,
        title_size,
        margin_x=margin,
        baseline_from_bottom=title_bottom_px,
        stroke_width=title_stroke_width,
        highlight=highlight,
        highlight_color=highlight_rgb,
        highlight_scale=highlight_scale,
        letter_spacing=title_letter_spacing,
        highlight_underline=highlight_underline,
        stroke_matches_fill=title_stroke_matches_fill,
    )

    canvas.convert("RGB").save(out_path, quality=95)


def _slugify(text: str) -> str:
    slug = re.sub(r"[\\/:*?\"<>|\n\r]+", " ", text).strip()
    return re.sub(r"\s+", " ", slug) or "thumbnail"


def export_to_obsidian(
    vault_path: str,
    image_path: str,
    title: str,
    subtitle: str | None = None,
    badge: str | None = None,
    byline: str | None = None,
    tags: list[str] | None = None,
    notes_folder: str = "Thumbnails",
    attachments_folder: str = "Attachments",
) -> Path:
    """Copy the generated image into an Obsidian vault and write a note that embeds it."""
    vault = Path(vault_path)
    if not vault.is_dir():
        raise FileNotFoundError(f"Obsidian vault not found: {vault}")

    attachments_dir = vault / attachments_folder
    notes_dir = vault / notes_folder
    attachments_dir.mkdir(parents=True, exist_ok=True)
    notes_dir.mkdir(parents=True, exist_ok=True)

    image_src = Path(image_path)
    image_dest = attachments_dir / image_src.name
    shutil.copy2(image_src, image_dest)

    note_path = notes_dir / f"{_slugify(title)}.md"
    frontmatter_tags = "\n".join(f"  - {t}" for t in tags) if tags else ""
    frontmatter = "\n".join(
        part
        for part in [
            "---",
            f'title: "{title}"',
            f"created: {date.today().isoformat()}",
            "tags:" if tags else None,
            frontmatter_tags if tags else None,
            "---",
        ]
        if part is not None
    )
    body_lines = [frontmatter, "", f"![[{image_dest.name}]]", ""]
    if badge:
        body_lines.append(f"**{badge}**")
    if subtitle:
        body_lines.append(subtitle.replace("\n", " "))
    if byline:
        body_lines.append(f"*{byline}*")
    note_path.write_text("\n".join(body_lines) + "\n", encoding="utf-8")
    return note_path


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
    parser.add_argument(
        "--highlight-underline",
        action="store_true",
        help="Draw a solid bar under each highlighted title run, in the highlight color.",
    )
    parser.add_argument(
        "--badge", default=None, help="Small pill label above the title, e.g. '창립 68주년 기념식'"
    )
    parser.add_argument(
        "--badge-color", default=None, help="Hex background color for --badge (defaults to --brand-color)"
    )
    parser.add_argument(
        "--byline", default=None, help="Small regular-weight caption under the title, e.g. '신창재 의장 메시지'"
    )
    parser.add_argument("--byline-size", type=int, default=None, help="Font size for --byline, in px")
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
    parser.add_argument(
        "--bg-focus-x",
        type=float,
        default=0.5,
        help="0-1: which part of the background photo survives the horizontal crop. "
        "0 pushes content toward the right edge, 1 toward the left edge, 0.5 is "
        "centered. Has no effect at --bg-zoom 1.0 if the photo is narrower than the "
        "canvas ratio (it already fills the width with nothing to crop horizontally) "
        "— raise --bg-zoom to unlock horizontal repositioning in that case.",
    )
    parser.add_argument(
        "--bg-zoom",
        type=float,
        default=1.0,
        help="Scales the background photo beyond the minimum needed to cover the "
        "canvas (>=1.0), creating slack for --bg-focus-x/--bg-focus-y to reposition "
        "within — e.g. 1.3 to shift a subject that a narrower photo has no room to "
        "move otherwise.",
    )
    parser.add_argument("--margin", type=int, default=None)
    parser.add_argument("--subtitle-size", type=int, default=None)
    parser.add_argument("--title-max-size", type=int, default=None)
    parser.add_argument("--title-min-size", type=int, default=None)
    parser.add_argument(
        "--obsidian-vault",
        default=None,
        help="Path to an Obsidian vault. When set, the generated image is copied into "
        "the vault and a note embedding it is created there.",
    )
    parser.add_argument(
        "--obsidian-notes-folder",
        default="Thumbnails",
        help="Subfolder (inside --obsidian-vault) to write the note into",
    )
    parser.add_argument(
        "--obsidian-attachments-folder",
        default="Attachments",
        help="Subfolder (inside --obsidian-vault) to copy the image into",
    )
    parser.add_argument(
        "--obsidian-tags",
        default=None,
        help="Comma-separated tags to add to the note's frontmatter, e.g. 'thumbnail,광화문글판'",
    )
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
            highlight_underline=args.highlight_underline,
            badge=args.badge,
            badge_color=args.badge_color,
            byline=args.byline,
            byline_size=args.byline_size,
            font_bold=args.font_bold,
            font_regular=args.font_regular,
            darken=args.darken,
            top_gradient_alpha=args.top_gradient_alpha,
            bottom_gradient_alpha=args.bottom_gradient_alpha,
            protect_highlights=args.protect_highlights,
            bg_focus_x=args.bg_focus_x,
            bg_focus_y=args.bg_focus_y,
            bg_zoom=args.bg_zoom,
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

    if args.obsidian_vault:
        try:
            note_path = export_to_obsidian(
                vault_path=args.obsidian_vault,
                image_path=args.out,
                title=args.title.replace("\\n", " "),
                subtitle=args.subtitle.replace("\\n", "\n") if args.subtitle else None,
                badge=args.badge,
                byline=args.byline,
                tags=[t.strip() for t in args.obsidian_tags.split(",") if t.strip()]
                if args.obsidian_tags
                else None,
                notes_folder=args.obsidian_notes_folder,
                attachments_folder=args.obsidian_attachments_folder,
            )
        except FileNotFoundError as e:
            print(f"error: {e}", file=sys.stderr)
            return 1
        print(f"obsidian note: {note_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
