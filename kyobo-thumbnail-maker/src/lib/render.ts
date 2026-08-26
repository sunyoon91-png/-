import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GradientMode,
  ImageTransform,
  PositionPreset,
  SAFE_MARGIN,
  TextAlign,
  ThumbnailState,
} from "./types";

const TITLE_LINE_HEIGHT_RATIO = 1.12;
const TITLE_SUBTITLE_GAP = 18;
const DIVIDER_GAP_TOP = 14;
const DIVIDER_GAP_BOTTOM = 14;
const DIVIDER_WIDTH = 190;
const DIVIDER_HEIGHT = 2;

const FONT_STACK = "Pretendard, Arial, sans-serif";

interface DrawRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The minimum scale at which the photo fully covers the canvas with no gaps. */
export function getBaseScale(
  naturalWidth: number,
  naturalHeight: number,
  canvasW: number = CANVAS_WIDTH,
  canvasH: number = CANVAS_HEIGHT
): number {
  return Math.max(canvasW / naturalWidth, canvasH / naturalHeight);
}

export function getImageDrawRect(
  naturalWidth: number,
  naturalHeight: number,
  transform: ImageTransform,
  canvasW: number = CANVAS_WIDTH,
  canvasH: number = CANVAS_HEIGHT
): DrawRect {
  const base = getBaseScale(naturalWidth, naturalHeight, canvasW, canvasH);
  const scale = base * (transform.zoomPercent / 100);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const x = (canvasW - width) / 2 + transform.panX;
  const y = (canvasH - height) / 2 + transform.panY;
  return { x, y, width, height };
}

/** Clamps pan so the photo always fully covers the canvas (no empty edges). */
export function clampPan(
  naturalWidth: number,
  naturalHeight: number,
  zoomPercent: number,
  panX: number,
  panY: number,
  canvasW: number = CANVAS_WIDTH,
  canvasH: number = CANVAS_HEIGHT
): { panX: number; panY: number } {
  const base = getBaseScale(naturalWidth, naturalHeight, canvasW, canvasH);
  const scale = base * (zoomPercent / 100);
  const width = naturalWidth * scale;
  const height = naturalHeight * scale;
  const maxPanX = Math.max(0, (width - canvasW) / 2);
  const maxPanY = Math.max(0, (height - canvasH) / 2);
  return {
    panX: Math.min(maxPanX, Math.max(-maxPanX, panX)),
    panY: Math.min(maxPanY, Math.max(-maxPanY, panY)),
  };
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  mode: GradientMode,
  strengthPercent: number,
  w: number,
  h: number
) {
  if (mode === "none" || strengthPercent <= 0) return;
  const alpha = Math.min(0.8, Math.max(0, strengthPercent / 100));

  if (mode === "left" || mode === "left-bottom") {
    const g = ctx.createLinearGradient(0, 0, w * 0.68, 0);
    g.addColorStop(0, `rgba(0,0,0,${alpha})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  if (mode === "bottom" || mode === "left-bottom") {
    const g = ctx.createLinearGradient(0, h * 0.32, 0, h);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(1, `rgba(0,0,0,${alpha})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
}

interface TextSegment {
  text: string;
  isHighlight: boolean;
}

function splitLineWithHighlight(line: string, highlightPart: string): TextSegment[] {
  if (!highlightPart) return [{ text: line, isHighlight: false }];
  const idx = line.indexOf(highlightPart);
  if (idx === -1) return [{ text: line, isHighlight: false }];
  const segments: TextSegment[] = [];
  if (idx > 0) segments.push({ text: line.slice(0, idx), isHighlight: false });
  segments.push({ text: line.slice(idx, idx + highlightPart.length), isHighlight: true });
  if (idx + highlightPart.length < line.length) {
    segments.push({ text: line.slice(idx + highlightPart.length), isHighlight: false });
  }
  return segments;
}

function computeLineSegments(titleLines: string[], highlight: string): TextSegment[][] {
  const trimmed = highlight.trim();
  if (!trimmed) {
    return titleLines.map((line) => [{ text: line, isHighlight: false }]);
  }
  const highlightLines = trimmed.split("\n");
  if (highlightLines.length > 1) {
    return titleLines.map((line, i) => {
      const part = highlightLines[i]?.trim();
      if (!part) return [{ text: line, isHighlight: false }];
      return splitLineWithHighlight(line, part);
    });
  }
  return titleLines.map((line) => splitLineWithHighlight(line, trimmed));
}

function drawAlignedLine(
  ctx: CanvasRenderingContext2D,
  segments: TextSegment[],
  anchorX: number,
  y: number,
  align: TextAlign,
  defaultColor: string,
  highlightColor: string
): number {
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const widths = segments.map((seg) => ctx.measureText(seg.text).width);
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  let startX = anchorX;
  if (align === "center") startX = anchorX - totalWidth / 2;
  else if (align === "right") startX = anchorX - totalWidth;

  let x = startX;
  segments.forEach((seg, i) => {
    ctx.fillStyle = seg.isHighlight ? highlightColor : defaultColor;
    ctx.fillText(seg.text, x, y);
    x += widths[i];
  });
  return totalWidth;
}

function drawDivider(
  ctx: CanvasRenderingContext2D,
  anchorX: number,
  y: number,
  align: TextAlign
) {
  let x0: number;
  if (align === "left") x0 = anchorX;
  else if (align === "center") x0 = anchorX - DIVIDER_WIDTH / 2;
  else x0 = anchorX - DIVIDER_WIDTH;

  ctx.save();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillRect(x0, y, DIVIDER_WIDTH, DIVIDER_HEIGHT);
  ctx.restore();
}

function getAnchorFromPreset(preset: PositionPreset): {
  horizontal: "left" | "center";
  vertical: "top" | "center" | "bottom";
} {
  switch (preset) {
    case "top-left":
      return { horizontal: "left", vertical: "top" };
    case "center-left":
      return { horizontal: "left", vertical: "center" };
    case "bottom-left":
      return { horizontal: "left", vertical: "bottom" };
    case "center":
      return { horizontal: "center", vertical: "center" };
    case "bottom-center":
      return { horizontal: "center", vertical: "bottom" };
  }
}

function drawTextBlock(
  ctx: CanvasRenderingContext2D,
  state: ThumbnailState,
  w: number,
  h: number
) {
  const hasTitle = state.title.trim().length > 0;
  const hasSubtitle = state.subtitle.trim().length > 0;
  if (!hasTitle && !hasSubtitle) return;

  const titleLines = hasTitle ? state.title.split("\n") : [];
  const titleFont = `900 ${state.titleFontSize}px ${FONT_STACK}`;
  const subtitleFont = `600 ${state.subtitleFontSize}px ${FONT_STACK}`;
  const lineHeightPx = Math.round(state.titleFontSize * TITLE_LINE_HEIGHT_RATIO);

  ctx.font = titleFont;
  const lineSegments = computeLineSegments(titleLines, state.highlight);

  let blockHeight = 0;
  if (hasTitle) blockHeight += titleLines.length * lineHeightPx;
  if (hasSubtitle) {
    if (hasTitle) blockHeight += TITLE_SUBTITLE_GAP;
    if (state.showDivider) blockHeight += DIVIDER_GAP_TOP + DIVIDER_HEIGHT + DIVIDER_GAP_BOTTOM;
    blockHeight += Math.round(state.subtitleFontSize * 1.3);
  }

  const { horizontal, vertical } = getAnchorFromPreset(state.positionPreset);
  const anchorX = (horizontal === "left" ? SAFE_MARGIN : w / 2) + state.offsetX;

  let anchorY: number;
  if (vertical === "top") anchorY = SAFE_MARGIN + 4;
  else if (vertical === "center") anchorY = h / 2;
  else anchorY = h - SAFE_MARGIN;
  anchorY += state.offsetY;

  let top: number;
  if (vertical === "top") top = anchorY;
  else if (vertical === "center") top = anchorY - blockHeight / 2;
  else top = anchorY - blockHeight;

  let cursorY = top;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 1;

  if (hasTitle) {
    ctx.font = titleFont;
    titleLines.forEach((_, i) => {
      drawAlignedLine(ctx, lineSegments[i], anchorX, cursorY, state.textAlign, "#ffffff", state.highlightColor);
      cursorY += lineHeightPx;
    });
  }

  if (hasSubtitle) {
    if (hasTitle) cursorY += TITLE_SUBTITLE_GAP;
    if (state.showDivider) {
      cursorY += DIVIDER_GAP_TOP;
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      drawDivider(ctx, anchorX, cursorY, state.textAlign);
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 4;
      cursorY += DIVIDER_HEIGHT + DIVIDER_GAP_BOTTOM;
    }
    ctx.font = subtitleFont;
    drawAlignedLine(
      ctx,
      [{ text: state.subtitle, isHighlight: false }],
      anchorX,
      cursorY,
      state.textAlign,
      "#ffffff",
      state.highlightColor
    );
  }

  ctx.restore();
}

/**
 * Single source of truth for rendering the thumbnail. Used identically by
 * the live preview and by JPG/PNG export so the two can never diverge.
 */
export function drawThumbnail(
  ctx: CanvasRenderingContext2D,
  state: ThumbnailState,
  image: HTMLImageElement | null
) {
  const w = CANVAS_WIDTH;
  const h = CANVAS_HEIGHT;

  ctx.save();
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = "#d9dde3";
  ctx.fillRect(0, 0, w, h);

  if (image) {
    const rect = getImageDrawRect(image.naturalWidth, image.naturalHeight, state.imageTransform, w, h);
    ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  }

  drawGradient(ctx, state.gradientMode, state.gradientStrength, w, h);
  drawTextBlock(ctx, state, w, h);

  ctx.restore();
}
