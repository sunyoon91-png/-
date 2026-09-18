import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { SummaryMetrics } from "@/lib/types";
import {
  formatChange,
  formatDuration,
  formatNumber,
  formatPercentage,
  formatRank,
} from "@/lib/format";

interface MetricConfig {
  key: keyof SummaryMetrics;
  changeKey: keyof SummaryMetrics;
  label: string;
  description: string;
  format: (value: number) => string;
  lowerIsBetter?: boolean;
}

const METRICS: MetricConfig[] = [
  {
    key: "pageViews",
    changeKey: "pageViewsChange",
    label: "전체 조회수",
    description: "선택 기간 뉴스룸 콘텐츠의 전체 페이지 조회수",
    format: formatNumber,
  },
  {
    key: "searchVisits",
    changeKey: "searchVisitsChange",
    label: "검색 유입",
    description: "검색엔진을 통해 유입된 방문 수",
    format: formatNumber,
  },
  {
    key: "searchShare",
    changeKey: "searchShareChange",
    label: "검색 유입 비중",
    description: "전체 조회수 중 검색 유입이 차지하는 비중",
    format: formatPercentage,
  },
  {
    key: "searchImpressions",
    changeKey: "searchImpressionsChange",
    label: "검색 노출",
    description: "검색결과에 뉴스룸 콘텐츠가 노출된 횟수",
    format: formatNumber,
  },
  {
    key: "searchCtr",
    changeKey: "searchCtrChange",
    label: "검색 클릭률",
    description: "검색 노출 대비 클릭 비율",
    format: formatPercentage,
  },
  {
    key: "averageRank",
    changeKey: "averageRankChange",
    label: "평균 검색 순위",
    description: "뉴스룸 콘텐츠의 평균 검색 노출 순위",
    format: formatRank,
    lowerIsBetter: true,
  },
  {
    key: "averageTimeSeconds",
    changeKey: "averageTimeChange",
    label: "평균 체류시간",
    description: "콘텐츠 상세 페이지의 평균 체류시간",
    format: formatDuration,
  },
  {
    key: "publishedContents",
    changeKey: "publishedContentsChange",
    label: "발행 콘텐츠",
    description: "선택 기간에 발행한 콘텐츠 수",
    format: formatNumber,
  },
];

function ChangeIndicator({ value, lowerIsBetter }: { value: number; lowerIsBetter?: boolean }) {
  const change = formatChange(value, lowerIsBetter);
  const Icon = change.direction === "up" ? ArrowUp : change.direction === "down" ? ArrowDown : ArrowRight;
  const colorClass =
    change.direction === "flat"
      ? "text-neutral"
      : change.isPositive
      ? "text-positive"
      : "text-negative";

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${colorClass}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>
        {change.text}
        {" "}
        <span className="sr-only">
          {change.direction === "up" ? "증가" : change.direction === "down" ? "감소" : "변동 없음"}
        </span>
      </span>
    </span>
  );
}

export default function SummaryCards({ summary }: { summary: SummaryMetrics }) {
  return (
    <section aria-label="전체 성과" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {METRICS.map((metric) => (
        <div
          key={metric.key}
          className="rounded-card border border-border bg-surface p-4 shadow-sm"
          title={metric.description}
        >
          <p className="text-sm text-muted">{metric.label}</p>
          <p className="mt-1 text-xl font-bold text-ink sm:text-2xl">
            {metric.format(summary[metric.key])}
          </p>
          <div className="mt-1.5">
            <ChangeIndicator value={summary[metric.changeKey]} lowerIsBetter={metric.lowerIsBetter} />
          </div>
        </div>
      ))}
    </section>
  );
}
