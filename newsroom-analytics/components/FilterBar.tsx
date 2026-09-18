"use client";

import { Search } from "lucide-react";
import { PeriodPreset } from "@/lib/types";

const PERIOD_OPTIONS: { label: string; value: PeriodPreset }[] = [
  { label: "7일", value: "7d" },
  { label: "30일", value: "30d" },
  { label: "3개월", value: "90d" },
  { label: "6개월", value: "180d" },
];

const CATEGORY_OPTIONS = [
  "전체",
  "보험정보",
  "브랜드 스토리",
  "인물·경영철학",
  "사회공헌",
  "문화·교육",
  "기업소식",
  "상품·서비스",
  "FP 활용 콘텐츠",
];

interface FilterBarProps {
  period: PeriodPreset;
  onPeriodChange: (value: PeriodPreset) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function FilterBar({
  period,
  onPeriodChange,
  category,
  onCategoryChange,
  search,
  onSearchChange,
}: FilterBarProps) {
  return (
    <section
      aria-label="조회 조건"
      className="rounded-card border border-border bg-surface p-4 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
        <div>
          <span className="mb-1.5 block text-sm font-medium text-ink" id="period-label">
            조회 기간
          </span>
          <div
            role="group"
            aria-labelledby="period-label"
            className="inline-flex rounded-lg border border-border bg-background p-1"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={period === opt.value}
                onClick={() => onPeriodChange(opt.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === opt.value
                    ? "bg-primary text-white"
                    : "text-muted hover:text-ink"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-[160px]">
          <label htmlFor="category-select" className="mb-1.5 block text-sm font-medium text-ink">
            카테고리
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-ink focus:border-primary"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt} value={opt === "전체" ? "all" : opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 sm:min-w-[240px]">
          <label htmlFor="content-search" className="mb-1.5 block text-sm font-medium text-ink">
            콘텐츠 검색
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              id="content-search"
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="콘텐츠 제목 검색"
              className="w-full rounded-lg border border-border bg-background py-1.5 pl-9 pr-3 text-sm text-ink focus:border-primary"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
