import { ContentItem, DiagnosisCode } from "./types";

function percentileRank(values: number[], value: number): number {
  if (values.length === 0) return 0;
  const countAtOrBelow = values.filter((v) => v <= value).length;
  return (countAtOrBelow / values.length) * 100;
}

function daysSince(dateStr: string, referenceDate: string): number {
  const published = new Date(dateStr).getTime();
  const reference = new Date(referenceDate).getTime();
  return Math.floor((reference - published) / (1000 * 60 * 60 * 24));
}

export interface DiagnosisResult {
  diagnosis: DiagnosisCode;
  recommendedAction: string;
}

/**
 * Recomputes each content item's diagnosis against the currently filtered set,
 * since percentile thresholds are relative to the active period/category view.
 */
export function diagnoseContents(
  contents: ContentItem[],
  referenceDate: string
): Map<string, DiagnosisResult> {
  const pageViewsList = contents.map((c) => c.pageViews);
  const impressionsList = contents.map((c) => c.searchImpressions);

  const results = new Map<string, DiagnosisResult>();

  for (const item of contents) {
    const pageViewsPercentile = percentileRank(pageViewsList, item.pageViews);
    const impressionsPercentile = percentileRank(impressionsList, item.searchImpressions);
    const daysSincePublished = daysSince(item.publishedAt, referenceDate);

    if (
      item.searchCtr >= 6 &&
      item.averageRank <= 10 &&
      pageViewsPercentile >= 70
    ) {
      results.set(item.id, {
        diagnosis: "expand",
        recommendedAction: "조회수와 검색성과가 모두 좋습니다. 관련 주제의 후속 콘텐츠 제작을 추천합니다.",
      });
      continue;
    }

    if (impressionsPercentile >= 60 && item.searchCtr <= 3) {
      results.set(item.id, {
        diagnosis: "title_improvement",
        recommendedAction: "검색 노출은 많지만 클릭률이 낮습니다. 제목과 메타디스크립션을 개선하세요.",
      });
      continue;
    }

    if (item.searchVisitsChange <= -20) {
      results.set(item.id, {
        diagnosis: "performance_drop",
        recommendedAction: "이전 기간보다 검색 유입이 크게 감소했습니다. 최신성 및 검색 순위 하락 원인을 확인하세요.",
      });
      continue;
    }

    if (item.averageRank >= 6 && item.averageRank <= 15 && item.searchVisits >= 100) {
      results.set(item.id, {
        diagnosis: "content_update",
        recommendedAction: "검색 상위 노출 가능성이 있습니다. FAQ, 사례 및 최신 정보를 추가하세요.",
      });
      continue;
    }

    if (daysSincePublished <= 14) {
      results.set(item.id, {
        diagnosis: "observe",
        recommendedAction: "발행 후 데이터가 충분히 쌓이지 않았습니다. 당분간 성과를 관찰하세요.",
      });
      continue;
    }

    results.set(item.id, {
      diagnosis: "maintain",
      recommendedAction: "현재 성과가 안정적입니다. 정기적으로 최신 정보 여부를 점검하세요.",
    });
  }

  return results;
}

const PRIORITY_ORDER: DiagnosisCode[] = [
  "title_improvement",
  "performance_drop",
  "content_update",
  "expand",
  "observe",
  "maintain",
];

export function sortByPriority(codes: DiagnosisCode[]): DiagnosisCode[] {
  return [...codes].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a) - PRIORITY_ORDER.indexOf(b)
  );
}

export function priorityIndex(code: DiagnosisCode): number {
  return PRIORITY_ORDER.indexOf(code);
}
