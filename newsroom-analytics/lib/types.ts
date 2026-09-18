export type PeriodPreset = "7d" | "30d" | "90d" | "180d";

export type DiagnosisCode =
  | "expand"
  | "title_improvement"
  | "content_update"
  | "performance_drop"
  | "observe"
  | "maintain";

export interface Period {
  startDate: string;
  endDate: string;
  preset: PeriodPreset;
}

export interface SummaryMetrics {
  pageViews: number;
  pageViewsChange: number;
  searchVisits: number;
  searchVisitsChange: number;
  searchShare: number;
  searchShareChange: number;
  searchImpressions: number;
  searchImpressionsChange: number;
  searchCtr: number;
  searchCtrChange: number;
  averageRank: number;
  averageRankChange: number;
  averageTimeSeconds: number;
  averageTimeChange: number;
  publishedContents: number;
  publishedContentsChange: number;
}

export interface TrendPoint {
  date: string;
  pageViews: number;
  searchVisits: number;
  searchImpressions: number;
  searchCtr: number;
}

export interface ContentItem {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  category: string;
  pageViews: number;
  pageViewsChange: number;
  searchVisits: number;
  searchVisitsChange: number;
  searchImpressions: number;
  searchCtr: number;
  averageRank: number;
  averageTimeSeconds: number;
  diagnosis: DiagnosisCode;
  recommendedAction: string;
}

export interface DashboardData {
  updatedAt: string;
  period: Period;
  summary: SummaryMetrics;
  trends: TrendPoint[];
  contents: ContentItem[];
}

export type SortDirection = "asc" | "desc";

export type ContentSortKey = keyof Pick<
  ContentItem,
  | "title"
  | "publishedAt"
  | "category"
  | "pageViews"
  | "searchVisits"
  | "searchImpressions"
  | "searchCtr"
  | "averageRank"
  | "averageTimeSeconds"
  | "diagnosis"
>;

export interface DiagnosisMeta {
  code: DiagnosisCode;
  label: string;
  color: "green" | "red" | "orange" | "gray" | "blue";
}

export const DIAGNOSIS_META: Record<DiagnosisCode, DiagnosisMeta> = {
  expand: { code: "expand", label: "확장 추천", color: "green" },
  title_improvement: { code: "title_improvement", label: "제목 개선", color: "red" },
  content_update: { code: "content_update", label: "내용 보강", color: "orange" },
  performance_drop: { code: "performance_drop", label: "성과 하락", color: "red" },
  observe: { code: "observe", label: "관찰 필요", color: "gray" },
  maintain: { code: "maintain", label: "유지", color: "blue" },
};
