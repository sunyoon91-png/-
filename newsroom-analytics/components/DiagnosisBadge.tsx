import { DiagnosisCode, DIAGNOSIS_META } from "@/lib/types";

const COLOR_CLASSES: Record<string, string> = {
  green: "bg-positive/10 text-positive",
  red: "bg-negative/10 text-negative",
  orange: "bg-warning/10 text-warning",
  gray: "bg-neutral/10 text-neutral",
  blue: "bg-primary/10 text-primary",
};

export default function DiagnosisBadge({ diagnosis }: { diagnosis: DiagnosisCode }) {
  const meta = DIAGNOSIS_META[diagnosis];
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLOR_CLASSES[meta.color]}`}
    >
      {meta.label}
    </span>
  );
}
