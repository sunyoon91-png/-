export const CANVAS_WIDTH = 740;
export const CANVAS_HEIGHT = 400;
export const PREVIEW_SCALE_WIDTH = 370;
export const PREVIEW_SCALE_HEIGHT = 200;
export const SAFE_MARGIN = 32;

/**
 * Zoom is expressed as a percentage of the "cover" scale (the minimum scale
 * that fills the 740x400 canvas with no empty space for the current photo).
 * 100% therefore always means "fits with no gaps" regardless of the photo's
 * own aspect ratio, and the range only ever zooms further in, so the canvas
 * can never show empty space.
 */
export const ZOOM_MIN = 100;
export const ZOOM_MAX = 220;

export type PositionPreset =
  | "top-left"
  | "center-left"
  | "bottom-left"
  | "center"
  | "bottom-center";

export type TextAlign = "left" | "center" | "right";

export type GradientMode = "none" | "left" | "bottom" | "left-bottom";

export interface ImageTransform {
  /** zoom relative to the base "cover" scale, 100 = exactly fills the canvas */
  zoomPercent: number;
  /** pan offset in canvas px, relative to centered position */
  panX: number;
  panY: number;
}

export interface UploadedImage {
  element: HTMLImageElement;
  naturalWidth: number;
  naturalHeight: number;
}

export interface ThumbnailState {
  title: string;
  highlight: string;
  subtitle: string;
  showDivider: boolean;

  titleFontSize: number;
  subtitleFontSize: number;
  highlightColor: string;
  textAlign: TextAlign;
  positionPreset: PositionPreset;
  offsetX: number;
  offsetY: number;

  gradientMode: GradientMode;
  gradientStrength: number;

  imageTransform: ImageTransform;
}

export const DEFAULT_STATE: ThumbnailState = {
  title: "",
  highlight: "",
  subtitle: "",
  showDivider: true,

  titleFontSize: 46,
  subtitleFontSize: 20,
  highlightColor: "#55C878",
  textAlign: "left",
  positionPreset: "center-left",
  offsetX: 0,
  offsetY: 0,

  gradientMode: "left-bottom",
  gradientStrength: 40,

  imageTransform: {
    zoomPercent: 100,
    panX: 0,
    panY: 0,
  },
};
