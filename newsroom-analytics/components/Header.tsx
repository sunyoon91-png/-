import { formatDate } from "@/lib/format";

export default function Header({ updatedAt }: { updatedAt: string }) {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink sm:text-2xl">뉴스룸 성과분석</h1>
            <p className="mt-1 text-sm text-muted">
              콘텐츠 성과를 확인하고 다음 행동으로 연결합니다.
            </p>
          </div>
          <p className="text-sm text-muted">
            데이터 기준 <span className="font-medium text-ink">{formatDate(updatedAt)}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
