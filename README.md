# Newsroom AI Studio

뉴스룸 콘텐츠 제작을 빠르게 정리하는 개인용 AI 작업 도구입니다.

보도자료, 기존 원고, 인터뷰 메모 같은 원문을 붙여넣으면 제목 후보부터
워드프레스용 HTML까지 10가지 결과를 한 번에 정리해 줍니다.

> **현재 버전(MVP)은 실제 AI를 호출하지 않습니다.**
> 화면과 작업 흐름을 먼저 점검하기 위해, 입력값을 조합한 **샘플(더미) 결과**를 보여 줍니다.
> 실제 AI 연결 방법은 아래 [AI API 연결 위치](#ai-api-연결-위치)에 정리해 두었습니다.

---

## 실행 방법

### 1. Node.js 설치

Node.js **20 이상**(권장: 22)이 필요합니다.
설치되어 있는지 확인하려면 터미널에서 다음을 입력하세요.

```bash
node -v
```

버전이 나오지 않거나 20보다 낮으면 [nodejs.org](https://nodejs.org)에서 LTS 버전을 설치하세요.

### 2. 패키지 설치

프로젝트 폴더에서 한 번만 실행하면 됩니다.

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 브라우저에서 열기

```
http://localhost:3000
```

서버를 끄려면 터미널에서 `Ctrl + C`를 누르세요.

> 참고: `npm run build`는 배포용 빌드를 만들고, `npm run start`는 그 결과를 실행합니다.
> 매일 쓰는 용도라면 `npm run dev`만 알아도 충분합니다.

---

## 사용 흐름

1. 왼쪽 **원문 / 참고자료** 칸에 자료를 붙여넣습니다.
2. **콘텐츠 유형**을 고릅니다. (기본값: 브랜드스토리)
3. **핵심 키워드**를 입력합니다. (선택, 쉼표로 구분)
4. **콘텐츠 생성** 버튼을 누릅니다.
5. 오른쪽에 결과 카드 10개가 표시됩니다.
6. 카드마다 있는 **복사** 버튼, 또는 맨 위의 **전체 복사** 버튼으로 가져갑니다.

입력한 내용은 브라우저에 자동 저장되어, 새로고침해도 사라지지 않습니다.
**초기화** 버튼을 누르면 입력과 결과가 모두 지워집니다.

---

## 프로젝트 구조

```
app/
  layout.tsx          전체 HTML 뼈대 (페이지 제목, 폰트, 공통 스타일)
  page.tsx            메인 화면. 입력값 상태와 버튼 동작을 관리합니다.
  globals.css         Tailwind CSS 불러오기 + 배경색·기본 폰트

components/
  InputPanel.tsx      왼쪽 입력 영역 (유형 선택, 키워드, 원문, 글자 수, 버튼)
  OutputPanel.tsx     오른쪽 결과 영역 (카드 10개 배치, 전체 복사 텍스트 만들기)
  ResultCard.tsx      결과 카드 한 장 + 복사 버튼 (복사 → "복사됨" 표시)

lib/
  types.ts            콘텐츠 유형 목록과 결과 데이터 구조(타입) 정의
  generateContent.ts  샘플 결과를 만드는 로직. ★ 나중에 AI를 붙일 자리

next.config.ts        Next.js 설정
package.json          의존성과 실행 명령
```

### 화면과 파일의 관계

| 화면에서 보이는 것 | 담당 파일 |
| --- | --- |
| 상단 제목과 설명 문구 | `app/page.tsx` |
| 왼쪽 입력 폼 전체 | `components/InputPanel.tsx` |
| 오른쪽 결과 카드 순서·모양 | `components/OutputPanel.tsx` |
| 카드 테두리와 복사 버튼 | `components/ResultCard.tsx` |
| 결과에 들어가는 실제 문장 | `lib/generateContent.ts` |
| 좌우 40:60 비율, 모바일 세로 배치 | `app/page.tsx` |

---

## 수정하기 쉬운 부분

### 콘텐츠 유형 바꾸기

`lib/types.ts`의 `CONTENT_TYPES` 배열만 고치면 드롭다운이 바로 바뀝니다.

```ts
export const CONTENT_TYPES = [
  "보험정보",
  "브랜드스토리",
  // 여기에 항목을 추가하거나 지우면 됩니다.
] as const;

export const DEFAULT_CONTENT_TYPE: ContentType = "브랜드스토리"; // 기본 선택값
```

유형을 추가했다면 `lib/generateContent.ts`의 `TYPE_PRESET`에도 같은 이름으로
항목을 하나 넣어 주세요. 유형별 말투와 기본 태그를 여기서 정합니다.
(빠뜨려도 "기타" 설정이 대신 쓰이므로 오류는 나지 않습니다.)

### 결과 카드(출력 항목) 바꾸기

- **순서 바꾸기 / 카드 빼기** → `components/OutputPanel.tsx`에서 `<ResultCard>` 블록의
  순서를 옮기거나 지웁니다.
- **카드 제목 바꾸기** → 같은 파일의 `title="제목 제안"` 부분을 고칩니다.
- **새 카드 추가하기** → ① `lib/types.ts`의 `GeneratedContent`에 항목을 추가하고
  ② `lib/generateContent.ts`에서 그 값을 만들고 ③ `OutputPanel.tsx`에 `<ResultCard>`를 추가합니다.

### 샘플(더미) 문장 바꾸기

`lib/generateContent.ts`의 `generateMockContent()` 안에 있는
`titles`, `summary`, `body`, `faq` 같은 변수의 문장을 직접 고치면 됩니다.
개수(제목 5개, FAQ 5개 등)도 배열 항목을 더하거나 빼서 조절합니다.

### 화면 문구 바꾸기

- 상단 제목·설명 → `app/page.tsx`
- 입력 칸 라벨과 플레이스홀더 → `components/InputPanel.tsx`
- 결과가 없을 때 안내 문구 → `components/OutputPanel.tsx`
- 브라우저 탭 제목 → `app/layout.tsx`

---

## AI API 연결 위치

**고쳐야 할 파일은 `lib/generateContent.ts` 하나입니다.**

이 파일 맨 아래의 `generateContent()` 함수가 화면과 생성 로직을 잇는 유일한 통로입니다.
화면(`app/page.tsx`)은 이 함수만 호출하므로, 함수 내부만 바꾸면 UI는 손대지 않아도 됩니다.

### 1단계 — 서버 쪽 API 만들기

`app/api/generate/route.ts` 파일을 새로 만들고, 그 안에서 AI 모델을 호출합니다.
응답은 `GeneratedContent` 모양의 JSON으로 돌려주면 됩니다.

```ts
// app/api/generate/route.ts (새로 만들 파일)
import type { GenerateInput, GeneratedContent } from "@/lib/types";

export async function POST(request: Request) {
  const input: GenerateInput = await request.json();

  // 여기서 AI 모델을 호출합니다.
  // API 키는 process.env.ANTHROPIC_API_KEY 처럼 서버 환경변수로만 읽습니다.
  const result: GeneratedContent = await callAiModel(input);

  return Response.json(result);
}
```

### 2단계 — 화면이 부르는 함수 바꾸기

`lib/generateContent.ts`의 `generateContent()` 내부를 다음과 같이 교체합니다.

```ts
export async function generateContent(
  input: GenerateInput,
): Promise<GeneratedContent> {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("콘텐츠 생성에 실패했습니다.");
  return (await res.json()) as GeneratedContent;
}
```

이렇게 하면 흐름이 이렇게 이어집니다.

```
사용자 입력 → generateContent() → /api/generate (서버) → AI 모델
→ GeneratedContent JSON → 화면 카드 렌더링
```

`generateMockContent()`는 지우지 말고 남겨 두면, AI 연결이 안 되는 상황에서
샘플 결과로 화면을 점검할 때 계속 쓸 수 있습니다.

### ⚠️ API 키 주의사항

- API 키는 **반드시 서버에서만** 사용합니다. (`app/api/...` 안)
- `.env.local` 파일에 넣고, 이 파일은 절대 깃에 올리지 않습니다. (`.gitignore`에 이미 등록됨)
- `NEXT_PUBLIC_` 으로 시작하는 환경변수 이름은 브라우저에 그대로 노출되므로
  **API 키에는 절대 쓰지 마세요.**
- `components/`, `app/page.tsx`, `lib/generateContent.ts` 같은 화면 쪽 코드에는
  키를 적지 않습니다.

---

## 기술 스택

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

데이터베이스, 로그인, 외부 라이브러리는 사용하지 않습니다.
상태는 React의 기본 기능만으로 관리하고, 입력값 보관에는 브라우저 `localStorage`를 씁니다.
