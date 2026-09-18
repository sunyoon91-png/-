import { ContentItem, ContentSortKey, DiagnosisCode, SortDirection } from "./types";
import { priorityIndex } from "./diagnosis";

export interface ContentFilters {
  category: string;
  search: string;
  diagnosis: DiagnosisCode | "all";
}

export function filterContents(
  contents: ContentItem[],
  filters: ContentFilters
): ContentItem[] {
  return contents.filter((item) => {
    if (filters.category !== "all" && item.category !== filters.category) {
      return false;
    }
    if (filters.diagnosis !== "all" && item.diagnosis !== filters.diagnosis) {
      return false;
    }
    if (filters.search.trim()) {
      const query = filters.search.trim().toLowerCase();
      if (!item.title.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });
}

export function sortContents(
  contents: ContentItem[],
  key: ContentSortKey,
  direction: SortDirection
): ContentItem[] {
  const sorted = [...contents].sort((a, b) => {
    let result = 0;
    if (key === "diagnosis") {
      result = priorityIndex(a.diagnosis) - priorityIndex(b.diagnosis);
    } else {
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === "number" && typeof bVal === "number") {
        result = aVal - bVal;
      } else {
        result = String(aVal).localeCompare(String(bVal), "ko");
      }
    }
    return direction === "asc" ? result : -result;
  });
  return sorted;
}

export function isWithinPeriodDays(dateStr: string, endDate: string, days: number): boolean {
  const date = new Date(dateStr).getTime();
  const end = new Date(endDate).getTime();
  const start = end - days * 24 * 60 * 60 * 1000;
  return date >= start && date <= end;
}

export const PERIOD_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "180d": 180,
};
