# Thumbnail Generator

Reproduces a fixed thumbnail style from any background photo + title text:

- 740x400px canvas (configurable)
- Background photo cover-cropped and darkened, with already-bright subjects
  (a white sign, a spotlit face) optionally shielded from the darkening
- Dark radial gradient anchored top-left (seats the small caption)
- Dark linear gradient rising from the bottom (seats the big title)
- Small bold caption block, top-left, white with black outline + drop shadow
- Large title, bottom-left, tight tracking + thin black outline + a dense
  drop shadow, auto-shrunk to fit the canvas width
- Optional keyword inside the title rendered in its own color and size (brand
  color / `#0E9B49` and 1x by default), sharing a baseline with the rest of the title

## Setup

```bash
pip install -r requirements.txt
```

### Font

Pretendard Black ships in `fonts/Pretendard-Black.otf` and is used automatically —
no `--font-bold` needed (Pretendard Bold is also bundled as a fallback). Pass
`--font-bold /path/to/font.otf` to use a different Korean-capable font (Noto
Sans KR, NanumSquareRound, Malgun Gothic, etc.) instead — note the default
`--title-letter-spacing` (-3%) was tuned for Black's especially thick strokes,
so loosen it back toward 0 for a lighter-weight font.

## Usage

```bash
python thumbnail_generator.py \
  --bg background.jpg \
  --title "생명보험의 가치" \
  --subtitle "마라톤과\n꼬옥이가\n전하는" \
  --highlight "의" \
  --out thumbnail.png
```

Only `--bg` and `--title` are required — everything else has defaults matching
the reference style (740x400, `#0E9B49` brand color).

## Options

| Flag | Default | Description |
|---|---|---|
| `--bg` | (required) | Background image path |
| `--title` | (required) | Large bottom title |
| `--subtitle` | none | Small top-left caption; `\n` for line breaks |
| `--highlight` | none | Substring of `--title` to color/size differently |
| `--highlight-color` | = `--brand-color` | Hex color for the highlighted run |
| `--highlight-scale` | `1.0` | Font-size multiplier for the highlighted run, e.g. `1.35` |
| `--brand-color` | `#0E9B49` | Fallback hex color for `--highlight` when `--highlight-color` isn't set |
| `--out` | `thumbnail.png` | Output file path |
| `--width` / `--height` | `740` / `400` | Canvas size |
| `--font-bold` | bundled Pretendard | Font for title (and caption, unless `--font-regular` set) |
| `--font-regular` | = `--font-bold` | Font for the caption only |
| `--darken` | `0.78` | Background brightness multiplier (0-1, lower = darker) |
| `--top-gradient-alpha` | `130` | Strength of the top-left dark pocket (0-255) |
| `--bottom-gradient-alpha` | `165` | Strength of the bottom dark rise (0-255) |
| `--protect-highlights` | `0.0` | 0-1: shield already-bright areas (a white sign, a spotlit subject) from the darkening overlays, e.g. `0.6` |
| `--title-letter-spacing` | `-0.03` | Title tracking, as a fraction of glyph width. Pretendard Black starts overlapping past roughly `-0.04` |
| `--title-stroke-width` | thin, auto-sized | Title outline thickness in px; `0` disables it (shadow-only look) |
| `--title-stroke-matches-fill` | off | Outline color matches each segment's fill instead of black — fattens the glyphs (faux-bold) without a visible outline |
| `--margin` | 5% of width | Left margin shared by caption and title |
| `--subtitle-size` / `--title-max-size` / `--title-min-size` | scaled to height | Font sizes in px |

## Obsidian integration

Pass `--obsidian-vault` to also copy the generated image into an Obsidian
vault and create a note that embeds it (`![[image.png]]`), with title, tags,
and any `--badge`/`--subtitle`/`--byline` you passed written into the note's
frontmatter and body. The vault must be a folder already on this machine's
filesystem (e.g. an iCloud/Dropbox/git-synced vault, or one reachable over a
mounted network share) — Obsidian itself just watches that folder.

```bash
python thumbnail_generator.py \
  --bg background.jpg \
  --title "생명보험의 가치" \
  --out thumbnail.png \
  --obsidian-vault "/path/to/MyVault" \
  --obsidian-tags "thumbnail,광화문글판"
```

| Flag | Default | Description |
|---|---|---|
| `--obsidian-vault` | none | Path to the vault; enables the export |
| `--obsidian-notes-folder` | `Thumbnails` | Subfolder for the generated note |
| `--obsidian-attachments-folder` | `Attachments` | Subfolder for the copied image |
| `--obsidian-tags` | none | Comma-separated tags for the note's frontmatter |

## Reusing the style programmatically

```python
from thumbnail_generator import generate_thumbnail

generate_thumbnail(
    bg_path="background.jpg",
    title="생명보험의 가치",
    subtitle="마라톤과\n꼬옥이가\n전하는",
    highlight="의",
    out_path="thumbnail.png",
)
```
