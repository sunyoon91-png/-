"use client";

import { useState } from "react";

type Props = {
  /** 카드 제목 (예: "제목 제안") */
  title: string;
  /** "복사" 버튼을 눌렀을 때 클립보드로 들어갈 텍스트 */
  copyText: string;
  children: React.ReactNode;
};

/** 클립보드 복사. 보안 컨텍스트가 아닐 때를 대비해 간단한 대체 방법을 둡니다. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/** 복사 버튼: 누르면 2초 동안 "복사됨"으로 바뀝니다. */
export function CopyButton({
  text,
  label = "복사",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyToClipboard(text);
        if (!ok) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="shrink-0 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
    >
      {copied ? "복사됨" : label}
    </button>
  );
}

export default function ResultCard({ title, copyText, children }: Props) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <CopyButton text={copyText} />
      </div>
      <div className="pt-4 text-sm leading-relaxed text-slate-700">
        {children}
      </div>
    </section>
  );
}
