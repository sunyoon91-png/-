"use client";

import ImageControls from "./ImageControls";
import TypographyControls from "./TypographyControls";
import GradientControls from "./GradientControls";
import ExportControls from "./ExportControls";
import { ThumbnailState } from "@/lib/types";

interface ControlPanelProps {
  state: ThumbnailState;
  patch: (partial: Partial<ThumbnailState>) => void;
  hasImage: boolean;
  mainCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onUpload: (file: File) => void;
  onZoomChange: (zoomPercent: number) => void;
  onReset: () => void;
}

export default function ControlPanel({
  state,
  patch,
  hasImage,
  mainCanvasRef,
  onUpload,
  onZoomChange,
  onReset,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <ImageControls
        hasImage={hasImage}
        imageTransform={state.imageTransform}
        onUpload={onUpload}
        onZoomChange={onZoomChange}
      />
      <TypographyControls state={state} patch={patch} />
      <GradientControls state={state} patch={patch} />
      <ExportControls
        title={state.title}
        hasImage={hasImage}
        mainCanvasRef={mainCanvasRef}
        onReset={onReset}
      />
    </div>
  );
}
