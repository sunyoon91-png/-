/**
 * 앱 전체에서 공통으로 쓰는 타입 정의.
 * 나중에 실제 AI API를 붙일 때도 이 타입을 그대로 사용하면
 * UI 코드를 고치지 않아도 됩니다.
 */

/** 콘텐츠 유형 목록. 항목을 추가/삭제하려면 이 배열만 수정하면 됩니다. */
export const CONTENT_TYPES = [
  "보험정보",
  "브랜드스토리",
  "사회공헌",
  "인물",
  "FP 콘텐츠",
  "보도자료 기반 콘텐츠",
  "기타",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

/** 기본 선택값 */
export const DEFAULT_CONTENT_TYPE: ContentType = "브랜드스토리";

/** 생성 버튼을 누를 때 넘기는 입력값 */
export type GenerateInput = {
  contentType: ContentType;
  keyword: string;
  source: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

/** 생성 결과 구조 — 화면의 카드 순서와 동일합니다. */
export type GeneratedContent = {
  titles: string[];
  summary: string[];
  body: string;
  aeoHeadings: string[];
  metaDescription: string;
  slug: string;
  tags: string[];
  faq: FaqItem[];
  thumbnailTexts: string[];
  wordpressHtml: string;
};
