import { ContentItem } from "@/lib/types";
import { priorityIndex } from "@/lib/diagnosis";
import DiagnosisBadge from "@/components/DiagnosisBadge";

export default function PriorityActions({
  contents,
  onSelect,
}: {
  contents: ContentItem[];
  onSelect: (item: ContentItem) => void;
}) {
  const items = [...contents]
    .sort((a, b) => priorityIndex(a.diagnosis) - priorityIndex(b.diagnosis))
    .slice(0, 5);

  return (
    <section aria-label="우선 행동" className="rounded-card border border-border bg-surface p-4 shadow-sm sm:p-5">
      <h2 className="text-base font-bold text-ink">이번 주 우선 행동</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">표시할 우선 행동이 없습니다.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="flex w-full flex-col gap-1.5 rounded-lg border border-border bg-background px-3 py-2.5 text-left transition-colors hover:border-primary sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <DiagnosisBadge diagnosis={item.diagnosis} />
                  <span className="truncate text-sm font-medium text-ink">{item.title}</span>
                </div>
                <span className="text-sm text-muted sm:max-w-[45%] sm:text-right">
                  {item.recommendedAction}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
