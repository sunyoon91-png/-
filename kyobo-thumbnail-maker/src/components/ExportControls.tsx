"use client";

import { useState } from "react";
import { Card } from "./ui";
import { buildExportFilename } from "@/lib/filename";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "@/lib/types";

interface ExportControlsProps {
  title: string;
  hasImage: boolean;
  mainCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onReset: () => void;
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string, type: string, quality?: number) {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    type,
    quality
  );
}

export default function ExportControls({ title, hasImage, mainCanvasRef, onReset }: ExportControlsProps) {
  const [exporting, setExporting] = useState<"jpg" | "png" | null>(null);

  function exportImage(format: "jpg" | "png") {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    if (canvas.width !== CANVAS_WIDTH || canvas.height !== CANVAS_HEIGHT) return;

    setExporting(format);
    const filename = buildExportFilename(title, format);
    if (format === "jpg") {
      downloadCanvas(canvas, filename, "image/jpeg", 0.92);
    } else {
      downloadCanvas(canvas, filename, "image/png");
    }
    setTimeout(() => setExporting(null), 400);
  }

  function handleReset() {
    if (confirm("모든 이미지와 텍스트, 설정이 초기화됩니다. 계속할까요?")) {
      onReset();
    }
  }

  return (
    <Card title="내보내기">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => exportImage("jpg")}
          disabled={!hasImage || exporting !== null}
          className="rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {exporting === "jpg" ? "저장 중..." : "JPG 저장"}
        </button>
        <button
          type="button"
          onClick={() => exportImage("png")}
          disabled={!hasImage || exporting !== null}
          className="rounded-md border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {exporting === "png" ? "저장 중..." : "PNG 저장"}
        </button>
      </div>
      {!hasImage && (
        <p className="text-[11px] text-gray-400">사진을 업로드하면 저장할 수 있습니다.</p>
      )}
      <button
        type="button"
        onClick={handleReset}
        className="mt-1 rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
      >
        초기화
      </button>
    </Card>
  );
}
