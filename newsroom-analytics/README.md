# 뉴스룸 성과분석

교보생명 뉴스룸 콘텐츠의 조회 및 검색 성과를 분석하고 개선이 필요한 콘텐츠와 다음 행동을 제안하는 내부 업무용 대시보드입니다.

## 실행 방법

```bash
cd newsroom-analytics
npm install
npm run dev
```

`http://localhost:3000` 에서 대시보드를 확인할 수 있습니다.

## 데이터

- 단일 데이터 소스: `public/data/dashboard.json`
- 이 파일만 교체하면 요약 지표, 추이 차트, 콘텐츠 표, 우선 행동이 모두 함께 갱신됩니다.
- 스키마 정의: `lib/types.ts`

## 주요 파일 구조

```
app/
  layout.tsx        루트 레이아웃
  page.tsx          대시보드 페이지 (데이터 로딩, 필터/정렬 상태 관리)
  globals.css        전역 스타일
components/
  Header.tsx          헤더 (제목, 데이터 기준일)
  FilterBar.tsx        기간/카테고리/검색 필터
  SummaryCards.tsx     전체 성과 요약 카드
  TrendChart.tsx       기간별 성과 추이 차트 (최대 2개 지표)
  PriorityActions.tsx  이번 주 우선 행동 (진단 우선순위 기반)
  ContentTable.tsx     콘텐츠별 성과 표 (정렬/필터/모바일 대응)
  ContentDetailPanel.tsx  콘텐츠 상세 패널
  DiagnosisBadge.tsx   성과 진단 배지
lib/
  types.ts     데이터 스키마 타입 정의
  format.ts    숫자/퍼센트/순위/체류시간 포맷 함수
  diagnosis.ts 콘텐츠 자동 진단 규칙 엔진
  filters.ts   필터/정렬 유틸리티
public/data/dashboard.json  샘플 데이터 (단일 데이터 소스)
```

## 성과 진단 규칙

`lib/diagnosis.ts` 에서 현재 필터링된 콘텐츠 집합을 기준으로 각 콘텐츠에 진단을 부여합니다. 우선순위: 제목 개선 → 성과 하락 → 내용 보강 → 확장 추천 → 관찰 필요 → 유지.
