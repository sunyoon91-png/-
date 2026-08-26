"use client";

import { useRef } from "react";
import { Card, Label } from "./ui";
import { ImageTransform, ZOOM_MAX, ZOOM_MIN } from "@/lib/types";

interface ImageControlsProps {
  hasImage: boolean;
  imageTransform: ImageTransform;
  onUpload: (file: File) => void;
  onZoomChange: (zoomPercent: number) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ImageControls({
  hasImage,
  imageTransform,
  onUpload,
  onZoomChange,
}: ImageControlsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert("JPG, PNG, WEBP 파일만 업로드할 수 있습니다.");
      return;
    }
    onUpload(file);
    e.target.value = "";
  }

  return (
    <Card title="이미지 업로드">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-sm text-gray-500 hover:bg-gray-100"
      >
        {hasImage ? "다른 사진으로 교체" : "클릭하여 사진 업로드 (JPG, PNG, WEBP)"}
      </button>

      {hasImage && (
        <div>
          <Label>사진 확대 ({Math.round(imageTransform.zoomPercent)}%)</Label>
          <input
            type="range"
            min={ZOOM_MIN}
            max={ZOOM_MAX}
            value={imageTransform.zoomPercent}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>{ZOOM_MIN}% (채우기)</span>
            <span>{ZOOM_MAX}%</span>
          </div>
        </div>
      )}
    </Card>
  );
}
