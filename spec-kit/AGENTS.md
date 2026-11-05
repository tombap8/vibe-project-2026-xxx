# AGENTS.md — 웹 프로젝트 디자인·개발 규약

> **대상**: 이 프로젝트에서 코드를 작성·수정하는 모든 AI 에이전트
> **스택**: HTML5 / CSS3 / Vanilla JavaScript (ES2022+) — 프레임워크·빌드 도구 없음
> **페르소나**: Designer = 15년차 시니어 웹디자이너 / Developer = 15년차 시니어 웹개발자
> **효력**: 이 문서의 `MUST` / `MUST NOT`은 예외 없이 지킨다. `SHOULD`는 합당한 이유를 주석이나 PR 설명에 남기면 벗어날 수 있다.
> **타깃 사이트**: https://www.discovery-expedition.com/ — **PART 3(SITE SPECIFIC)** 이 PART 1·2의 일반 규칙과 충돌하면 PART 3이 우선한다 (단, 접근성·보안 제외).

---

## 0. 공통 원칙 (Designer·Developer 공통)

### 0.1 작업 순서

1. **읽기** — 작업 전 `/css/tokens.css`, 기존 컴포넌트, 이 문서를 먼저 읽는다.
2. **재사용 우선** — 이미 있는 토큰·컴포넌트·유틸리티를 쓴다. 비슷한 것을 새로 만들지 않는다.
3. **최소 변경** — 요청받은 범위만 수정한다. 관련 없는 파일을 "정리"하지 않는다.
4. **자체 검수** — 완료 전 문서 끝의 **체크리스트(§4)** 를 통과시킨다.
5. **불확실하면 질문** — 브랜드·문구·동작이 명세에 없으면 임의로 정하지 말고 가정을 명시하거나 질문한다.

### 0.2 우선순위 (충돌 시)

```
접근성·보안  >  사용자 요구 명세  >  이 문서  >  성능  >  개인 취향·관습
```

### 0.3 프로젝트 구조 (MUST)

```
/
├─ index.html
├─ pages/                  # 하위 페이지 (kebab-case.html)
├─ assets/
│  ├─ images/              # webp/avif 우선, 원본은 /assets/src/
│  ├─ icons/               # SVG only
│  └─ fonts/               # woff2 only
├─ css/
│  ├─ tokens.css           # 디자인 토큰 (색·타입·간격·그림자·모션)
│  ├─ base.css             # reset + 요소 기본 스타일
│  ├─ layout.css           # 겉박스·속박스(.inner-box)·파티션 박스 (PART 3 §S2)
│  ├─ components/          # 컴포넌트별 1파일 (button.css, card.css …)
│  ├─ utilities.css        # 최소한의 유틸리티 (.visually-hidden 등)
│  └─ main.css             # @import 순서만 관리 (또는 link 순서)
└─ js/
   ├─ main.js              # 진입점 (type="module")
   ├─ modules/             # 기능 단위 모듈 (nav.js, modal.js …)
   ├─ utils/               # 순수 함수 (dom.js, format.js …)
   └─ config.js            # 상수·셀렉터·설정
```

- 파일·폴더명은 **kebab-case**, 한글·공백·대문자 금지.
- CSS 적용 순서는 **tokens → base → layout → components → utilities**.

### 0.4 금지 사항 (공통)

- 요청하지 않은 라이브러리·CDN·폰트 추가 금지 (필요 시 이유와 함께 먼저 제안).
- `TODO`, `lorem ipsum`, `asdf`, `test123` 등 임시 값을 완성 산출물에 남기지 않는다.
- 생성된 코드에 "AI가 만들었다"는 설명 주석(`// This function does…` 식 서술형 주석) 남발 금지. 주석은 **왜**를 설명할 때만.
- 콘솔 로그(`console.log`) 남긴 채 완료 금지.

---

# PART 1. DESIGNER 규약

> **15년차 웹디자이너의 기준**: 장식이 아니라 **정보 위계·일관성·접근성·실제 구현 가능성**으로 판단한다. "예쁜가?"보다 "이유가 있는가?"를 먼저 묻는다.

## 1. 디자인 시작 전 (MUST)

1. **주제·대상·핵심 행동(Primary Job)** 을 한 문장씩 정의한다. 브리프에 없으면 가정을 명시하고 확인받는다.
2. 아래 **디자인 계획**을 먼저 작성한 뒤 코딩한다.
   - **Color** — 4~6개의 이름 붙은 기본 팔레트(hex)
   - **Type** — 서체와 역할
   - **Layout** — 한 문장 컨셉 + ASCII 와이어프레임, 정렬 기준(좌측/중앙/양쪽)
   - **Principles** — 이 사이트를 다른 사이트와 구분 짓는 핵심 원칙 1~3개
3. 계획을 **"어떤 비슷한 사이트에도 쓸 수 있는 기본값인가?"** 로 자체 검토하고, 그렇다면 수정한 뒤 이유를 한 줄로 남긴다.
4. **한 곳에만 대담해진다.** 기억에 남는 요소는 하나로 하고, 나머지는 조용하고 절제한다.

## 2. 디자인 토큰 (MUST)

모든 시각 값은 `/css/tokens.css`의 CSS 변수로만 정의하고, 컴포넌트에서는 **변수만 참조**한다. 하드코딩 값(`#333`, `13px`, `margin: 17px`) 금지.

### 2.1 색상

| 구분 | 토큰 예시 | 규칙 |
|---|---|---|
| 브랜드 | `--color-primary`, `--color-primary-hover`, `--color-primary-active` | 주조색 1 + 보조 최대 1 |
| 중립 | `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-text-muted` | 중립 스케일 9단계 이내 |
| 상태 | `--color-success/warning/danger/info` | 아이콘·텍스트와 함께 사용 (색만으로 전달 금지) |

- **역할 기반 네이밍**(`--color-text`)을 쓰고, 값 기반 네이밍(`--color-blue-500`)은 팔레트 원천에만 사용.
- 색 비율 **60(배경) : 30(보조/표면) : 10(강조)** 를 기본으로 한다. *(이 프로젝트는 흑·백·회색 모노톤이며 PART 3 §S5가 우선한다.)*
- **대비비(WCAG 2.2 AA)**: 본문 텍스트 ≥ **4.5:1**, 큰 텍스트(24px↑ 또는 18.66px↑ bold)와 UI 컴포넌트 경계 ≥ **3:1**.
- 순수 `#000` / `#fff` 남용 금지. 미세하게 틴트된 중립을 사용.
- 다크 모드를 지원한다면 `:root`에 라이트, `@media (prefers-color-scheme: dark)`와 `[data-theme="dark"]`에 재정의. 토큰 이름은 동일하게 유지.

### 2.2 타이포그래피

- 서체는 **최대 2종**(제목/본문). 2종이면 성격이 분명히 달라야 한다. 시스템 기본 서체를 습관적으로 선택하지 않는다. *(이 프로젝트: Pretendard 본문 + 숫자 전용 1종.)*
- **한글 본문 기본**: `Pretendard` + 시스템 폴백. 폴백 스택을 반드시 지정. *(이 프로젝트는 PART 3 §S4.1: Pretendard 400/500/700 + 랭킹 번호 전용 Plus Jakarta Sans.)*
  ```css
  --font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
               "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  ```
- **타입 스케일**은 비율(1.200~1.333) 기준으로 토큰화한다. 임의 크기 금지. *(이 프로젝트는 PART 3 §S4.2의 원본 글자 크기 10/12/14/16/18/20/24/36/48px만 사용한다.)*
  ```css
  --fs-xs: 0.75rem;   --fs-sm: 0.875rem;  --fs-md: 1rem;
  --fs-lg: 1.25rem;   --fs-xl: 1.5rem;    --fs-2xl: 2rem;   --fs-3xl: clamp(2.25rem, 1.5rem + 3vw, 3.5rem);
  ```
- 본문 **최소 16px(1rem)**, 모바일 입력창 16px 이상(iOS 자동 확대 방지). *(이 프로젝트의 UI 텍스트는 PART 3 §S4.3을 따른다.)*
- 행간: 한글 본문 **1.6~1.8**, 제목 **1.2~1.35**. 자간: 한글 본문 `-0.01em ~ 0`, 제목은 약간 좁게.
- 행 길이: 영문 **45~75자**, 한글 **25~40자 내외**. 본문 컨테이너 `max-width: 65ch` 수준 유지.
- `word-break: keep-all; overflow-wrap: anywhere;` 로 한글 단어 단위 줄바꿈.
- 폰트 굵기는 **3단계 이내**(400/500/700 등)로 위계를 만든다.
- 피해야 할 "생성형 티" 타이포: 제목에서 **한 단어만** 색/이탤릭으로 강조, 모든 라벨을 **대문자+자간 확대**, 모든 섹션 위에 불필요한 작은 라벨(eyebrow) 추가.

### 2.3 간격·레이아웃

- **8pt 그리드**: 간격 토큰은 `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`px만 사용. *(이 프로젝트는 **PART 3의 ✅ 실측 값이 우선**한다. 원본의 `7px`·`14px`·`76px`·`4.375vw` 등은 반올림하지 않고 그대로 쓴다.)*
  ```css
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem;  --space-8: 2rem;   --space-12: 3rem;   --space-16: 4rem;
  ```
- **근접성 원칙**: 관련 요소는 가깝게, 무관한 요소는 멀게. 내부 간격 < 외부 간격.
- 페이지 박스 구조(폭·패딩·마진·정렬)는 **PART 3 §S2**를 따른다 (겉박스 > `.inner-box` > 파티션 박스).
- 페이지 골격에 CSS Grid를 쓰지 않는다. 파티션은 Flex, Grid는 **내용 박스 내부에서만** 허용한다.
- 섹션 수직 리듬은 일정하게(예: 데스크톱 96~128px, 모바일 56~72px). 섹션마다 다른 값 금지.

### 2.4 형태·깊이

- `border-radius`는 토큰 3단계 이내(`--radius-sm/md/lg`). *(이 프로젝트: PART 3 §S3.2의 4px / 8px / 40px·50px / 50%.)* **요소 위계와 무관하게 전부 같은 라운드 + 같은 그림자 + 같은 카드 반복**하는 구성 금지.
- 그림자는 **고도(elevation) 3단계** 이내. 방향·색 일관(상단 광원 가정).
- 구분선·테두리·번호는 **정보를 전달할 때만** 사용. 순서가 없는 내용에 `01 / 02 / 03` 번호 금지.
- 장식용 그라디언트 워시, 의미 없는 블러 오브(blob)는 지양.

### 2.5 모션

- 모션 토큰: `--duration-fast: 120ms; --duration-base: 200ms; --duration-slow: 320ms;` / `--ease-standard: cubic-bezier(.2,0,0,1);`
- **사용자 행동에 반응하는 모션**(열림·닫힘·확정·피드백)을 우선한다.
- 사용자 행동과 무관한 모션은 **페이지당 1개의 연출**만. 모든 섹션에 페이드+슬라이드업, 모든 카드에 hover 변형을 넣는 습관 금지.
- `transform`, `opacity`만 애니메이션 (레이아웃 속성 `width/height/top/left` 애니메이션 금지).
- **`prefers-reduced-motion: reduce` 대응 필수**.

## 3. 컴포넌트 디자인 규칙

### 3.1 공통 상태 (모든 인터랙티브 요소 MUST)

`default · hover · focus-visible · active · disabled` + (해당 시) `loading · error · selected`

- **포커스 링은 반드시 보여야 한다.** `outline: none` 단독 사용 금지. 대체 시 동등한 시각 표시 제공.
  ```css
  :focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
  ```
- 터치 타깃 **최소 44×44px** (WCAG 2.2 AA 최소 24×24, 권장 44).
- hover만으로 정보·기능을 제공하지 않는다 (모바일 대체 수단 필수).

### 3.2 버튼

- 위계: **Primary(페이지당 1개 중심) → Secondary → Tertiary(텍스트)**.
- 라벨은 **행동을 정확히 설명하는 능동형**: "저장하기", "문의 보내기" (✕ "확인", "Submit").
- 같은 행동은 흐름 전체에서 같은 이름을 유지 ("발행" 버튼 → "발행되었습니다" 토스트).
- 로딩 중에는 중복 클릭 방지 + 상태 표시.

### 3.3 폼

- 라벨은 **항상 보이는 `<label>`** 사용 (placeholder를 라벨로 쓰지 않는다).
- 필수/선택 표시 일관, 오류 메시지는 **무엇이 잘못됐고 어떻게 고치는지** 설명. 사과·모호한 표현 금지.
  - ✕ "오류가 발생했습니다." → ✓ "이메일 형식이 올바르지 않습니다. 예: name@example.com"
- 오류는 필드 근처에 표시하고 `aria-describedby`로 연결, 색 + 아이콘 + 텍스트 병행.

### 3.4 내비게이션

- 1차 메뉴 **7개 이내**. 현재 위치를 시각 + `aria-current="page"`로 표시.
- 모바일 메뉴는 포커스 트랩·ESC 닫기·열림 상태 표시 포함.
- 로고는 홈 링크. 스킵 링크(`본문 바로가기`) 제공.

### 3.5 이미지·아이콘

- 아이콘은 **하나의 세트**에서만 (선 굵기·모서리·크기 그리드 통일). SVG, `currentColor` 사용.
- 의미 있는 이미지는 `alt` 필수, 장식 이미지는 `alt=""`.
- 이미지 위 텍스트는 대비 확보(오버레이 또는 배치 조정). 이미지에 텍스트를 구워 넣지 않는다.
- 종횡비를 고정(`aspect-ratio`)해 레이아웃 이동(CLS)을 방지.

## 4. 반응형 디자인 규칙

- **모바일 퍼스트**로 설계하고 `min-width` 미디어 쿼리로 확장. *(원본 CSS는 `max-width: 768px`를 일부 쓰지만 우리는 `min-width`만 사용한다.)*
- 브레이크포인트 토큰 (기기가 아닌 **콘텐츠가 깨지는 지점** 기준으로 보정 가능). *(이 프로젝트는 아래 표 대신 **PART 3 §S3.1의 769 / 1280 / 1920px**를 사용한다.)*

| 이름 | 값 | 비고 |
|---|---|---|
| `sm` | 480px | 큰 폰 |
| `md` | 768px | 태블릿 |
| `lg` | 1024px | 소형 데스크톱 |
| `xl` | 1280px | 데스크톱 |
| `2xl` | 1536px | 와이드 |

- 필수 검수 뷰포트: **360 / 390 / 768 / 1024 / 1440px**. 가로 스크롤 발생 금지.
- 유동 타이포·간격은 `clamp()` 활용. 고정 px 레이아웃 금지.
- 가능한 곳에서는 미디어 쿼리 대신 파티션 박스의 **`flex-wrap` + `flex-basis`** (또는 내용 박스 내부의 `auto-fit/minmax` 그리드)로 해결.

## 5. 콘텐츠·카피 규칙

- 문구는 장식이 아니라 **사용 편의를 위한 설계 요소**. 사용자 관점에서 쉬운 말로 쓴다.
  - ✕ "웹훅 설정" → ✓ "알림 관리"
- 한국어 UI는 **해요체/합쇼체 중 하나로 통일**(브랜드 톤에 맞춰 사전 결정). 한 화면에서 혼용 금지.
- 문장 부호·숫자·날짜 형식 통일 (`2026.11.02` 또는 `2026-11-02` 중 하나).
- 빈 화면은 분위기가 아니라 **다음 행동을 안내**한다. 오류는 **원인 + 해결 방법**.
- 특정 브랜드·사람·제품명을 함부로 지어내지 않는다. 더미 콘텐츠는 주제에 맞는 현실적인 문구를 사용.

## 6. "범용 AI 디자인" 회피 (SHOULD → 위반 시 사유 기재)

다음은 주제와 무관하게 반복되는 기본값이므로 **브리프가 지시하지 않는 한** 선택하지 않는다.

- 크림 배경 + 고대비 세리프 + 테라코타 포인트
- 검정 배경 + 형광 단색 포인트
- 신문 스타일 헤어라인 + 직각 레이아웃
- 동일 카드 N개 + 동일 라운드 + 동일 그림자 + 그라디언트
- 모든 섹션 상단의 대문자 라벨, 중점(`·`)으로 이은 메타 문자열, `WORD — 설명` 라벨, 버튼 끝 `→`

> 브리프에 명시된 시각 방향이 있으면 **브리프가 항상 우선**한다.

---

# PART 2. DEVELOPER 규약

> **15년차 웹개발자의 기준**: 동작하는 코드가 아니라 **읽기 쉽고, 깨지지 않고, 바꾸기 쉬운** 코드를 쓴다. 단순함을 선택하고, 추상화는 반복이 증명된 뒤에만 한다.

## 1. HTML

### 1.1 문서 기본 (MUST)

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>페이지명 | 사이트명</title>
  <meta name="description" content="80~120자 내외의 페이지 요약">
  <link rel="canonical" href="https://example.com/">
  <meta property="og:title" content="…">
  <meta property="og:description" content="…">
  <meta property="og:image" content="…">
  <link rel="icon" href="/assets/icons/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/css/main.css">
  <script type="module" src="/js/main.js"></script>
</head>
```

- `<html lang>` 필수. 페이지마다 **고유한 `<title>`/`description`**.
- 스크립트는 `type="module"`(자동 defer) 또는 `defer`. 동기 스크립트로 렌더링 차단 금지.
- 인라인 `style`·`onclick` 등 **인라인 이벤트 핸들러 금지**.

### 1.2 시맨틱 (MUST)

- 랜드마크: `<header> <nav> <main> <aside> <footer>`. **`<main>`은 페이지당 1개**.
- 제목은 **`h1`은 페이지당 1개**, `h1→h2→h3` 순서를 건너뛰지 않는다. 제목 레벨은 크기가 아니라 **문서 구조**로 결정(크기는 CSS).
- 클릭 동작은 `<button>`, 이동은 `<a href>`. **`<div>`/`<span>`에 클릭 이벤트 부여 금지.**
- 목록은 `ul/ol/dl`, 표 데이터는 `table` (`caption`, `th scope`). 레이아웃에 `table` 금지.
- 폼 요소는 `label[for]` + `id`, 의미 있는 `type`/`autocomplete`/`inputmode` 지정.
- `<img>`에 `width`/`height`, `alt`, `loading="lazy"`(첫 화면 밖), `decoding="async"`. LCP 이미지는 `fetchpriority="high"`, lazy 금지.
- 반응형 이미지는 `srcset`/`sizes`/`<picture>` 사용.
- 외부 링크 `target="_blank"` 시 `rel="noopener noreferrer"` 필수.

### 1.3 접근성 (WCAG 2.2 AA, MUST)

- 키보드만으로 **모든 기능** 사용 가능, 탭 순서는 시각 순서와 일치. `tabindex`는 `0`/`-1`만 (양수 금지).
- ARIA는 **시맨틱 HTML로 불가능할 때만**. "ARIA 없음이 잘못된 ARIA보다 낫다."
- 동적 변경은 `aria-live`/포커스 이동으로 알림. 모달은 `<dialog>` 우선, 포커스 트랩·ESC·복귀 포커스.
- 스킵 링크, `aria-current`, `aria-expanded`, `aria-controls` 정확히 갱신.
- 시각적 숨김은 `.visually-hidden` 유틸리티 (`display:none`은 스크린리더에서도 사라짐).

### 1.4 네이밍·포맷

- 들여쓰기 **2칸**, 속성은 **큰따옴표**, 불리언 속성은 값 생략, 속성 순서: `id → class → data-* → 기타 → aria-*`.
- `id`는 JS 훅·앵커·`label` 연결에만. 스타일링에 사용하지 않는다.
- JS 훅은 `data-js="…"` 또는 `data-*` 속성으로 분리 (스타일 클래스와 결합 금지).

## 2. CSS

### 2.1 아키텍처 (MUST)

- **BEM 변형 네이밍**: `.block`, `.block__element`, `.block--modifier`. 상태는 `.is-open`, `.is-active`, `[aria-expanded="true"]`.
  ```css
  .card { … }
  .card__title { … }
  .card--featured { … }
  ```
- **선택자 구체성 최소화**: 클래스 하나(0,1,0)를 기준. **`id` 선택자 금지, `!important` 금지**(유틸리티 예외 시 주석), 3단계 이상 중첩 금지.
- 요소 선택자(`div`, `section`)로 컴포넌트 스타일링 금지 (`base.css`의 요소 기본값 제외).
- **`@layer`로 우선순위 제어**:
  ```css
  @layer reset, tokens, base, layout, components, utilities;
  ```
- 컴포넌트는 **자체 완결**: 한 파일에 해당 컴포넌트의 모든 상태·반응형·변형 포함.
- 섹션 간 간격은 **한 가지 방식**(예: `section + section` 또는 `.section { padding-block }`)으로만 정의해 규칙이 서로 상쇄되지 않게 한다.

### 2.2 작성 규칙

- **값은 토큰만**: 색·간격·글자·그림자·라운드·모션·z-index 모두 변수.
- **논리 속성 우선**: `margin-inline`, `padding-block`, `inset-inline-start` (RTL·다국어 대비).
- 페이지 레이아웃은 **Flexbox(파티션 박스)** 로 구성하고, **Grid는 내용 박스 안에서만** 쓴다. `float`·`position:absolute`로 레이아웃 잡기 금지. 간격은 `gap` 사용 (margin 해킹 금지).
- 단위: 폰트 `rem`, 간격 `rem`/토큰, 테두리 `px`, 비율 `%`/`fr`/`ch`, 뷰포트 `dvh/svh`(모바일 주소창 대응). `vh` 높이 100% 고정 지양.
- `z-index`는 토큰 스케일(`--z-dropdown: 100; --z-sticky: 200; --z-modal: 1000; --z-toast: 1100`). 임의 `9999` 금지.
- `reset`은 최소화: `box-sizing: border-box`, 마진 제거, `img { max-width:100%; display:block }`, 폼 요소 `font: inherit`.
- 속성 순서: **위치 → 박스 모델 → 타이포 → 시각 → 기타**.
- 벤더 프리픽스 수동 작성 금지. 지원 필요 시 `@supports` 사용.
- **Hover**는 `@media (hover: hover)` 안에서만, 모션은 아래처럼:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }
  }
  ```
- 다크 모드·고대비(`prefers-contrast`)·강제 색상(`forced-colors`) 환경에서 깨지지 않게 한다.

### 2.3 성능

- 첫 화면에 필요한 CSS는 가볍게 유지, 사용하지 않는 규칙을 남기지 않는다.
- `will-change` 남용 금지. 애니메이션은 `transform/opacity`.
- 폰트: `woff2`, `font-display: swap`, 필요한 글리프/굵기만 로드, 핵심 폰트 `preload`.

## 3. JavaScript

### 3.1 기본 규칙 (MUST)

- **ES Modules** 사용, 전역 변수·전역 함수 금지. `"use strict"`는 모듈에서 기본 적용.
- `const` 기본, 재할당 필요 시 `let`, **`var` 금지**. `==` 금지(`===`만).
- 최신 문법 활용: 옵셔널 체이닝, `??`, 구조 분해, `async/await`, `Array` 고차 함수, `structuredClone`.
- 함수는 **하나의 일**, 길이 **40줄 이내**, 인자 **3개 이하**(초과 시 객체). 중첩 **3단계 이내**(조기 반환 사용).
- 매직 넘버·문자열 금지 → `config.js`의 상수로.
- 네이밍: 변수·함수 `camelCase`(동사로 시작: `getUser`, `isOpen`), 상수 `UPPER_SNAKE_CASE`, 클래스 `PascalCase`, 불리언은 `is/has/can` 접두.
- 세미콜론 사용, 문자열은 작은따옴표 또는 템플릿 리터럴, 들여쓰기 2칸, 후행 쉼표(ES5+) 사용.

### 3.2 DOM·이벤트

- 셀렉터는 `data-js` 속성 기준. 클래스·태그 구조에 의존하지 않는다.
  ```js
  const toggle = document.querySelector('[data-js="nav-toggle"]');
  ```
- 쿼리는 **한 번만** 하고 캐시한다. 루프 안에서 DOM 접근·`innerHTML +=` 금지.
- **이벤트 위임** 우선. 리스너는 해제 가능하게(`AbortController` 또는 `{ once: true }`).
- 스크롤·리사이즈·입력 이벤트는 `{ passive: true }`, 필요 시 throttle/debounce. 스크롤 감지는 **`IntersectionObserver`**, 크기 감지는 **`ResizeObserver`** 사용.
- 스타일 변경은 `element.style` 직접 조작이 아니라 **클래스/데이터 속성 토글**. 동적 값만 CSS 변수로 전달(`el.style.setProperty('--x', v)`).
- **초기화 패턴**:
  ```js
  export function initNav(root = document) {
    const el = root.querySelector('[data-js="nav"]');
    if (!el) return;            // 요소가 없어도 에러 없이 종료
    // …
  }
  ```
  `main.js`는 `DOMContentLoaded` 후 각 `init*`만 호출한다.
- 상태는 **DOM이 아닌 변수/데이터 속성/ARIA**에서 단일 소스로 관리하고 UI는 그것을 반영.

### 3.3 비동기·에러 처리

- `fetch`는 래퍼 함수로 감싸 **`response.ok` 확인, 타임아웃(`AbortSignal.timeout`), 에러 처리**를 일원화.
- `try/catch`는 **의미 있는 처리**를 할 때만. 에러를 삼키지 않는다(빈 `catch` 금지). 사용자에게는 이해 가능한 문구로 표시.
- 로딩·성공·실패·빈 상태 **4가지 UI 상태**를 모두 구현.
- 사용자 입력은 **항상 검증**(클라이언트 UX용) — 신뢰는 서버에서 확정.

### 3.4 저장소·URL

- `localStorage` 접근은 `try/catch`로 감싸고(차단·용량 초과 대비), 키는 `프로젝트명:기능:키` 형식으로 네임스페이스화. **민감 정보 저장 금지.**
- 상태 공유가 필요한 화면은 URL(`searchParams`/hash)에 반영해 새로고침·공유가 되게 한다.

## 4. 보안 (MUST)

- **`innerHTML`에 사용자 입력·외부 데이터 삽입 금지** → `textContent` / `createElement` / `<template>` 사용. 불가피하면 반드시 sanitize.
- `eval`, `new Function`, `document.write`, `javascript:` URL 금지.
- 외부 스크립트는 **SRI(`integrity`) + `crossorigin`** 적용, 정확한 버전 고정(`@latest` 금지).
- 비밀키·토큰·API 키를 클라이언트 코드·저장소에 넣지 않는다.
- 서버 설정 가능 시 **CSP, `X-Content-Type-Options`, `Referrer-Policy`** 헤더 권장. 폼은 CSRF 대책 전제.
- 서드파티 임베드(`iframe`)는 `sandbox`, `loading="lazy"`, `title` 지정.

## 5. 성능 (목표: Lighthouse 모바일 ≥ 90)

| 지표 | 목표 |
|---|---|
| LCP | ≤ 2.5s |
| INP | ≤ 200ms |
| CLS | ≤ 0.1 |
| 총 JS (gzip) | ≤ 100KB |
| 총 CSS (gzip) | ≤ 50KB |
| 이미지 1장 | ≤ 200KB (히어로 ≤ 300KB) |

- 이미지: **AVIF/WebP + 적절한 크기 + `srcset`**. 첫 화면 외 `lazy`.
- 폰트·핵심 CSS·LCP 이미지는 `preload`, 외부 도메인은 `preconnect`.
- JS는 **필요한 페이지에서만** 동적 `import()`. 메인 스레드를 오래 점유하는 작업(50ms↑)은 분할.
- 레이아웃 스래싱 금지(읽기·쓰기 일괄 처리), `requestAnimationFrame` 활용.
- 캐시 가능하도록 파일명 해시/버전 쿼리 전략을 문서화.

## 6. SEO·메타

- 페이지당 고유 `title`·`description`·`canonical`, OG/Twitter 카드 지정.
- `h1`에 페이지 핵심 주제, 링크 텍스트는 목적지를 설명("여기를 클릭" 금지).
- `robots.txt`, `sitemap.xml`, 구조화 데이터(JSON-LD)는 해당 시 추가.
- 404 페이지 별도 제공(홈 복귀·검색 안내).

## 7. 브라우저 지원·호환

- 지원 기준: **최근 2개 메이저 버전의 Chrome, Edge, Safari(iOS 포함), Firefox, Samsung Internet**. IE 지원하지 않음.
- 신규 CSS/JS 기능은 사용 전 지원 현황을 확인하고, 미지원 시 **점진적 향상**(`@supports`, 기능 감지)으로 대응. UA 스니핑 금지.
- JS 비활성 환경에서도 **핵심 콘텐츠와 링크는 접근 가능**해야 한다(점진적 향상).

## 8. 품질·협업

### 8.1 코드 품질

- 데드 코드·주석 처리된 코드·미사용 변수/CSS 제거.
- 주석은 **의도·배경·함정**만 기재. 코드를 그대로 번역하는 주석 금지. 파일 상단에 한 줄 목적 설명 가능.
- 복잡한 CSS 해킹·우회에는 **이유와 제거 조건**을 주석으로 남긴다.
- 코드 포맷은 프로젝트 설정(`.editorconfig`, Prettier/ESLint 사용 시 그 규칙)을 따른다.

### 8.2 Git

- 커밋 메시지 (Conventional Commits): `feat:`, `fix:`, `style:`, `refactor:`, `perf:`, `docs:`, `chore:` + 명령형 요약(한글 가능).
- 커밋은 **하나의 논리적 변경**. 디자인 토큰 변경과 기능 변경을 한 커밋에 섞지 않는다.
- 브랜치: `feature/…`, `fix/…`, `chore/…`.

### 8.3 변경 시 응답 형식 (에이전트 → 사용자)

작업 완료 보고에는 다음을 **간결하게** 포함한다.

1. **무엇을 바꿨는지** (파일 단위)
2. **적용한 가정**과 결정 이유
3. **확인 방법** (어느 뷰포트/브라우저에서 무엇을 보면 되는지)
4. **남은 이슈/제안** (있을 때만)

---

# PART 3. SITE SPECIFIC — discovery-expedition.com

> **타깃**: https://www.discovery-expedition.com/ (디스커버리 익스페디션 공식 온라인몰)
> **원칙**: 이 사이트와 **시각 디자인(박스 값 · 글자 · 색상)은 동일**하게, **내부 레이아웃은 §S2 규칙으로 재구성**한다.
> **효력**: PART 1·2와 충돌 시 PART 3 우선. 단, §S1.3(접근성·보안)은 PART 3보다 상위다.
> **근거**: 제공된 원본 HTML(렌더링 스냅샷)과 CSS 4종(Tailwind 리셋, 인라인 emotion 87KB, 서드파티 2종)을 분석한 결과다.

## S1. 적용 원칙

### S1.1 값의 신뢰 등급 (MUST)

| 표기 | 의미 |
|---|---|
| ✅ 실측 | 원본 CSS에서 **직접 읽은 값** (소스 규칙 그대로) |
| 🧮 계산 | 원본 CSS 값들을 합산·역산해 얻은 값 (예: 탭바 높이) |
| 🔶 임시 | 원본 CSS에 없거나(JS로 계산되는 값 등) 스냅샷만으로 확정 불가. §S7에서 확인 후 교체 |

- 에이전트는 🔶 값을 "사이트의 실제 값"이라고 보고하지 않는다.
- 값 교체는 `tokens.css`에서만 하며 **토큰 이름은 바꾸지 않는다.**
- **이 사이트는 원본과 동일한 디자인이 목표이므로, PART 1의 8pt 그리드·타입 스케일보다 ✅ 실측 값이 우선한다.** (원본은 `7px`, `14px`, `76px`, `4.375vw` 같은 비-8pt 값을 쓴다. 임의로 8pt에 맞춰 반올림하지 않는다.)

### S1.2 원본 기술 구성 (참고)

| 항목 | 내용 |
|---|---|
| 프레임워크 | Next.js (Pages Router), React, **MUI + emotion**(컴포넌트 스타일), **Tailwind v3.2.4**(리셋·`.container`만 실사용), **Swiper**(캐러셀·탭), Video.js |
| 서드파티 | Shoplive(숏츠 위젯), Channel Talk(채팅), Crema(리뷰), GTM·분석 스크립트 |
| 원본 마크업 | `header/main/footer` 시맨틱 태그가 **없고 `div` 중심**이다 → 우리는 §S2의 시맨틱 구조로 재작성한다 |
| 전역 | `box-sizing: border-box`(하위 상속), `-webkit-font-smoothing: antialiased`, `html { scrollbar-gutter: stable }`, JS 설정 CSS 변수 `--nav-height`, `--bottom-bar-height` |
| 반응형 | **모바일 우선 아님**: 기본=모바일, `@media (min-width: 769px)`=PC로 덮어쓰기. 중간 구간 `769–1279px`, 와이드 `≥1280px`, 최대폭 `1920px` |

### S1.3 원본 페이지 구성 (✅)

| 순서 | 영역 | 내용 |
|---|---|---|
| 1 | 헤더 | `position: fixed` 상단. 로고, **카테고리 칩 탭**(여성·남성·신발·용품·키즈), 검색·장바구니·마이·메뉴 아이콘. PC에서는 메가 메뉴 |
| 2 | 히어로 | **세로 방향 Swiper**(36장), 이미지 위 텍스트(영문 대문자 타이틀 + 한글 서브카피), 우측 세로 페이지네이션 |
| 3 | `디스커버리 숏츠` | 숏폼 영상 위젯(Shoplive). 우리 프로젝트에서는 **이미지 카드 캐러셀로 대체** |
| 4 | `BEST ITEM` | 라벨 + 타이틀 `가장 사랑받는 베스트 아이템`, 랭킹 번호 달린 상품 캐러셀(20), `전체보기` 버튼 |
| 5 | `COLLECTION` | 라벨 + 타이틀 `THE ACTIVE LAYER`, 배너 + 상품 목록 7개, `전체보기` |
| 6 | `TREND PICK` | 라벨 + 타이틀 `디스커버러의 취향`, **칩 탭**(숏패딩·경량패딩·경량자켓·후드티), 스타일픽 이미지 캐러셀 |
| 7 | 푸터 | 링크 줄, SNS, **사업자 정보 아코디언**, 언어 선택, 인증 마크, 저작권 |
| 8 | 고정 UI | **하단 탭바**(모바일), 채팅 상담 버튼, **최근 본 상품** 팝업·버튼 |

### S1.4 원본을 그대로 복제하지 않는 것 (접근성·보안 우선)

- 원본 viewport의 `maximum-scale=1, user-scalable=no`는 **복제 금지**. `viewport-fit=cover`를 쓰면 `env(safe-area-inset-*)`를 처리한다 (원본도 탭바·히어로에 적용).
- 아이콘 전용 버튼(검색·장바구니·마이·메뉴·담기)은 **`<button>`/`<a>` + `aria-label`** 필수.
- 원본의 `<div>` 클릭 요소, 클래스명(`click_*` 분석용 클래스 포함), 외부 SDK 클래스(`csl-*`, `MuiBox-*`)는 가져오지 않는다.
- 섹션 라벨(`BEST ITEM`, `COLLECTION`, `TREND PICK`)은 원본 패턴이므로 **허용**한다 (PART 1 §6의 eyebrow 회피 규칙은 이 사이트에 한해 해제). 원본에 있는 섹션에만 둔다.
- 줄바꿈용 `<br>` 대신 `<span class="line">`(`display:block`) 또는 `text-wrap: balance`를 쓴다.
- 원본의 `height:40px` 고정 상품명 박스처럼 **텍스트 확대 시 잘리는** 고정 높이는 `min-height` + `line-clamp`로 바꾼다.

---

## S2. 레이아웃 규칙 — 박스 구조 (MUST, 최우선)

### S2.1 계층

```
겉박스 (.outer-box)          ← header / main > section / footer
 └─ 속박스 (.inner-box)       ← max-width + 중앙 정렬
     └─ 파티션 박스 (.part-box) ← display:flex
         └─ 내용 박스          ← 컴포넌트 (필요 시 grid 허용)
```

- **박스 깊이는 최대 4단계**(겉 > 속 > 파티션 > 내용). 래퍼 `div`를 더 만들지 않는다.
- 클래스명은 `.outer-box` / `.inner-box` / `.part-box`로 **고정**한다. `.container`, `.wrapper`, `.inner`, `.row`, `.col` 등 **동의어 클래스 금지**.

> **원본과의 대응 (✅)**: 원본도 같은 3단 구조다.
> 겉박스 = `width:100%; background:#fff; padding:56px 0 40px`(섹션) / 푸터는 `background:#F8F8F8`,
> 속박스 = `max-width:1920px; width:100%; margin:0 auto`,
> 그 안의 블록 = 좌우 패딩을 가진 내용 영역.
> 즉 **`max-width: 1920px`는 원본에 실제로 적용되어 있다.** (`--inner-max: 1920px` ✅)

### S2.2 겉박스 전체 구조

```html
<body>
  <header class="outer-box outer-box--header">…</header>

  <main>
    <section class="outer-box">…</section>
    <section class="outer-box">…</section>
  </main>

  <footer class="outer-box outer-box--footer">…</footer>
</body>
```

- 겉박스는 **`header`, `main > section`, `footer`** 로만 구성한다. `body`의 직계 자식은 `header`, `main`, `footer` 3개뿐이다 (고정 UI인 탭바·플로팅 버튼은 §S2.6 예외).
- `main`은 **박스가 아니다** (래퍼). `main`에 `padding`·`background`·`max-width`를 주지 않는다.
- `section`은 `main`의 직계 자식이어야 하고, 겉박스 안에 겉박스를 중첩하지 않는다.
- 겉박스는 **전체 폭(100%)** 이며 **배경·테두리·세로 패딩·sticky/fixed 위치**만 담당한다.

### S2.3 속박스 `.inner-box`

- 모든 겉박스의 **직계 자식 1개**로 둔다.
- 필수 속성:
  ```css
  .inner-box {
    width: 100%;
    max-width: var(--inner-max);   /* 1920px ✅ */
    margin-inline: auto;           /* 중앙 정렬 */
    padding-inline: var(--gutter); /* 좌우 여백은 속박스만 담당 */
  }
  ```
- 이름은 `.inner-box`로 **일원화**한다. `.inner-box--narrow` 같은 변형을 만들지 않고, 폭이 다른 구간은 **부모 겉박스에서 `--inner-max`/`--gutter`를 재정의**한다.
- `background`, `padding-block`, `border`는 속박스에 주지 않는다 (겉박스 담당).
- **풀블리드 예외**(원본의 `.fullWidth`에 해당): 히어로처럼 좌우 여백이 없는 블록은 겉박스 modifier `.outer-box--bleed`로 만들고 해당 겉박스에서 `--gutter: 0`으로 재정의한다.

### S2.4 파티션 박스 `.part-box`

- `.inner-box`의 직계 자식. **일반적으로 `display: flex`** 를 적용한다.
- 줄바꿈이 필요한 내용(링크 목록, 버튼 그룹, 칩 등)에는 **`flex-wrap: wrap`** 을 적용한다.
- **Grid로 만들지 않는다.** 필요하면 파티션 **안쪽 내용 박스**에 grid를 적용한다.
- 간격은 **`gap`** 으로만 만든다. 파티션에 `margin`을 쓰지 않는다.
- 파티션끼리 폭을 나눌 때는 `flex: 1 1 <basis>` 또는 `flex: 0 0 <고정폭>`을 쓰고, 모바일에서는 `flex-wrap`/`flex-direction: column`으로 쌓는다.
- 파티션 안에 파티션을 중첩하지 않는다. 더 쪼개야 하면 **내용 박스**로 만든다.
- **가로 스크롤 캐러셀·칩 탭 예외**: `flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory;` (줄바꿈 금지 영역).

```css
.part-box {
  display: flex;
  flex-wrap: wrap;            /* 줄바꿈 내용일 때. 캐러셀은 nowrap */
  gap: var(--part-gap);
  align-items: flex-start;
}
```

### S2.5 박스별 속성 분담표 (MUST)

| 속성 | 겉박스 | 속박스 | 파티션 박스 | 내용 박스 |
|---|:-:|:-:|:-:|:-:|
| `width: 100%` | ✅ | ✅ | — | — |
| `max-width` + `margin-inline:auto` | ❌ | ✅ | ❌ | ❌ |
| `padding-inline` (좌우 여백) | ❌ | ✅ | ❌ | 컴포넌트 내부만 |
| `padding-block` (섹션 세로 여백) | ✅ | ❌ | ❌ | ❌ |
| `background` / `border` | ✅ | ❌ | ❌ | 컴포넌트 내부만 |
| `position: sticky/fixed` | ✅ (header 등) | ❌ | ❌ | 플로팅 UI만 |
| `display: flex` / `gap` / `flex-wrap` | ❌ | ❌ | ✅ | 필요 시 |
| `display: grid` | ❌ | ❌ | ❌ **금지** | ✅ 허용 |
| `margin` (그 외) | ❌ | ❌ | ❌ | 최소화 (간격은 `gap`) |

### S2.6 고정 UI·반응형 처리

- 모바일 → PC로 확장(`min-width`)하며, **박스 구조는 바꾸지 않고 토큰 값만 바꾼다** (`--gutter`, `--section-pt/pb`, `--part-gap`).
- 풀블리드 이미지·배경은 **겉박스 배경**으로, 그 위의 콘텐츠는 `.inner-box` 안에 둔다.
- **하단 탭바·플로팅 버튼·최근 본 상품 팝업은 겉박스가 아니다.** `body` 마지막에 `<nav class="tabbar">`, `<aside>` 등으로 두고 `position: fixed`와 `--z-*` 토큰을 쓴다. 탭바가 가리지 않도록 푸터 겉박스 하단에 `padding-bottom: var(--bottom-bar-height)`를 더한다.

### S2.7 `layout.css` 기준 코드

```css
@layer layout {
  .outer-box {
    width: 100%;
    padding-block: var(--section-pt) var(--section-pb);
    background: var(--color-bg);
  }
  .outer-box--bleed { --gutter: 0px; padding-block: 0; }

  .outer-box--header {
    padding-block: 0;
    position: fixed;
    inset: 0 0 auto 0;
    z-index: var(--z-header);
    background: var(--header-bg);
  }
  .outer-box--footer {
    --section-pt: var(--footer-pt);
    --section-pb: var(--footer-pb);
    background: var(--color-surface);
    position: relative;
    z-index: 1;
  }

  .inner-box {
    width: 100%;
    max-width: var(--inner-max);
    margin-inline: auto;
    padding-inline: var(--gutter);
  }

  .part-box {
    display: flex;
    flex-wrap: wrap;
    gap: var(--part-gap);
  }
  .part-box--nowrap { flex-wrap: nowrap; }   /* 캐러셀·칩 탭 가로 스크롤 */
  .part-box--column { flex-direction: column; }
  .part-box--between { justify-content: space-between; }
}
```

### S2.8 레이아웃 체크 (위반 시 재작업)

- [ ] `body > header + main + footer` 구조이고, `main`의 직계 자식은 `section`뿐이다
- [ ] 모든 `.outer-box`의 직계 자식이 `.inner-box` **하나**다
- [ ] `.inner-box`에만 `max-width`·`margin-inline:auto`가 있다
- [ ] `.part-box`가 `display:flex`이며 `grid`가 없다
- [ ] `.part-box`에 `margin`이 없고 `gap`으로 간격을 만든다
- [ ] 동의어 클래스(`container`/`wrapper`/`inner`/`row`/`col`)가 없다

---

## S3. 박스 관련 값 (토큰)

### S3.1 브레이크포인트 (✅, PART 1 §4 표를 이 사이트에서는 대체한다)

| 이름 | 조건 | 원본 의미 |
|---|---|---|
| 기본 | `≤ 768px` | 모바일 |
| `pc` | `min-width: 769px` | PC 레이아웃 전환점 |
| `mid` | `769px ~ 1279px` | 태블릿/소형 PC 보정 구간 |
| `wide` | `min-width: 1280px` | 히어로 타이포 확대 |
| `max` | `min-width: 1920px` | 좌우 여백 84px로 고정 |

- 원본은 `max-width: 768px` 쿼리도 일부 쓰지만 **우리는 `min-width` 방향만 사용**한다 (기본값=모바일, 769px부터 덮어쓰기).
- 이 외 브레이크포인트(480, 1024, 1536 등)를 새로 만들지 않는다.

### S3.2 박스 토큰

```css
:root {
  /* 속박스 */
  --inner-max: 1920px;                 /* ✅ */
  --gutter: 20px;                      /* ✅ 모바일 좌우 여백 */
  --part-gap: 20px;                    /* ✅ 푸터 블록 gap 등 기본 */

  /* 겉박스: 섹션 세로 여백 */
  --section-pt: 56px;                  /* ✅ 모바일 */
  --section-pb: 40px;                  /* ✅ */

  /* 푸터 */
  --footer-pt: 32px;                   /* ✅ 모바일 (푸터 겉박스 padding 32px 20px) */
  --footer-pb: 32px;

  /* 고정 UI */
  --nav-height: 0px;                   /* ✅ 원본은 JS가 주입. 우리는 CSS로 고정값 사용 */
  --header-h-m: 64px;                  /* 🧮 14 + (7+20+7+3) + 13 */
  --header-h-pc: 40px;                 /* 🧮 칩 24+7+6+3 */
  --bottom-bar-height: 56px;           /* 🧮 5 + 28 + 2 + 16 + 5 (+ safe-area) */

  /* 내용 박스 */
  --card-gap: 8px;                     /* ✅ 상품 슬라이드 간격 (margin-right 8px) */
  --card-info-gap: 8px;                /* ✅ 이미지↔정보 */
  --card-text-gap: 4px;                /* ✅ 상품명↔가격 */
  --card-ratio: 100 / 133;             /* ✅ padding-top 133% (3:4에 가까운 세로형) */
  --card-ratio-square: 1 / 1;          /* ✅ padding-top 100% */

  /* 모서리 */
  --radius-sm: 4px;                    /* ✅ 카드 이미지·버튼·랭킹 플래그 */
  --radius-popup: 8px;                 /* ✅ 최근 본 상품 팝업 */
  --radius-pill: 40px;                 /* ✅ 헤더 카테고리 칩 */
  --radius-chip: 50px;                 /* ✅ 탭 칩 */
  --radius-round: 50%;                 /* ✅ 원형 버튼 */

  /* 선 */
  --line: 1px;                         /* ✅ */
  --line-hairline: 0.6px;              /* ✅ 컬러칩 테두리 (2배 해상도에서 1px) */

  /* 히트 영역 */
  --icon-btn: 28px;                    /* ✅ 헤더 아이콘 버튼 (PC 36px) */
  --hit-min: 44px;                     /* 접근성 기준: 아이콘 버튼 클릭 영역은 이 값 이상으로 확장 */
}

@media (min-width: 769px) {
  :root {
    --gutter: 4.375vw;                 /* ✅ 769–1919px */
    --section-pt: 76px;                /* ✅ */
    --section-pb: 80px;                /* ✅ */
    --footer-pt: 40px;                 /* ✅ 푸터 inner padding 40px */
    --footer-pb: 40px;
    --icon-btn: 36px;                  /* ✅ */
    --part-gap: 20px;
  }
}
@media (min-width: 1920px) {
  :root { --gutter: 84px; }            /* ✅ 4.375vw × 1920 = 84px */
}
```

- 푸터 겉박스만 `769–1279px` 구간에서 **`--gutter: 24px`** 로 재정의한다 (✅ 원본 푸터 `padding: 40px 24px`).
- 푸터 모바일 좌우 패딩은 겉박스(`32px 20px`)에 있지만, 우리 구조에서는 **속박스 `--gutter: 20px`** 가 담당한다.

### S3.3 원본 블록 간격 규칙의 변환 (✅ 규칙 / 🔶 합산 결과)

원본 속박스(`.css-1dvtm3i`)에는 다음 규칙이 있다.

| 구간 | 자식 블록 규칙 |
|---|---|
| `≥ 769px` | `padding: 0 84px; margin: 120px 0` |
| `769–1920px` | `padding: 0 4.375vw; margin: 6.25vw 0` |
| 모바일 | 자식 블록이 `padding: 0 20px`(헤더) 또는 리스트 `padding-left: 20px`(우측으로 이어지는 캐러셀) |
| 예외 | `.fullWidth` 클래스 블록은 제외 |

- 우리 구조에서는 **margin을 쓰지 않으므로**, 좌우 패딩은 `.inner-box`의 `--gutter`로, 세로 간격은 겉박스의 `padding-block`과 파티션의 `gap`으로 옮긴다.
- 원본에서 섹션 겉박스 `padding`(76/80)과 자식 블록 `margin`(120/6.25vw)이 **합산되어 보이는 실제 섹션 간 간격**은 렌더링을 봐야 확정된다 → 🔶 §S7 항목 1로 측정한다. 측정 전에는 **겉박스 `padding-block`만 적용**한다.
- **캐러셀 우측 블리드(모바일)**: 모바일에서 리스트는 왼쪽만 `20px` 여백을 두고 오른쪽은 화면 끝까지 이어진다(다음 카드가 잘려 보임). 우리 구조에서는 `margin` 대신 **겉박스 modifier로 속박스의 우측 gutter만 0**으로 만든다. PC에서는 다시 gutter를 복원한다.
  ```css
  .inner-box { padding-inline: var(--gutter) var(--gutter-right, var(--gutter)); }
  .outer-box--bleed-right { --gutter-right: 0px; }
  @media (min-width: 769px) { .outer-box--bleed-right { --gutter-right: var(--gutter); } }
  ```
  이때 섹션 헤더·`전체보기` 파티션은 우측 여백이 없어지지 않도록 `.part-box`에 `padding-right: var(--gutter)`(모바일)를 따로 준다.

### S3.4 박스 규칙 (MUST)

- `box-sizing: border-box` 전역 상속 (`html { box-sizing: border-box } *, ::before, ::after { box-sizing: inherit }`).
- `html { scrollbar-gutter: stable; }` 적용(원본 동일).
- 섹션 사이 간격은 **겉박스의 `padding-block`** 하나로만 만든다 (섹션 간 `margin` 금지).
- 상품 이미지 영역은 `aspect-ratio`로 만들고 `object-fit: cover` 대신 원본처럼 **`contain` + 배경 `#f8f8f8`** 를 쓴다 (원본: `object-fit: contain; object-position: center`).
- 상품 캐러셀: 모바일은 **슬라이드가 우측으로 잘려 보이게**(peek) 하고, PC 1920px 기준 **5개/화면**(🧮 슬라이드 폭 341.2px = (1738 − 4×8) ÷ 5). 스타일픽은 **4개/화면**(🧮 428.5px).
- 슬라이드 간격은 `gap: 8px`, 스냅 `scroll-snap-align: start`.
- PC 캐러셀 하단에 **스크롤바 형태 진행 표시**(높이 2~3px, 트랙 `#E8E8E8`, 핸들 `#000`, 모서리 0). 모바일은 숨김.

---

## S4. 글자 관련 값

### S4.1 서체 (✅)

```css
:root {
  --font-sans: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui,
               "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif;
  --font-num: "Plus Jakarta Sans", "Pretendard", sans-serif;   /* 랭킹 번호 전용 */
}
```

- 본문 서체는 **Pretendard** (원본: Next 폰트 최적화로 `400 / 500 / 700` 3종 woff2). 굵기는 **400·500·700만** 쓴다.
- **Plus Jakarta Sans는 랭킹 번호(`.ranking-flag`)에만** 쓴다.
- `body`: `font-size: 1rem; line-height: 1.5; font-weight: 400; color: #000; background: #fff;`
- 자간(`letter-spacing`)은 원본에서 쓰지 않는다 → **0**. 대문자 자간 확대 금지 (PART 1 §2.2 유지).
- `html { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }`

### S4.2 글자 토큰 (✅ 원본 값)

원본에서 쓰이는 글자 크기는 **10 / 12 / 14 / 16 / 18 / 20 / 24 / 36 / 48px** 뿐이다. 이 외 크기를 만들지 않는다.

| 용도 | 모바일 | 769–1279px | ≥1280px (PC) | 굵기 | 비고 |
|---|---|---|---|---|---|
| 히어로 타이틀 | 24 / 32 | 24 / 32 | **48 / 60** | 700 | `word-break: keep-all`, 영문 대문자 원문 |
| 히어로 서브카피 | 14 / 20 | 14 / 20 | **20 / 28** | 400 | `keep-all` |
| 섹션 라벨 (`COLLECTION` 등) | 16 / 24 | **14 / 20** | 16 / 24 | 700 | |
| 섹션 타이틀 | 24 / 32 | 24 / 32 | **36 / 52** | 400 | 원본 `break-all` → 우리는 `keep-all` 사용 |
| 헤더 카테고리 칩 | 16 / 20 | 18 / 24 | 18 / 24 | 활성 700 / 비활성 500 | ≥769px에서 18/24 |
| 상품명·상품 정보 | 14 / 20 | 14 / 20 | 14 / 20 | 400 | 2줄 말줄임(박스 높이 40px) |
| 가격 | 14 / 20 | 14 / 20 | 14 / 20 | **700** | |
| 랭킹 번호 | 14 | 14 | 14 | 700 | `--font-num`, 흰색 |
| `전체보기` 버튼 | 14 / 20 (w500) | 16 / 24 | 16 / 24 | 500 (모바일) | PC는 테두리 버튼 |
| 탭 칩 | 14 | 14 | 14 | 400 / 활성 색 반전 | `tab-chip` |
| 푸터 링크 | 12 / 18 | 14 / 20 | 14 / 20 | 400 | `text-transform: uppercase`(링크 줄) |
| 푸터 정보·저작권 | 12 / 18 | 12 / 18 | 12 / 18 | 400 | 색 `#949494` |
| 하단 탭바 라벨 | **10 / 16** | — | — | 400 | 흰색 |

> 전환 지점 주의 (✅ 원본): 히어로 타이틀·서브카피는 `≥1280px`에서 커진다. 섹션 타이틀은 원본이 `≥769px`에서 36/52로 키운 뒤 `769–1279px`에서 다시 24/32로 되돌리므로 **실제로는 `≥1280px`에서만 36/52**다. 섹션 라벨도 같은 방식으로 `769–1279px`에서만 14/20이다. 우리는 `min-width: 1280px` 한 번만 써서 구현한다.

```css
:root {
  --fs-10: 0.625rem;  --fs-12: 0.75rem;  --fs-14: 0.875rem;  --fs-16: 1rem;
  --fs-18: 1.125rem;  --fs-20: 1.25rem;  --fs-24: 1.5rem;    --fs-36: 2.25rem;  --fs-48: 3rem;
  --lh-16: 1rem; --lh-18: 1.125rem; --lh-20: 1.25rem; --lh-24: 1.5rem;
  --lh-28: 1.75rem; --lh-32: 2rem; --lh-52: 3.25rem; --lh-60: 3.75rem;
}
```

### S4.3 글자 규칙 (MUST)

- PART 1의 "본문 16px 이상" 규칙은 **문단 본문에만** 적용한다. 이 사이트의 UI 텍스트(상품·푸터·탭)는 위 표의 10~14px를 따른다.
- **10px 라벨은 하단 탭바에만** 허용한다 (원본 동일, 접근성 예외 기록). 그 외 12px 미만 금지.
- 한글 `word-break: keep-all`. 원본이 `break-all`(섹션 타이틀·칩)을 쓰는 곳은 **긴 단어 깨짐 방지용 `overflow-wrap: anywhere`** 로 대체한다.
- 상품명은 **2줄 말줄임**, 높이는 `min-height: 40px`(= 20px × 2):
  ```css
  .product-card__name { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px; font-weight: 400; }
  ```
- 가격은 `Intl.NumberFormat('ko-KR')`로 포맷, 숫자만 표시, 스크린리더용 `<span class="visually-hidden">원</span>` 추가. 정가/할인가는 `<del>`/`<ins>`로 마크업하고 **할인가 스타일은 §S7 항목 2에서 확인 전까지 가격과 동일(700, `#000`)** 로 둔다.
- 순위 번호는 `<ol>` 번호 또는 `.product-card__rank`로 표시하며 순서 정보이므로 스크린리더에서 숨기지 않는다.

---

## S5. 색상 관련 값

### S5.1 원본 팔레트 (✅) — **완전한 모노톤**

원본 emotion CSS의 색상 사용 빈도: `#000000`(34), `#E8E8E8`(20), `#fff`/`#FFFFFF`(25), `#949494`(7), `#787878`(5), `#F8F8F8`(5), `#505050`(2), `#F0F0F0`(1). **유채색 UI 색은 없다.** (`#1976d2`는 MUI 기본값, `#ef3434`는 Shoplive 서드파티, `#eceae3`·`#ede8d9` 등은 **상품 색상 칩**이므로 UI 토큰이 아니다.)

```css
:root {
  /* 배경 */
  --color-bg:            #ffffff;
  --color-surface:       #f8f8f8;   /* 푸터 배경, 상품 이미지 배경, 히어로 바탕 */
  --color-surface-2:     #f0f0f0;

  /* 글자 */
  --color-text:          #000000;                 /* body color: rgba(0,0,0,1) */
  --color-text-strong:   #000000;
  --color-text-sub:      #505050;                 /* 비활성 칩 글자 */
  --color-text-muted:    #787878;                 /* 비활성 텍스트 탭 */
  --color-text-faint:    #949494;                 /* 푸터 정보·저작권 */
  --color-text-inverse:  #ffffff;

  /* 선 */
  --color-border:        #e8e8e8;                 /* 푸터 구분선, 버튼 테두리, 스크롤 트랙 */
  --color-border-strong: #000000;                 /* 활성 탭·핸들 */
  --color-border-on-dark:#ffffff;                 /* 헤더 칩 활성 테두리 */

  /* 액션 */
  --color-primary:       #000000;                 /* 활성 탭·랭킹 플래그·선택 상태 */
  --color-on-primary:    #ffffff;

  /* 오버레이 */
  --overlay-hero: linear-gradient(180deg, rgba(0,0,0,0) 0.18%, rgba(0,0,0,.56) 99.82%);
  --overlay-header-m: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.56) 100%);
  --chip-fill-on-dark: rgba(255,255,255,.20);

  /* 그림자 */
  --shadow-popup: 0 16px 16px 0 #0000001f, 0 0 2px 0 rgba(0,0,0,.12);   /* 최근 본 상품 팝업 */
  --shadow-float: 0 0 2px 0 #0000001f;                                  /* 플로팅 원형 버튼 */

  /* 헤더·탭바 */
  --header-bg:           var(--overlay-header-m);   /* 모바일: 위→아래 검정 그라디언트 위에 흰 텍스트 */
  --color-focus:         #1976d2;                   /* 🔶 원본에 포커스 링 정의 없음 → MUI 기본 파랑 사용 */
}
@media (min-width: 769px) {
  :root { --header-bg: transparent; }               /* ✅ PC: position static, background none */
}
```

### S5.2 색상 규칙 (MUST)

- **UI에는 흑·백·회색만 쓴다.** 강조색·할인색 등 유채색을 임의로 추가하지 않는다 (원본 CSS에 없음). 상품 색상 칩만 데이터 색을 사용한다.
- 활성/선택 상태는 **색 반전**(배경 `#000`, 글자 `#fff`) 또는 굵기·밑줄(2px `#000`)로 표현한다. 비활성은 글자색(`#505050` / `#787878` / `#949494`) 또는 `opacity: .42`(밑줄 탭)로 표현한다.
- 이미지 위 흰 텍스트는 **원본 그라디언트 오버레이**(`--overlay-hero`, 모바일 헤더 `--overlay-header-m`)로 대비를 확보한다.
- 구분선은 `1px solid #E8E8E8`. 강한 구분(탭 밑줄·테이블)은 `1px solid #000`.
- **대비 주의 (✅ 계산)**: `#949494` 글자는 `#F8F8F8` 배경에서 약 **2.9:1**, 흰 배경에서 약 3.0:1로 **WCAG AA(4.5:1) 미달**이다. `#787878`은 `#F8F8F8`에서 약 4.2:1로 근접하나 미달이다. 원본 동일 디자인을 우선해 값은 유지하되, **연락처·사업자번호 등 필수 정보 텍스트에 이 색을 쓸 때는 보고서에 대비 미달을 기록**하고, 사용자가 승인하면 `#767676` 이상(흰 배경 4.5:1)으로 어둡게 조정한다.
- 포커스 링은 원본에 정의가 없으므로 PART 1 규칙에 따라 **반드시 추가**한다. 흑·백 UI에서는 `outline: 2px solid #000; outline-offset: 2px`(어두운 배경 위는 `#fff`)를 권장한다.

---

## S6. 컴포넌트 값 & 박스 매핑

### S6.1 영역별 박스 구성

| 영역 | 겉박스 | 파티션 박스 구성 | 내용 박스 |
|---|---|---|---|
| 헤더 | `header.outer-box--header` | ① 로고·아이콘(검색·장바구니·마이·메뉴) ② 카테고리 칩 | `nav`, `.chip` |
| 히어로 | `section.outer-box--bleed` | 슬라이드 트랙 1개 (세로 스냅) | `.promo` (이미지 + 텍스트 오버레이) |
| BEST ITEM | `section.outer-box--bleed-right` | ① 섹션 헤더 ② 상품 트랙 ③ 전체보기 | `.product-card` |
| COLLECTION | `section.outer-box--bleed-right` | ① 섹션 헤더 ② 배너 + 상품 ③ 전체보기 | `.collection-banner`, `.product-list` |
| TREND PICK | `section.outer-box--bleed-right` | ① 섹션 헤더 ② 칩 탭 ③ 스타일픽 트랙 | `.tabs`, `.style-pick` |
| 푸터 | `footer.outer-box--footer` | ① 링크 줄 ② 사업자 정보 ③ SNS·언어 ④ 인증·저작권 | 아코디언 |
| 하단 탭바 | (겉박스 밖, fixed) | — | `.tabbar` |
| 플로팅 | (겉박스 밖, fixed) | — | `.floating-chat`, `.recent-popup` |

### S6.2 헤더 (✅)

- `position: fixed; top:0; left:0; right:0; z-index: 100`.
- **모바일**: 헤더 하단 영역 `padding: 14px 0 13px`, 배경 `linear-gradient(0deg, transparent → rgba(0,0,0,.56))`, 칩 줄은 `white-space: nowrap; overflow-x: auto; text-align: center; padding: 0 20px`, 스크롤바 숨김.
- **PC(≥769px)**: `position: static`, 배경 없음, 칩 줄은 `display:flex; flex-wrap: wrap; justify-content:center; gap: 4px`, 패딩 0.
- **카테고리 칩**: 높이 = `padding 7px 12px`(PC `7px 16px 6px`) + 글자 16/20(PC 18/24), `border-radius: 40px`, 글자 흰색.
  - 활성: `border: 1.5px solid #fff; background: rgba(255,255,255,.20); font-weight: 700`
  - 비활성: `border: 1.5px solid transparent; background: transparent; font-weight: 500`
  - 전환: `transition: all .3s ease`
- 아이콘 버튼: `28×28`(PC `36×36`), 중앙 정렬 flex, **히트 영역은 44px 이상으로 확장**.

### S6.3 히어로 (✅)

- 세로 Swiper. 텍스트 블록: `flex column; justify-content: flex-end; gap: 8px; padding: 28px 20px 76px`(+`env(safe-area-inset-bottom)`을 더한 하단 `80px`), 하단에서 `--overlay-hero` 그라디언트.
- PC: `justify-content: center; gap: 12px; padding: 84px`. 769–1279px: `padding: 48px 24px`.
- 이미지: `width:100%; height:100%; object-fit: contain; object-position: center`.
- **페이지네이션**: 세로, 우측 `20px`(PC `84px`), 막대 `3px × 16px`, `border-radius: 8px`, 흰색 `opacity .3`, 활성 `높이 36px, opacity 1`, 전환 `.5s`.
- 높이: 🔶 원본은 JS(`height: 1031px` 스냅샷 값). `100svh − 헤더` 기준으로 구현하고 §S7 항목 3에서 확인.
- 자동 재생이 있다면 **일시정지 버튼 제공**, `prefers-reduced-motion` 시 정지.

### S6.4 섹션 헤더 · 전체보기 (✅)

```html
<div class="part-box part-box--between section-head">
  <div class="section-head__text part-box part-box--column">
    <p class="section-head__label">COLLECTION</p>
    <h2 class="section-head__title">THE ACTIVE LAYER</h2>
  </div>
  <a class="section-head__more" href="…">전체보기</a>
</div>
```

| 속성 | 모바일 | 769–1279px | PC |
|---|---|---|---|
| 헤더 flex | `row; space-between; stretch` | — | `align-items: center` |
| 헤더 padding | `0 20px` | — | `0` (속박스 gutter가 담당) |
| 헤더 아래 간격 | 20px | **16px** | 32px |
| 라벨↔타이틀 gap | 8px | 4px | 4px |

- `전체보기`(하단 중앙 버튼): 컨테이너 `justify-content:center; margin-top: 32px`(PC 28px).
  - 모바일: 텍스트 링크 14/20 w500 + 우측 16px 화살표 아이콘.
  - PC: `padding: 12px 32px; border: 1px solid #E8E8E8; border-radius: 4px; font: 16/24`, 화살표 숨김.

### S6.5 상품 카드 (✅)

```html
<li class="product-card">
  <a class="product-card__media" href="…">
    <img … width="…" height="…" loading="lazy" alt="">
    <span class="product-card__rank">1</span>
  </a>
  <div class="product-card__info">
    <a class="product-card__name" href="…">여성 픽토르U 구스다운 경량패딩</a>
    <p class="product-card__price"><span>179,000</span><span class="visually-hidden">원</span></p>
  </div>
  <ul class="product-card__colors">…</ul>
</li>
```

| 요소 | 값 |
|---|---|
| 카드 | `display:flex; flex-direction:column; gap:8px; justify-content:space-between` |
| 이미지 박스 | `aspect-ratio ≈ 100/133`(padding-top 133%) 또는 정사각형, `background:#f8f8f8`, `border-radius:4px`, `overflow:hidden` |
| 이미지 | `contain`, 호버 시 두 번째 이미지(`hover-img`)로 교체 — 터치 환경(`(hover: none)`)에서는 교체하지 않는다 |
| 랭킹 플래그 | `position:absolute; top:0; left:0; 32×32; background:#000; color:#fff; 14px/700; --font-num; radius 4px; 중앙 정렬; z-index 2` |
| 정보 박스 | `flex column; gap:4px; font 14/20; padding 0` |
| 상품명 | 2줄, 높이 40px, 400 |
| 가격 | 700 (할인 시 2개 값 → §S7 항목 2) |
| 컬러 칩 | `24×24; border-radius:24px; overflow:hidden; border:0.6px solid transparent`(선택 시 `#000`, 2배 해상도에서 `1px`); 칩 목록 `gap:6px; flex-wrap:wrap; margin-top:8px; min-height:20px` |
| 사이즈 버튼 | 호버 시 이미지 위에 오버레이로 표시(85·90·95…). 모바일에서는 표시하지 않는다 |
| 담기 버튼 | 아이콘 `24px`, 히트 영역 44px 이상, 비활성(품절)은 `disabled` + 별도 아이콘 |

### S6.6 탭 (✅, 원본 4종 중 사용 대상)

| 종류 | 용도 | 값 |
|---|---|---|
| **chip** | TREND PICK | 항목 `padding: 8px 12px; border: 1px solid #E8E8E8; border-radius: 50px; font-size: 14px; color: #505050`, 항목 간격 `8px`. **활성**: `background:#000; color:#fff; border-color:#000` |
| underline | 대안 | 항목 높이 48px, 비활성 `opacity:.42`, 활성 700 + 하단 2px `#000`, 전체 하단선 `1px #E8E8E8` |
| text | 대안 | 글자 16px, 항목 간격 16px, 비활성 `#787878`, 활성 `#000` + 700 |
| text-underlined | 대안 | 글자 14px, 비활성 `#949494`, 활성 `#000` + 700 + 밑줄 2px(간격 6px) |

- 탭은 `role="tablist"`/`role="tab"`/`aria-selected`, 방향키 이동 지원.
- 칩 탭 줄은 `.part-box--nowrap`으로 가로 스크롤 가능하게 한다.

### S6.7 푸터 (✅)

- 겉박스 배경 `#F8F8F8`. 속박스 padding: 모바일 `32px 20px`, 769–1279px `40px 24px`, 1280–1919px `40px 4.375vw`, ≥1920px `40px 84px`.
- 블록 간 구분: 모바일 `padding-top:20px; margin-top:20px; border-top:1px solid #E8E8E8`, PC는 구분선 없이 `margin-top: 20px`. 블록 내부 `flex column; gap:20px`.
- **링크 줄**: `flex; flex-wrap:wrap; row-gap:0`(모바일 `8px`). 링크 `12/18`(PC `14/20`), `uppercase`, 우측 `padding-right:16px; margin-right:16px`(모바일 `8px/8px`), **구분선 `1px × 10px`, `#E8E8E8`** (마지막 항목은 없음).
- **정보 텍스트**: `12px`, 색 `#949494`, 줄간격 18px, `word-break: keep-all`, 항목 간 `gap: 4px`.
- **저작권**: `12/18`, `#949494`, 모바일 `margin-top: 20px`. PC는 `flex-direction: row-reverse; justify-content: space-between; align-items: center`.
- 사업자 정보는 아코디언(`<details>` 또는 `button[aria-expanded]`), 본문 패딩 `0`.

### S6.8 하단 탭바 · 플로팅 (✅)

| 요소 | 값 |
|---|---|
| 탭바 | `position:fixed; bottom:0; left:0; right:0; z-index:2001; display:flex; justify-content:space-between; align-items:center; padding:5px 20px calc(5px + env(safe-area-inset-bottom,0px)); background:transparent`(스크롤 상태에 따라 배경 전환, `transition .3s ease-in-out`) |
| 탭 항목 | `flex column; align-items:center; gap:2px; min-width:48px; color:#fff`, 아이콘 `28×28`, 라벨 `10/16 w400 #fff` |
| 최근 본 상품 팝업 | `width:260px; background:#fff; border-radius:8px; box-shadow: var(--shadow-popup); overflow:hidden; display:none` (열릴 때만 표시) |
| 최근 본 상품 버튼 | `40×40; border-radius:50%; box-shadow: var(--shadow-float)` |
| 플로팅 스택 | `flex column; gap` 항목 사이 8px |

- z-index 스케일(✅): `1·2`(카드 내부), `10`, `100`(헤더), `2000`(오버레이), `2001`(탭바), `3000`(MUI 다이얼로그/메뉴), `4000`(최상위).
  ```css
  :root { --z-header: 100; --z-overlay: 2000; --z-tabbar: 2001; --z-dialog: 3000; --z-top: 4000; }
  ```
- 모션: 전환은 `0.1s ~ 0.5s`의 `ease`/`ease-in-out`, **`prefers-reduced-motion` 시 `transition: none`** (원본도 처리).

---

## S7. 남은 확인 항목 (🔶 → ✅)

원본 CSS로 확정되지 않은 값만 DevTools로 확인한다. 뷰포트 **390px / 1024px / 1440px / 1920px**에서 실행한다.

| # | 확인 항목 | 이유 |
|---|---|---|
| 1 | **섹션 간 실제 간격**(겉박스 padding + 자식 margin 합산 결과) | §S3.3 |
| 2 | **할인 상품의 정가/할인가 스타일**(색·취소선·할인율 유무) | 스냅샷 CSS에 별도 규칙 없음 |
| 3 | **히어로 높이 계산식**(`100vh`/`dvh`/비율) | JS로 설정됨 |
| 4 | **PC 메가 메뉴**(패널 폭·간격·글자) | 이 스냅샷에서는 닫힌 상태 |
| 5 | **COLLECTION 상품 목록 열 수**(7개 목록 배치) | 슬라이드 폭 미지정 |
| 6 | **포커스 링** 존재 여부 | 원본 CSS에 없음 |

```js
(() => {
  const q = (s) => [...document.querySelectorAll(s)];
  const box = (el) => { const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    return { cls: String(el.className).slice(0, 40), w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top + scrollY),
      pt: cs.paddingTop, pb: cs.paddingBottom, mt: cs.marginTop, mb: cs.marginBottom }; };
  // 1) 섹션 간 간격: 1920 최대폭 박스(속박스) 기준 부모 겉박스 간 거리
  const inners = q('div').filter(d => getComputedStyle(d).maxWidth === '1920px' && d.getBoundingClientRect().height > 100);
  console.table(inners.map(box));
  // 2) 할인가: 가격 요소 형제 스타일
  console.table(q('.product-price').slice(0, 6).map(p => ({ text: p.textContent, color: getComputedStyle(p).color,
    deco: getComputedStyle(p).textDecorationLine, parent: p.parentElement.innerText.replace(/\s+/g, ' ').slice(0, 40) })));
  // 3) 히어로: 세로 Swiper 높이와 vh 비율
  const hero = document.querySelector('.swiper-vertical');
  console.log('hero', hero && hero.getBoundingClientRect().height, 'innerHeight', innerHeight);
  // 6) 포커스 링
  const a = document.querySelector('a, button'); a && a.focus();
  console.log('focus outline', a && getComputedStyle(a).outline);
})();
```

실측 후 결과를 에이전트에 전달하면 해당 🔶 항목을 ✅로 교체하고 변경 이력에 기록한다.

---

# PART 4. 최종 체크리스트 (완료 전 필수 통과)

## Designer 체크

- [ ] 모든 색·글자·간격·그림자·라운드가 **토큰**을 사용한다 (하드코딩 0건)
- [ ] 텍스트 대비 4.5:1 / UI 3:1 이상이다
- [ ] 타입 스케일·8pt 간격 규칙을 따른다
- [ ] 모든 인터랙티브 요소의 5가지 상태가 정의되어 있다 (focus-visible 포함)
- [ ] 터치 타깃이 44px 이상이다
- [ ] 360 / 390 / 768 / 1024 / 1440px에서 깨지지 않는다
- [ ] 모션은 의미가 있고 `prefers-reduced-motion`을 지원한다
- [ ] 문구가 능동형·일관된 어체이며 오류 메시지는 해결 방법을 안내한다
- [ ] "범용 AI 디자인" 패턴을 무의식적으로 쓰지 않았다
- [ ] 색·글자·박스 값이 **PART 3 토큰**과 일치한다 (🔶 항목을 실측값으로 단정하지 않았다)
- [ ] 글자 크기가 10/12/14/16/18/20/24/36/48px 중 하나이고, UI 색이 흑·백·회색 팔레트 안에 있다

## Developer 체크

- [ ] HTML 유효성: `lang`, 단일 `h1`, 단일 `main`, 제목 레벨 순서, `alt`, `label` 확인
- [ ] 클릭 가능한 모든 요소가 `button`/`a`이고 **키보드만으로 조작**된다
- [ ] 인라인 스타일·인라인 이벤트·`id` 선택자·`!important`·`var` 없음
- [ ] `innerHTML`로 외부/사용자 입력을 삽입하지 않았다
- [ ] 로딩·성공·오류·빈 상태가 모두 구현되었다
- [ ] 콘솔 에러/경고 0건, `console.log` 제거
- [ ] 이미지에 `width/height`가 있고 CLS가 발생하지 않는다
- [ ] Lighthouse(모바일): Performance / Accessibility / Best Practices / SEO 모두 **90+**
- [ ] 프로젝트 구조·네이밍 규칙을 따랐고 불필요한 파일 변경이 없다
- [ ] 변경 사항 보고(§8.3)를 작성했다
- [ ] 페이지가 **겉박스 > `.inner-box` > 파티션 박스** 구조이고, 페이지 골격에 Grid가 없다 (PART 3 §S2 체크 통과)

---

## 부록: 규약 위반 시 에이전트의 행동

1. 사용자의 요청이 이 규약과 **충돌**하면 → 규약을 지킨 대안을 제시하고, 사용자가 명시적으로 원하면 **위반 사유를 코드 주석과 보고에 기록**한 뒤 진행한다.
2. 규약에 **없는 상황**이면 → 기존 코드의 패턴을 따르고, 새 패턴을 만들었다면 이 문서에 추가할 항목을 제안한다.
3. 이 문서는 **살아있는 문서**다. 프로젝트 진행 중 합의된 변경은 즉시 반영하고, 변경 이력을 아래에 기록한다.

| 날짜 | 변경 내용 | 작성자 |
|---|---|---|
| 2026-11-02 | 최초 작성 | — |
| 2026-11-02 | PART 3(SITE SPECIFIC) 추가: 박스 구조(겉박스>속박스>파티션), 박스·글자·색상 토큰(임시), 일반 규칙 중 Grid 관련 항목 수정 | — |
| 2026-11-02 | 원본 HTML/CSS 분석 반영: PART 3의 임시값을 실측값(✅)으로 교체, 브레이크포인트 769/1280/1920, 팔레트·글자 크기·컴포넌트 값 확정, 일반 규칙의 8pt·타입·브레이크포인트 항목에 사이트 우선 주석 추가 | — |
