"use client";

import { useEffect, useRef, useState } from "react";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PREVIEW_SCALE_HEIGHT,
  PREVIEW_SCALE_WIDTH,
  ThumbnailState,
} from "@/lib/types";
import { clampPan, drawThumbnail } from "@/lib/render";

interface CanvasPreviewProps {
  state: ThumbnailState;
  image: HTMLImageElement | null;
  fontsReady: boolean;
  mainCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPanChange: (panX: number, panY: number) => void;
}

export default function CanvasPreview({
  state,
  image,
  fontsReady,
  mainCanvasRef,
  onPanChange,
}: CanvasPreviewProps) {
  const smallCanvasRef = useRef<HTMLCanvasElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ clientX: 0, clientY: 0, panX: 0, panY: 0 });

  useEffect(() => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawThumbnail(ctx, state, image);

    const smallCanvas = smallCanvasRef.current;
    if (smallCanvas) {
      const smallCtx = smallCanvas.getContext("2d");
      if (smallCtx) {
        smallCtx.imageSmoothingEnabled = true;
        smallCtx.imageSmoothingQuality = "high";
        smallCtx.clearRect(0, 0, PREVIEW_SCALE_WIDTH, PREVIEW_SCALE_HEIGHT);
        smallCtx.drawImage(
          canvas,
          0,
          0,
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
          0,
          0,
          PREVIEW_SCALE_WIDTH,
          PREVIEW_SCALE_HEIGHT
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, image, fontsReady]);

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!image) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: state.imageTransform.panX,
      panY: state.imageTransform.panY,
    };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging || !image) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleFactor = CANVAS_WIDTH / rect.width;

    const dx = (e.clientX - dragStart.current.clientX) * scaleFactor;
    const dy = (e.clientY - dragStart.current.clientY) * scaleFactor;

    const clamped = clampPan(
      image.naturalWidth,
      image.naturalHeight,
      state.imageTransform.zoomPercent,
      dragStart.current.panX + dx,
      dragStart.current.panY + dy
    );
    onPanChange(clamped.panX, clamped.panY);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = mainCanvasRef.current;
    if (canvas) canvas.releasePointerCapture(e.pointerId);
    setDragging(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-gray-700">
            실제 미리보기 (740 × 400)
          </h2>
        </div>
        <canvas
          ref={mainCanvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full max-w-[740px] rounded-md border border-gray-200 shadow-sm"
          style={{
            aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
            cursor: image ? (dragging ? "grabbing" : "grab") : "default",
            touchAction: "none",
          }}
        />
        {image && (
          <p className="mt-1 text-xs text-gray-400">
            사진을 드래그하여 위치를 조절할 수 있습니다.
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-700">
          목록 축소 미리보기 (370 × 200)
        </h2>
        <canvas
          ref={smallCanvasRef}
          width={PREVIEW_SCALE_WIDTH}
          height={PREVIEW_SCALE_HEIGHT}
          className="w-full max-w-[370px] rounded-md border border-gray-200 shadow-sm"
          style={{ aspectRatio: `${PREVIEW_SCALE_WIDTH} / ${PREVIEW_SCALE_HEIGHT}` }}
        />
      </div>
    </div>
  );
}
