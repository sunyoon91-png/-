"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCw } from "lucide-react";
import Header from "@/components/Header";
import FilterBar from "@/components/FilterBar";
import SummaryCards from "@/components/SummaryCards";
import TrendChart from "@/components/TrendChart";
import PriorityActions from "@/components/PriorityActions";
import ContentTable from "@/components/ContentTable";
import ContentDetailPanel from "@/components/ContentDetailPanel";
import { ContentItem, ContentSortKey, DashboardData, DiagnosisCode, PeriodPreset, SortDirection } from "@/lib/types";
import { diagnoseContents } from "@/lib/diagnosis";
import { filterContents, isWithinPeriodDays, PERIOD_DAYS, sortContents } from "@/lib/filters";

type LoadState = "loading" | "loaded" | "error";

export default function Page() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<DashboardData | null>(null);

  const [period, setPeriod] = useState<PeriodPreset>("30d");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [diagnosisFilter, setDiagnosisFilter] = useState<DiagnosisCode | "all">("all");
  const [sortKey, setSortKey] = useState<ContentSortKey>("pageViews");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  async function loadData() {
    setLoadState("loading");
    try {
      const res = await fetch("/data/dashboard.json", { cache: "no-store" });
      if (!res.ok) throw new Error("failed to load");
      const json: DashboardData = await res.json();
      setData(json);
      setPeriod(json.period.preset);
      setLoadState("loaded");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const periodFilteredTrends = useMemo(() => {
    if (!data) return [];
    const days = PERIOD_DAYS[period];
    return data.trends.filter((t) => isWithinPeriodDays(t.date, data.period.endDate, days));
  }, [data, period]);

  const periodFilteredContents = useMemo(() => {
    if (!data) return [];
    const days = PERIOD_DAYS[period];
    return data.contents.filter((c) => isWithinPeriodDays(c.publishedAt, data.period.endDate, days));
  }, [data, period]);

  const diagnosedContents = useMemo(() => {
    if (!data) return [];
    const results = diagnoseContents(periodFilteredContents, data.period.endDate);
    return periodFilteredContents.map((item) => {
      const diag = results.get(item.id);
      return diag ? { ...item, diagnosis: diag.diagnosis, recommendedAction: diag.recommendedAction } : item;
    });
  }, [data, periodFilteredContents]);

  const categoryFilteredContents = useMemo(
    () => (category === "all" ? diagnosedContents : diagnosedContents.filter((c) => c.category === category)),
    [diagnosedContents, category]
  );

  const tableContents = useMemo(() => {
    const filtered = filterContents(categoryFilteredContents, {
      category: "all",
      search,
      diagnosis: diagnosisFilter,
    });
    return sortContents(filtered, sortKey, sortDirection);
  }, [categoryFilteredContents, search, diagnosisFilter, sortKey, sortDirection]);

  function handleSort(key: ContentSortKey) {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  }

  if (loadState === "loading") {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-busy="true">
        <p className="sr-only">성과 데이터를 불러오는 중입니다.</p>
        <div className="animate-pulse space-y-4">
          <div className="h-16 rounded-card bg-border/60" />
          <div className="h-20 rounded-card bg-border/60" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-24 rounded-card bg-border/60" />
            ))}
          </div>
          <div className="h-72 rounded-card bg-border/60" />
          <div className="h-64 rounded-card bg-border/60" />
        </div>
      </main>
    );
  }

  if (loadState === "error" || !data) {
    return (
      <main className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <p className="text-sm text-muted">성과 데이터를 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-secondary"
        >
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          다시 불러오기
        </button>
      </main>
    );
  }

  return (
    <>
      <Header updatedAt={data.updatedAt} />
      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6">
        <FilterBar
          period={period}
          onPeriodChange={setPeriod}
          category={category}
          onCategoryChange={setCategory}
          search={search}
          onSearchChange={setSearch}
        />
        <SummaryCards summary={data.summary} />
        <TrendChart trends={periodFilteredTrends} />
        <PriorityActions contents={categoryFilteredContents} onSelect={setSelectedItem} />
        <ContentTable
          items={tableContents}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          diagnosisFilter={diagnosisFilter}
          onDiagnosisFilterChange={setDiagnosisFilter}
          onRowClick={setSelectedItem}
        />
      </main>
      <ContentDetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
    </>
  );
}
