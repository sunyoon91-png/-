# KYOBO Thumbnail Maker

교보생명 뉴스룸용 740×400 썸네일을 원본 사진 위에 타이포그래피와 그라데이션만 합성해서 만드는 로컬 웹앱입니다. 사진 자체는 확대/축소·crop·이동만 가능하며, AI 보정/재생성은 하지 않습니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속.

프로덕션 빌드:

```bash
npm run build
npm start
```

## 사용 흐름

1. 사진 업로드 (JPG/PNG/WEBP)
2. 캔버스에서 사진 드래그로 위치 조절, 슬라이더로 확대
3. 제목 입력 (줄바꿈은 입력한 그대로 반영됩니다)
4. 강조할 문구 입력 (제목 중 일치하는 부분만 강조색으로 표시)
5. 필요하면 부제 입력
6. 그라데이션 방향/강도 조절
7. 370×200 축소 미리보기로 가독성 확인
8. JPG 또는 PNG로 저장 (항상 정확히 740×400px)

모든 이미지 처리는 브라우저 Canvas API로 로컬에서만 이루어지며, 서버 업로드나 외부 API 호출은 없습니다.

## 구조

- `src/lib/render.ts` — 미리보기와 export가 동일한 결과를 내도록 하는 단일 Canvas 렌더링 함수
- `src/lib/types.ts` — 상태 타입 및 KYOBO NEWSROOM 기본 프리셋
- `src/components/` — `ThumbnailEditor`(상태 관리) / `CanvasPreview` / `ImageControls` / `TypographyControls` / `GradientControls` / `ExportControls`
