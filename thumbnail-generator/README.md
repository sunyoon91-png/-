# Thumbnail Generator

Reproduces a fixed thumbnail style from any background photo + title text:

- 740x400px canvas (configurable)
- Background photo cover-cropped and darkened
- Dark radial gradient anchored top-left (seats the small caption)
- Dark linear gradient rising from the bottom (seats the big title)
- Small bold caption block, top-left, white with black outline + drop shadow
- Large bold title, bottom-left, white with black outline + drop shadow,
  auto-shrunk to fit the canvas width
- Optional keyword inside the title rendered in the brand color (`#0E9B49` by default)

## Setup

```bash
pip install -r requirements.txt
```

### Font

No font is bundled. Install a bold Korean-capable font (Pretendard, Noto Sans KR,
NanumSquareRound, Malgun Gothic, etc.) and either:

- place it at one of the paths in `FONT_SEARCH_PATHS` in `thumbnail_generator.py`, or
- pass it explicitly with `--font-bold /path/to/font.otf`

## Usage

```bash
python thumbnail_generator.py \
  --bg background.jpg \
  --title "생명보험의 가치" \
  --subtitle "마라톤과\n꼬옥이가\n전하는" \
  --highlight "의" \
  --font-bold /path/to/Pretendard-Bold.otf \
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
| `--highlight` | none | Substring of `--title` to color with the brand color |
| `--brand-color` | `#0E9B49` | Hex color for the highlighted keyword |
| `--out` | `thumbnail.png` | Output file path |
| `--width` / `--height` | `740` / `400` | Canvas size |
| `--font-bold` | auto-detected | Font for title (and caption, unless `--font-regular` set) |
| `--font-regular` | = `--font-bold` | Font for the caption only |
| `--darken` | `0.55` | Background brightness multiplier (0-1, lower = darker) |
| `--top-gradient-alpha` | `190` | Strength of the top-left dark pocket (0-255) |
| `--bottom-gradient-alpha` | `215` | Strength of the bottom dark rise (0-255) |
| `--margin` | 5% of width | Left margin shared by caption and title |
| `--subtitle-size` / `--title-max-size` / `--title-min-size` | scaled to height | Font sizes in px |

## Reusing the style programmatically

```python
from thumbnail_generator import generate_thumbnail

generate_thumbnail(
    bg_path="background.jpg",
    title="생명보험의 가치",
    subtitle="마라톤과\n꼬옥이가\n전하는",
    highlight="의",
    font_bold="/path/to/Pretendard-Bold.otf",
    out_path="thumbnail.png",
)
```
