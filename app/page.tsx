"use client";

import { useEffect, useState } from "react";
import InputPanel from "@/components/InputPanel";
import OutputPanel from "@/components/OutputPanel";
import { generateContent } from "@/lib/generateContent";
import {
  DEFAULT_CONTENT_TYPE,
  type ContentType,
  type GeneratedContent,
} from "@/lib/types";

/** 새로고침해도 입력 내용이 남도록 브라우저 localStorage에 저장합니다. */
const STORAGE_KEY = "newsroom-ai-studio-input";

export default function Home() {
  const [contentType, setContentType] =
    useState<ContentType>(DEFAULT_CONTENT_TYPE);
  const [keyword, setKeyword] = useState("");
  const [source, setSource] = useState("");
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // 저장된 값을 불러오기 전에 빈 값으로 덮어쓰지 않도록 막아 주는 표시입니다.
  const [isLoaded, setIsLoaded] = useState(false);

  // 처음 화면이 뜰 때 저장된 입력값을 불러옵니다.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (typeof parsed.contentType === "string")
        setContentType(parsed.contentType as ContentType);
      if (typeof parsed.keyword === "string") setKeyword(parsed.keyword);
      if (typeof parsed.source === "string") setSource(parsed.source);
    } catch {
      // 저장된 값이 깨졌으면 그냥 무시합니다.
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 입력값이 바뀔 때마다 저장합니다.
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ contentType, keyword, source }),
      );
    } catch {
      // 저장 공간이 없어도 앱은 그대로 동작합니다.
    }
  }, [isLoaded, contentType, keyword, source]);

  async function handleGenerate() {
    if (source.trim().length === 0 && keyword.trim().length === 0) {
      alert("원문 또는 핵심 키워드를 입력해 주세요.");
      return;
    }
    setIsGenerating(true);
    try {
      const generated = await generateContent({ contentType, keyword, source });
      setResult(generated);
    } catch (error) {
      console.error(error);
      alert("콘텐츠 생성 중 문제가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleReset() {
    setContentType(DEFAULT_CONTENT_TYPE);
    setKeyword("");
    setSource("");
    setResult(null);
  }

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Newsroom AI Studio
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          뉴스룸 콘텐츠 제작을 빠르게 정리하는 개인용 AI 작업 도구
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-8">
            <InputPanel
              contentType={contentType}
              keyword={keyword}
              source={source}
              isGenerating={isGenerating}
              onContentTypeChange={setContentType}
              onKeywordChange={setKeyword}
              onSourceChange={setSource}
              onGenerate={handleGenerate}
              onReset={handleReset}
            />
          </div>
        </div>

        <div className="lg:col-span-3">
          <OutputPanel result={result} />
        </div>
      </div>
    </main>
  );
}
