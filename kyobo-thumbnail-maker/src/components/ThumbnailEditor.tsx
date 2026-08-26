"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ControlPanel from "./ControlPanel";
import CanvasPreview from "./CanvasPreview";
import { clampPan } from "@/lib/render";
import { ensurePretendardLoaded } from "@/lib/fonts";
import { DEFAULT_STATE, ThumbnailState } from "@/lib/types";

export default function ThumbnailEditor() {
  const [state, setState] = useState<ThumbnailState>(DEFAULT_STATE);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fontsReady, setFontsReady] = useState(false);
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    ensurePretendardLoaded().then(() => setFontsReady(true));
  }, []);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const patch = useCallback((partial: Partial<ThumbnailState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  function handleUpload(file: File) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
      setImage(img);
      setState((prev) => ({
        ...prev,
        imageTransform: { zoomPercent: 100, panX: 0, panY: 0 },
      }));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      alert("이미지를 불러올 수 없습니다. 다른 파일을 시도해주세요.");
    };
    img.src = url;
  }

  function handleZoomChange(zoomPercent: number) {
    setState((prev) => {
      if (!image) {
        return { ...prev, imageTransform: { ...prev.imageTransform, zoomPercent } };
      }
      const clamped = clampPan(
        image.naturalWidth,
        image.naturalHeight,
        zoomPercent,
        prev.imageTransform.panX,
        prev.imageTransform.panY
      );
      return {
        ...prev,
        imageTransform: { zoomPercent, panX: clamped.panX, panY: clamped.panY },
      };
    });
  }

  function handlePanChange(panX: number, panY: number) {
    setState((prev) => ({ ...prev, imageTransform: { ...prev.imageTransform, panX, panY } }));
  }

  function handleReset() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImage(null);
    setState(DEFAULT_STATE);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start">
      <div className="w-full lg:w-[380px] lg:shrink-0">
        <ControlPanel
          state={state}
          patch={patch}
          hasImage={image !== null}
          mainCanvasRef={mainCanvasRef}
          onUpload={handleUpload}
          onZoomChange={handleZoomChange}
          onReset={handleReset}
        />
      </div>
      <div className="flex-1">
        <CanvasPreview
          state={state}
          image={image}
          fontsReady={fontsReady}
          mainCanvasRef={mainCanvasRef}
          onPanChange={handlePanChange}
        />
      </div>
    </div>
  );
}
