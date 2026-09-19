import type { GeneratedContent, GenerateInput } from "./types";

/**
 * ============================================================
 *  더미(샘플) 콘텐츠 생성 로직
 * ============================================================
 *
 * 지금은 외부 AI API를 호출하지 않고, 입력값을 조합해 그럴듯한
 * 샘플 결과를 만들어 냅니다. UI와 작업 흐름을 먼저 점검하기 위한 용도입니다.
 *
 * ── 나중에 실제 AI API를 연결할 위치 ──────────────────────────
 * 아래 generateContent() 함수의 본문만 다음과 같이 바꾸면 됩니다.
 *
 *   export async function generateContent(
 *     input: GenerateInput
 *   ): Promise<GeneratedContent> {
 *     const res = await fetch("/api/generate", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify(input),
 *     });
 *     if (!res.ok) throw new Error("콘텐츠 생성에 실패했습니다.");
 *     return (await res.json()) as GeneratedContent;
 *   }
 *
 * 그리고 app/api/generate/route.ts 를 새로 만들어 서버에서 AI 모델을
 * 호출하고, 응답을 GeneratedContent 형태의 JSON으로 돌려주면 됩니다.
 * API 키는 반드시 서버(환경변수)에서만 사용하고, 이 파일을 포함한
 * 브라우저 코드에는 절대 넣지 마세요.
 * ------------------------------------------------------------
 */

/**
 * 입력한 키워드 문자열을 쉼표(,)·가운뎃점(·)·슬래시(/)·줄바꿈 기준으로 나눕니다.
 * "사망보험금 유동화"처럼 띄어쓰기가 들어간 키워드는 하나로 유지합니다.
 */
function splitKeywords(keyword: string): string[] {
  return keyword
    .split(/[,·/\n]/)
    .map((k) => k.trim())
    .filter(Boolean);
}

/**
 * 한글 조사 처리. 마지막 글자에 받침이 있으면 withBatchim, 없으면 withoutBatchim을 붙입니다.
 * (예: "사망보험금" + 이란 / "유동화" + 란)
 */
function particle(word: string, withBatchim: string, withoutBatchim: string): string {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  // 한글 음절이 아니면(영문·숫자 등) 받침 없는 형태를 씁니다.
  if (Number.isNaN(code) || code < 0xac00 || code > 0xd7a3) return withoutBatchim;
  return (code - 0xac00) % 28 !== 0 ? withBatchim : withoutBatchim;
}

/** 단어 뒤에 알맞은 조사를 붙여 돌려줍니다. */
function withParticle(word: string, withBatchim: string, withoutBatchim: string): string {
  return word + particle(word, withBatchim, withoutBatchim);
}

/** 원문에서 앞부분 문장 몇 개를 뽑아옵니다. */
function firstSentences(source: string, count: number): string[] {
  return source
    .replace(/\r/g, "")
    .split(/\n+|(?<=[.!?。])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5)
    .slice(0, count);
}

/** 문장 하나를 원하는 길이로 자릅니다. */
function clip(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  return flat.slice(0, max).trim() + "…";
}

/** 한글 슬러그용으로 기호를 제거합니다. */
function toSlugPiece(text: string): string {
  return text
    .replace(/[^가-힣a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/** 콘텐츠 유형별로 톤·문맥이 달라지는 부분을 한 곳에 모아 둡니다. */
const TYPE_PRESET: Record<
  string,
  { context: string; angle: string; closing: string; baseTags: string[] }
> = {
  보험정보: {
    context: "보험 제도와 상품 구조를 고객 눈높이에서 짚어 주는",
    angle: "약관 용어를 그대로 옮기지 않고, 고객이 실제로 궁금해하는 지점부터 순서대로 풀었습니다.",
    closing:
      "구체적인 보장 범위와 지급 조건은 상품마다 다르므로, 가입 전 상품설명서와 약관을 함께 확인하는 것이 정확합니다. 자세한 내용은 교보생명 고객센터나 담당 설계사를 통해 안내받을 수 있습니다.",
    baseTags: ["보험정보", "생명보험", "보장분석"],
  },
  브랜드스토리: {
    context: "교보생명이 오랫동안 지켜 온 가치와 그 배경을 짚어 주는",
    angle: "'사람이 먼저다'라는 창업 철학이 지금의 활동과 어떻게 이어지는지, 숫자보다 맥락에 초점을 맞췄습니다.",
    closing:
      "브랜드의 가치는 한 번의 캠페인이 아니라 오래 쌓인 태도에서 드러납니다. 교보생명은 앞으로도 같은 기준으로 다음 이야기를 이어 갈 예정입니다.",
    baseTags: ["브랜드스토리", "교보생명", "기업철학"],
  },
  사회공헌: {
    context: "사회공헌 활동의 취지와 그동안의 성과를 정리하는",
    angle: "활동의 규모보다 현장에서 실제로 어떤 변화가 있었는지를 중심으로 살펴봤습니다.",
    closing:
      "사회공헌은 한 번의 이벤트가 아니라 꾸준함에서 의미를 찾습니다. 교보생명은 해당 활동을 앞으로도 같은 방향으로 이어 갈 계획입니다.",
    baseTags: ["사회공헌", "ESG", "상생경영"],
  },
  인물: {
    context: "인물의 경험과 관점을 통해 주제를 풀어내는",
    angle: "인터뷰에서 실제로 나온 표현을 살려, 전달하려는 메시지를 인물의 언어로 구성했습니다.",
    closing:
      "한 사람의 경험은 그 자체로 하나의 기록입니다. 이 이야기가 비슷한 고민을 하는 독자들께 실질적인 참고가 되기를 바랍니다.",
    baseTags: ["인터뷰", "사람", "교보생명"],
  },
  "FP 콘텐츠": {
    context: "재무설계사(FP)의 현장 경험을 바탕으로 정리하는",
    angle: "실제 상담 현장에서 반복해 나오는 질문을 기준으로, 고객이 무엇부터 챙겨야 하는지 순서대로 정리했습니다.",
    closing:
      "재무설계에는 하나의 정답이 있지 않습니다. 본인의 상황과 목표를 먼저 정리한 뒤, 담당 FP와 함께 구체적인 계획을 상의하는 것을 권합니다.",
    baseTags: ["FP", "재무설계", "교보생명"],
  },
  "보도자료 기반 콘텐츠": {
    context: "보도자료의 핵심 사실을 독자 눈높이로 다시 정리하는",
    angle: "발표 내용 가운데 독자의 실생활에 직접 영향을 주는 부분을 앞세워 구성했습니다.",
    closing:
      "이 내용은 배포 시점을 기준으로 작성되었으며, 세부 일정이나 조건은 이후 변경될 수 있습니다. 정확한 내용은 공식 보도자료와 교보생명 뉴스룸을 통해 다시 확인하는 것이 좋습니다.",
    baseTags: ["보도자료", "교보생명", "뉴스"],
  },
  기타: {
    context: "주제의 핵심을 차분히 정리하는",
    angle: "먼저 알아야 할 정보부터 순서대로 배치해, 처음 접하는 독자도 따라올 수 있도록 구성했습니다.",
    closing: "이후 새로운 내용이 확인되면 관련 내용을 보완해 다시 전해 드리겠습니다.",
    baseTags: ["뉴스룸", "교보생명", "콘텐츠"],
  },
};

export function generateMockContent(input: GenerateInput): GeneratedContent {
  const { contentType, keyword, source } = input;

  const keywords = splitKeywords(keyword);
  const preset = TYPE_PRESET[contentType] ?? TYPE_PRESET["기타"];

  const sentences = firstSentences(source, 3);
  // 주제어: 키워드 → 원문 첫 문장 → 콘텐츠 유형 순서로 정합니다.
  const topic =
    keywords[0] ??
    (sentences[0] ? clip(sentences[0], 18).replace(/…$/, "") : contentType);
  // 보조 주제어: 두 번째 키워드가 없으면 일반적인 표현을 씁니다.
  const subTopic = keywords[1] ?? "관련 제도";

  const lead = sentences[0] ?? `${topic}에 대한 정리가 필요한 시점입니다.`;
  const detail =
    sentences[1] ??
    `${withParticle(topic, "은", "는")} 용어만 보면 낯설지만, 구조를 나눠 보면 이해하기 어렵지 않습니다.`;
  const extra =
    sentences[2] ??
    "관련 제도와 운영 방식은 상황에 따라 달라질 수 있어 확인이 필요합니다.";

  const titles = [
    // 검색 친화형
    `${withParticle(topic, "이란", "란")}? 꼭 알아야 할 기준 한 번에 정리`,
    // 질문형
    `${topic}, 지금 알아 두면 무엇이 달라질까요?`,
    // 설명형
    `${topic}의 구조와 적용 기준, 차근차근 살펴봤습니다`,
    // 궁금증 유발형
    `아직 ${withParticle(topic, "이", "가")} 낯설게 느껴지시나요? 핵심만 짚어 드립니다`,
    // 간결형
    `${topic} 핵심 정리`,
  ];

  const summary = [
    `${withParticle(topic, "은", "는")} ${clip(lead, 60)}`,
    `${preset.context} 내용으로, ${preset.angle}`,
    clip(detail, 70),
    keywords.length > 1
      ? `함께 살펴볼 키워드: ${keywords.slice(0, 4).join(", ")}`
      : "적용 대상과 조건을 먼저 확인하면 이해가 빨라집니다.",
  ];

  const body = [
    `${clip(lead, 90)} ${withParticle(topic, "이라는", "라는")} 말은 자주 들리지만, 정작 어떤 의미이고 나와 어떤 관련이 있는지는 설명이 충분하지 않은 경우가 많습니다. 이 글에서는 ${withParticle(topic, "을", "를")} 둘러싼 기본 개념과 확인해야 할 기준을 차례대로 정리했습니다.`,
    "",
    `## ${topic}, 무엇을 말하는 걸까`,
    `${clip(detail, 110)} 용어 자체는 복잡해 보이지만, 핵심은 비교적 단순합니다. 어떤 조건에서, 누구에게, 어떤 방식으로 적용되는지를 나눠 보면 전체 그림이 잡힙니다. ${preset.angle}`,
    "",
    "## 무엇이 달라지나",
    `기존 방식과 비교하면 차이가 분명해집니다. ${clip(extra, 100)} 다만 모든 경우에 똑같이 적용되는 것은 아니어서, 본인이 해당하는 조건인지 먼저 확인하는 과정이 필요합니다. 이 부분을 건너뛰면 기대했던 것과 다른 결과를 마주할 수 있습니다.`,
    "",
    "## 확인해야 할 점",
    `${withParticle(subTopic, "과", "와")} 관련해서는 적용 시점, 대상 범위, 필요한 서류를 함께 살펴보는 것이 좋습니다. 특히 안내 자료마다 기준 시점이 다를 수 있으므로, 언제 기준으로 작성된 정보인지 확인하는 습관이 도움이 됩니다.`,
    "",
    "## 정리하며",
    preset.closing,
  ].join("\n");

  const aeoHeadings = [
    `${withParticle(topic, "이란", "란")} 무엇인가요?`,
    "누가 이용하거나 적용받을 수 있나요?",
    "기존 방식과 무엇이 다른가요?",
    `${topic}, 어떤 순서로 확인하면 되나요?`,
    "이용할 때 주의할 점은 무엇인가요?",
    "더 자세한 내용은 어디에서 볼 수 있나요?",
  ];

  const metaDescription = clip(
    `${topic}의 개념과 적용 기준, 기존 방식과의 차이, 확인해야 할 점을 ${contentType} 관점에서 정리했습니다. 처음 접하는 분도 순서대로 따라올 수 있도록 쉽게 풀어 설명합니다.`,
    150,
  );

  const slugSource = keywords.length > 0 ? keywords.slice(0, 4) : [topic, "정리"];
  const slug = slugSource.map(toSlugPiece).filter(Boolean).join("-");

  const tags = Array.from(
    new Set([
      ...keywords.slice(0, 4).map((k) => k.replace(/\s+/g, "")),
      ...preset.baseTags,
      "교보생명",
      "뉴스룸",
    ]),
  ).slice(0, 8);

  const faq = [
    {
      question: `${withParticle(topic, "은", "는")} 한마디로 무엇인가요?`,
      answer: `${clip(detail, 90)} 핵심 개념만 보면 어렵지 않습니다.`,
    },
    {
      question: "누구에게 해당되는 내용인가요?",
      answer:
        "조건에 따라 대상이 달라집니다. 본인의 계약 내용이나 해당 제도의 안내 기준을 먼저 확인하는 것이 정확합니다.",
    },
    {
      question: "기존과 비교하면 어떤 점이 달라지나요?",
      answer: clip(extra, 90),
    },
    {
      question: "준비하거나 확인해야 할 것이 있나요?",
      answer:
        "적용 시점과 필요한 서류, 문의 창구를 미리 확인해 두면 진행이 수월합니다.",
    },
    {
      question: "더 자세한 내용은 어디에서 볼 수 있나요?",
      answer: "공식 안내 페이지와 관련 자료에서 최신 기준을 확인할 수 있습니다.",
    },
  ];

  const thumbnailTexts = [
    `${topic}, 쉽게 정리`,
    `${topic} 핵심만 3분`,
    `알아두면 달라지는 ${topic}`,
  ];

  const wordpressHtml = buildWordpressHtml({
    title: titles[0],
    summary,
    body,
    faq,
  });

  return {
    titles,
    summary,
    body,
    aeoHeadings,
    metaDescription,
    slug,
    tags,
    faq,
    thumbnailTexts,
    wordpressHtml,
  };
}

/** 본문 문자열("## 소제목" 형식)을 워드프레스용 HTML로 바꿉니다. */
function buildWordpressHtml({
  title,
  summary,
  body,
  faq,
}: {
  title: string;
  summary: string[];
  body: string;
  faq: GeneratedContent["faq"];
}): string {
  const bodyHtml = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line.startsWith("## ")
        ? `  <h2>${escapeHtml(line.slice(3))}</h2>`
        : `  <p>${escapeHtml(line)}</p>`,
    )
    .join("\n");

  const summaryHtml = summary
    .map((item) => `    <li>${escapeHtml(item)}</li>`)
    .join("\n");

  const faqHtml = faq
    .map(
      (item) =>
        `  <h3>${escapeHtml(item.question)}</h3>\n  <p>${escapeHtml(item.answer)}</p>`,
    )
    .join("\n");

  return [
    `<article>`,
    `  <h1>${escapeHtml(title)}</h1>`,
    ``,
    `  <h2>핵심요약</h2>`,
    `  <ul>`,
    summaryHtml,
    `  </ul>`,
    ``,
    bodyHtml,
    ``,
    `  <h2>자주 묻는 질문</h2>`,
    faqHtml,
    `</article>`,
  ].join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * 화면(InputPanel/OutputPanel)에서 호출하는 함수.
 * 지금은 위의 더미 생성기를 그대로 돌려주지만,
 * 나중에는 이 함수 안에서 서버 API(/api/generate)를 호출하면 됩니다.
 */
export async function generateContent(
  input: GenerateInput,
): Promise<GeneratedContent> {
  // 실제 API를 붙이면 네트워크 대기 시간이 생기므로, 미리 비동기로 만들어 둡니다.
  return generateMockContent(input);
}
