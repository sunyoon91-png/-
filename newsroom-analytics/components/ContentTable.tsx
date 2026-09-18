"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { ContentItem, ContentSortKey, DiagnosisCode, DIAGNOSIS_META, SortDirection } from "@/lib/types";
import { formatDate, formatDuration, formatNumber, formatPercentage, formatRank } from "@/lib/format";
import DiagnosisBadge from "@/components/DiagnosisBadge";

interface Column {
  key: ContentSortKey | "recommendedAction";
  label: string;
  align: "left" | "right" | "center";
  sortable: boolean;
  hideOnMobile?: boolean;
}

const COLUMNS: Column[] = [
  { key: "title", label: "콘텐츠", align: "left", sortable: true },
  { key: "publishedAt", label: "발행일", align: "left", sortable: true, hideOnMobile: true },
  { key: "category", label: "카테고리", align: "left", sortable: true, hideOnMobile: true },
  { key: "pageViews", label: "조회수", align: "right", sortable: true },
  { key: "searchVisits", label: "검색 유입", align: "right", sortable: true, hideOnMobile: true },
  { key: "searchImpressions", label: "검색 노출", align: "right", sortable: true, hideOnMobile: true },
  { key: "searchCtr", label: "CTR", align: "right", sortable: true, hideOnMobile: true },
  { key: "averageRank", label: "평균 순위", align: "right", sortable: true, hideOnMobile: true },
  { key: "averageTimeSeconds", label: "체류시간", align: "right", sortable: true, hideOnMobile: true },
  { key: "diagnosis", label: "성과 진단", align: "center", sortable: true },
  { key: "recommendedAction", label: "추천 행동", align: "left", sortable: false, hideOnMobile: true },
];

const DIAGNOSIS_FILTER_OPTIONS: { value: DiagnosisCode | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  ...(Object.keys(DIAGNOSIS_META) as DiagnosisCode[]).map((code) => ({
    value: code,
    label: DIAGNOSIS_META[code].label,
  })),
];

function renderCell(item: ContentItem, key: Column["key"]) {
  switch (key) {
    case "title":
      return <span className="font-medium text-ink">{item.title}</span>;
    case "publishedAt":
      return formatDate(item.publishedAt);
    case "category":
      return item.category;
    case "pageViews":
      return formatNumber(item.pageViews);
    case "searchVisits":
      return formatNumber(item.searchVisits);
    case "searchImpressions":
      return formatNumber(item.searchImpressions);
    case "searchCtr":
      return formatPercentage(item.searchCtr);
    case "averageRank":
      return formatRank(item.averageRank);
    case "averageTimeSeconds":
      return formatDuration(item.averageTimeSeconds);
    case "diagnosis":
      return <DiagnosisBadge diagnosis={item.diagnosis} />;
    case "recommendedAction":
      return <span className="text-muted">{item.recommendedAction}</span>;
    default:
      return null;
  }
}

interface ContentTableProps {
  items: ContentItem[];
  sortKey: ContentSortKey;
  sortDirection: SortDirection;
  onSort: (key: ContentSortKey) => void;
  diagnosisFilter: DiagnosisCode | "all";
  onDiagnosisFilterChange: (value: DiagnosisCode | "all") => void;
  onRowClick: (item: ContentItem) => void;
}

export default function ContentTable({
  items,
  sortKey,
  sortDirection,
  onSort,
  diagnosisFilter,
  onDiagnosisFilterChange,
  onRowClick,
}: ContentTableProps) {
  return (
    <section aria-label="콘텐츠별 성과" className="rounded-card border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-ink">콘텐츠별 성과</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="diagnosis-filter" className="text-sm font-medium text-muted">
            성과 진단
          </label>
          <select
            id="diagnosis-filter"
            value={diagnosisFilter}
            onChange={(e) => onDiagnosisFilterChange(e.target.value as DiagnosisCode | "all")}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-ink focus:border-primary"
          >
            {DIAGNOSIS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 py-8 text-center text-sm text-muted">
          선택한 조건에 해당하는 콘텐츠가 없습니다.
        </p>
      ) : (
        <div className="mt-4 -mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-3 py-2 font-medium text-muted ${
                      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                    } ${col.hideOnMobile ? "hidden sm:table-cell" : ""}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => onSort(col.key as ContentSortKey)}
                        className={`inline-flex items-center gap-1 hover:text-ink ${
                          col.align === "right" ? "flex-row-reverse" : ""
                        }`}
                        aria-label={`${col.label} 기준 정렬`}
                      >
                        {col.label}
                        {sortKey === col.key ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`${item.title} 상세 보기`}
                  onClick={() => onRowClick(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onRowClick(item);
                    }
                  }}
                  className="cursor-pointer border-b border-border last:border-0 hover:bg-background focus:bg-background"
                >
                  {COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className={`px-3 py-2.5 ${
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"
                      } ${col.hideOnMobile ? "hidden sm:table-cell" : ""}`}
                    >
                      {renderCell(item, col.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
