"use client";

import ResultCard, { CopyButton } from "./ResultCard";
import type { GeneratedContent } from "@/lib/types";

type Props = {
  result: GeneratedContent | null;
};

/** "전체 복사"에 쓸 읽기 좋은 텍스트를 만듭니다. */
function formatAll(result: GeneratedContent): string {
  return [
    "[제목 제안]",
    result.titles.map((t, i) => `${i + 1}. ${t}`).join("\n"),
    "",
    "[핵심요약]",
    result.summary.map((s) => `- ${s}`).join("\n"),
    "",
    "[본문 초안]",
    result.body,
    "",
    "[AEO 질문형 소제목]",
    result.aeoHeadings.map((h) => `- ${h}`).join("\n"),
    "",
    "[메타디스크립션]",
    result.metaDescription,
    "",
    "[한글 슬러그]",
    result.slug,
    "",
    "[태그]",
    result.tags.join(", "),
    "",
    "[FAQ]",
    result.faq.map((f) => `Q. ${f.question}\nA. ${f.answer}`).join("\n\n"),
    "",
    "[썸네일 문구]",
    result.thumbnailTexts.map((t, i) => `${i + 1}. ${t}`).join("\n"),
    "",
    "[WordPress HTML]",
    result.wordpressHtml,
  ].join("\n");
}

/** 본문 초안 문자열을 소제목("## ")과 문단으로 나눠 보여 줍니다. */
function BodyView({ body }: { body: string }) {
  const lines = body.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="space-y-3">
      {lines.map((line, i) =>
        line.startsWith("## ") ? (
          <h4
            key={i}
            className="pt-2 text-base font-semibold text-slate-900"
          >
            {line.slice(3)}
          </h4>
        ) : (
          <p key={i}>{line}</p>
        ),
      )}
    </div>
  );
}

export default function OutputPanel({ result }: Props) {
  if (!result) {
    return (
      <section className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm leading-relaxed text-slate-500">
          왼쪽에 원문이나 참고자료를 붙여넣고
          <br />
          <span className="font-semibold text-slate-700">콘텐츠 생성</span>{" "}
          버튼을 누르면 결과가 여기에 표시됩니다.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3">
        <h2 className="text-base font-semibold text-slate-900">생성 결과</h2>
        <CopyButton text={formatAll(result)} label="전체 복사" />
      </div>

      <ResultCard
        title="제목 제안"
        copyText={result.titles.map((t, i) => `${i + 1}. ${t}`).join("\n")}
      >
        <ol className="list-decimal space-y-2 pl-5">
          {result.titles.map((title, i) => (
            <li key={i}>{title}</li>
          ))}
        </ol>
      </ResultCard>

      <ResultCard
        title="핵심요약"
        copyText={result.summary.map((s) => `- ${s}`).join("\n")}
      >
        <ul className="list-disc space-y-2 pl-5">
          {result.summary.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </ResultCard>

      <ResultCard title="본문 초안" copyText={result.body}>
        <BodyView body={result.body} />
      </ResultCard>

      <ResultCard
        title="AEO 질문형 소제목"
        copyText={result.aeoHeadings.map((h) => `- ${h}`).join("\n")}
      >
        <ul className="list-disc space-y-2 pl-5">
          {result.aeoHeadings.map((heading, i) => (
            <li key={i}>{heading}</li>
          ))}
        </ul>
      </ResultCard>

      <ResultCard title="메타디스크립션" copyText={result.metaDescription}>
        <p>{result.metaDescription}</p>
        <p className="mt-2 text-xs text-slate-400">
          {result.metaDescription.length}자
        </p>
      </ResultCard>

      <ResultCard title="한글 슬러그" copyText={result.slug}>
        <code className="rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-800">
          {result.slug}
        </code>
      </ResultCard>

      <ResultCard title="태그" copyText={result.tags.join(", ")}>
        <div className="flex flex-wrap gap-2">
          {result.tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      </ResultCard>

      <ResultCard
        title="FAQ"
        copyText={result.faq
          .map((f) => `Q. ${f.question}\nA. ${f.answer}`)
          .join("\n\n")}
      >
        <dl className="space-y-4">
          {result.faq.map((item, i) => (
            <div key={i}>
              <dt className="font-semibold text-slate-900">
                Q. {item.question}
              </dt>
              <dd className="mt-1">A. {item.answer}</dd>
            </div>
          ))}
        </dl>
      </ResultCard>

      <ResultCard
        title="썸네일 문구"
        copyText={result.thumbnailTexts
          .map((t, i) => `${i + 1}. ${t}`)
          .join("\n")}
      >
        <ol className="list-decimal space-y-2 pl-5">
          {result.thumbnailTexts.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ol>
      </ResultCard>

      <ResultCard title="WordPress HTML" copyText={result.wordpressHtml}>
        <pre className="max-h-96 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed whitespace-pre text-slate-800">
          {result.wordpressHtml}
        </pre>
      </ResultCard>
    </div>
  );
}
