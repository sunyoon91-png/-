"use client";

import { Card, Label, SegmentedControl } from "./ui";
import { GradientMode, ThumbnailState } from "@/lib/types";

interface GradientControlsProps {
  state: ThumbnailState;
  patch: (partial: Partial<ThumbnailState>) => void;
}

const GRADIENT_OPTIONS: { value: GradientMode; label: string }[] = [
  { value: "none", label: "없음" },
  { value: "left", label: "LEFT" },
  { value: "bottom", label: "BOTTOM" },
  { value: "left-bottom", label: "LEFT + BOTTOM" },
];

export default function GradientControls({ state, patch }: GradientControlsProps) {
  return (
    <Card title="그라데이션">
      <SegmentedControl value={state.gradientMode} options={GRADIENT_OPTIONS} onChange={(v) => patch({ gradientMode: v })} />
      <div>
        <Label>강도 ({state.gradientStrength}%)</Label>
        <input
          type="range"
          min={0}
          max={80}
          value={state.gradientStrength}
          onChange={(e) => patch({ gradientStrength: Number(e.target.value) })}
          disabled={state.gradientMode === "none"}
          className="w-full accent-emerald-600 disabled:opacity-40"
        />
      </div>
    </Card>
  );
}
