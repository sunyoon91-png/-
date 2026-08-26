"use client";

import { Card, Label, SegmentedControl } from "./ui";
import { PositionPreset, TextAlign, ThumbnailState } from "@/lib/types";

interface TypographyControlsProps {
  state: ThumbnailState;
  patch: (partial: Partial<ThumbnailState>) => void;
}

const POSITION_OPTIONS: { value: PositionPreset; label: string }[] = [
  { value: "top-left", label: "왼쪽 상단" },
  { value: "center-left", label: "왼쪽 중앙" },
  { value: "bottom-left", label: "왼쪽 하단" },
  { value: "center", label: "중앙" },
  { value: "bottom-center", label: "중앙 하단" },
];

const ALIGN_OPTIONS: { value: TextAlign; label: string }[] = [
  { value: "left", label: "좌측 정렬" },
  { value: "center", label: "중앙 정렬" },
  { value: "right", label: "우측 정렬" },
];

export default function TypographyControls({ state, patch }: TypographyControlsProps) {
  function handlePositionChange(preset: PositionPreset) {
    const centered = preset === "center" || preset === "bottom-center";
    patch({ positionPreset: preset, textAlign: centered ? "center" : "left" });
  }

  return (
    <>
      <Card title="제목">
        <textarea
          value={state.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder={"금싸라기 땅에\n국민책방을, 교보문고"}
          rows={3}
          className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <p className="text-[11px] text-gray-400">
          입력한 줄바꿈이 그대로 표시됩니다. (Enter로 줄바꿈)
        </p>

        <div>
          <Label>강조 문구 (제목 중 색을 강조할 부분)</Label>
          <input
            type="text"
            value={state.highlight}
            onChange={(e) => patch({ highlight: e.target.value })}
            placeholder="국민책방을, 교보문고"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <Label>강조색</Label>
          <input
            type="color"
            value={state.highlightColor}
            onChange={(e) => patch({ highlightColor: e.target.value })}
            className="h-8 w-12 cursor-pointer rounded border border-gray-200"
          />
          <span className="text-xs text-gray-400">{state.highlightColor}</span>
        </div>

        <div>
          <Label>제목 폰트 크기 ({state.titleFontSize}px)</Label>
          <input
            type="range"
            min={32}
            max={70}
            value={state.titleFontSize}
            onChange={(e) => patch({ titleFontSize: Number(e.target.value) })}
            className="w-full accent-emerald-600"
          />
        </div>
      </Card>

      <Card title="부제">
        <input
          type="text"
          value={state.subtitle}
          onChange={(e) => patch({ subtitle: e.target.value })}
          placeholder="17층짜리 건물이 될 뻔했던 교보빌딩 이야기"
          className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={state.showDivider}
            onChange={(e) => patch({ showDivider: e.target.checked })}
            className="accent-emerald-600"
          />
          구분선 표시
        </label>
      </Card>

      <Card title="정렬 및 위치">
        <div>
          <Label>텍스트 정렬</Label>
          <SegmentedControl value={state.textAlign} options={ALIGN_OPTIONS} onChange={(v) => patch({ textAlign: v })} />
        </div>
        <div>
          <Label>텍스트 위치</Label>
          <SegmentedControl value={state.positionPreset} options={POSITION_OPTIONS} onChange={handlePositionChange} />
        </div>
      </Card>
    </>
  );
}
