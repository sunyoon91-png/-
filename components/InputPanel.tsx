"use client";

import { CONTENT_TYPES, type ContentType } from "@/lib/types";

type Props = {
  contentType: ContentType;
  keyword: string;
  source: string;
  isGenerating: boolean;
  onContentTypeChange: (value: ContentType) => void;
  onKeywordChange: (value: string) => void;
  onSourceChange: (value: string) => void;
  onGenerate: () => void;
  onReset: () => void;
};

const labelClass = "block text-sm font-semibold text-slate-700";
const fieldClass =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500";

export default function InputPanel({
  contentType,
  keyword,
  source,
  isGenerating,
  onContentTypeChange,
  onKeywordChange,
  onSourceChange,
  onGenerate,
  onReset,
}: Props) {
  // 글자 수는 저장하지 않고 입력값에서 바로 계산합니다.
  const charCount = source.length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="text-base font-semibold text-slate-900">입력</h2>

      <div className="mt-5">
        <label className={labelClass} htmlFor="contentType">
          콘텐츠 유형
        </label>
        <select
          id="contentType"
          className={fieldClass}
          value={contentType}
          onChange={(e) => onContentTypeChange(e.target.value as ContentType)}
        >
          {CONTENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <label className={labelClass} htmlFor="keyword">
          핵심 키워드{" "}
          <span className="font-normal text-slate-400">(선택)</span>
        </label>
        <input
          id="keyword"
          type="text"
          className={fieldClass}
          placeholder="예: 사망보험금 유동화, 교보생명, 고객보장"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>

      <div className="mt-5">
        <label className={labelClass} htmlFor="source">
          원문 / 참고자료
        </label>
        <textarea
          id="source"
          className={`${fieldClass} min-h-[320px] resize-y leading-relaxed`}
          placeholder="보도자료, 기존 원고, 인터뷰 내용, 참고자료 등을 붙여넣어 주세요."
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
        />
        <p className="mt-2 text-right text-xs text-slate-500">
          {charCount.toLocaleString("ko-KR")}자
        </p>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isGenerating ? "생성 중…" : "콘텐츠 생성"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          초기화
        </button>
      </div>
    </section>
  );
}
