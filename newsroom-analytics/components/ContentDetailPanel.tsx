"use client";

import { X } from "lucide-react";
import { ContentItem } from "@/lib/types";
import {
  formatChange,
  formatDate,
  formatDuration,
  formatNumber,
  formatPercentage,
  formatRank,
} from "@/lib/format";
import DiagnosisBadge from "@/components/DiagnosisBadge";

function DetailStat({ label, value, change }: { label: string; value: string; change?: number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-base font-bold text-ink">{value}</p>
      {change !== undefined && (
        <p
          className={`mt-0.5 text-xs font-medium ${
            formatChange(change).direction === "flat"
              ? "text-neutral"
              : formatChange(change).isPositive
              ? "text-positive"
              : "text-negative"
          }`}
        >
          {formatChange(change).direction === "up" ? "▲" : formatChange(change).direction === "down" ? "▼" : "-"}{" "}
          {formatChange(change).text}
        </p>
      )}
    </div>
  );
}

export default function ContentDetailPanel({
  item,
  onClose,
}: {
  item: ContentItem | null;
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-panel-title"
        className="h-full w-full max-w-md overflow-y-auto bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <DiagnosisBadge diagnosis={item.diagnosis} />
            <h2 id="detail-panel-title" className="mt-2 text-lg font-bold text-ink">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {formatDate(item.publishedAt)} · {item.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="상세 패널 닫기"
            className="shrink-0 rounded-full p-1.5 text-muted hover:bg-background hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-background p-3 text-sm text-ink">
          {item.recommendedAction}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <DetailStat label="조회수" value={formatNumber(item.pageViews)} change={item.pageViewsChange} />
          <DetailStat label="검색 유입" value={formatNumber(item.searchVisits)} change={item.searchVisitsChange} />
          <DetailStat label="검색 노출" value={formatNumber(item.searchImpressions)} />
          <DetailStat label="검색 CTR" value={formatPercentage(item.searchCtr)} />
          <DetailStat label="평균 순위" value={formatRank(item.averageRank)} />
          <DetailStat label="체류시간" value={formatDuration(item.averageTimeSeconds)} />
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-secondary"
        >
          콘텐츠 원문 보기
        </a>
      </div>
    </div>
  );
}
