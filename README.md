# Discovery Expedition Clone Project

디스커버리 익스페디션 공식 온라인몰 타깃 클론 웹 프로젝트입니다.  
**HTML5 / CSS3 / Vanilla JavaScript (ES2022+)** 기반으로 빌드 도구와 프레임워크 없이 순수 웹 표준으로 구현합니다.

---

## 🚨 개발 시작 전 필독 (Agent & Developer Notice)

> **모든 작업(코드 작성, 수정, 리팩토링)을 시작하기 전, 아래 순서대로 문서를 읽고 작업에 착수해야 합니다.**

1. 🧭 **이전 작업 이력 및 다음 작업 안내**: [`task-history/task.md`](./task-history/task.md) — 완료된 작업을 확인하고 중복 구현 없이 이어서 진행합니다.
2. 📖 **핵심 규약 문서**: [`spec-kit/AGENTS.md`](./spec-kit/AGENTS.md) — 개발·디자인 규약과 MUST / MUST NOT을 확인합니다.

* 문서 내 명시된 **MUST / MUST NOT 규칙은 예외 없이 준수**합니다.
* 작업 이력은 참고 자료이며, 현재 사용자 요청과 실제 코드 상태를 우선합니다. 이력과 현재 상태가 다르면 코드를 확인한 뒤 정확한 상태를 기준으로 작업합니다.
* 충돌 발생 시 우선순위:
  $$\text{접근성·보안} > \text{사용자 요구 명세} > \text{AGENTS.md (PART 3 우선)} > \text{성능} > \text{개인 취향}$$

---

## 📌 핵심 작업 규칙 요약

### 1. 3단 레이아웃 계층 엄수 (최대 4단계)
동의어 클래스(`container`, `wrapper`, `row` 등) 사용을 엄격히 금지합니다.
```text
겉박스 (.outer-box)          ← header / main > section / footer (100% 폭, 배경·세로 여백 담당)
 └─ 속박스 (.inner-box)       ← max-width(1920px) + 중앙 정렬 + 좌우 패딩 담당
     └─ 파티션 박스 (.part-box) ← display: flex (Grid 금지, gap 간격 분담)
         └─ 내용 박스          ← 컴포넌트 단위 (필요 시 내부 Grid 허용)
```

### 2. 디자인 토큰 기반 구현 (하드코딩 금지)
* 색상·글자 크기·간격·반경 등 모든 수치는 `/css/tokens.css` 변수만 참조합니다.
* **디자인 실측치 우선**: PART 1의 기본 8pt/스케일보다 **PART 3의 실측값(✅)**을 최우선 적용합니다.
* **완전한 모노톤 UI**: 흑·백·회색만 사용하며, 임의의 유채색 포인트 컬러를 추가하지 않습니다.

### 3. 클린 & 시맨틱 코드
* **No Library / No Framework**: 승인되지 않은 외부 라이브러리, CDN, 폰트 임의 추가 금지.
* 시맨틱 태그 준수 (`main` 단 1개, 단일 `h1`, 클릭 요소는 `<button>` 또는 `<a>` 필수).
* 인라인 스타일, `!important`, `id` 선택자 스타일링, 불필요한 서술형 AI 주석 작성 금지.

---

## 📁 디렉터리 구조

```text
/
├─ spec-kit/
│  └─ AGENTS.md            # 에이전트 및 디자이너/개발자 통합 코딩 규약
├─ README.md               # 프로젝트 시작 안내 및 작업 지침 (본 문서)
├─ index.html              # 메인 진입점
├─ pages/                  # 서브 페이지 (kebab-case.html)
├─ assets/
│  ├─ images/              # webp / avif 우선
│  ├─ icons/               # SVG only
│  └─ fonts/               # woff2 only (Pretendard, Plus Jakarta Sans)
├─ css/
│  ├─ tokens.css           # 디자인 토큰
│  ├─ base.css             # reset + 기본 요소 스타일
│  ├─ layout.css           # 겉박스·속박스·파티션 박스 구조
│  ├─ components/          # 컴포넌트 단위 스타일
│  ├─ utilities.css        # 최소 유틸리티 (.visually-hidden 등)
│  └─ main.css             # CSS 로드 관리 (@layer 사용)
└─ js/
   ├─ main.js              # 엔트리 포인트 (type="module")
   ├─ modules/             # 기능 단위 모듈
   ├─ utils/               # 순수 헬퍼 함수
   └─ config.js            # 상수 및 설정
```

## 공지사항 게시판

- 게시판 주소: [`pages/notice.html`](./pages/notice.html)
- URL의 `view` 값으로 목록·상세·작성·수정 화면을 전환하며, 최초 방문 시 시안에 나온 공지사항 샘플을 생성합니다.
- 화면 모듈은 [`js/services/notice-repository.js`](./js/services/notice-repository.js)의 Repository 인터페이스만 사용합니다.
- 게시물 JSON은 `discovery:notice:posts` localStorage 키에 저장하고, 첨부 파일 바이너리는 IndexedDB에 저장해 localStorage 용량 제한을 피합니다.
- 홈 화면 `body` 바로 아래의 문서 흐름에 목록 정렬 기준 상위 3개 공지를 어두운 배경과 흰색 글자로 된 한 줄 회전 박스로 표시합니다. 분홍색 라운드 `Notice` 라벨, 중앙 정렬 공지 문구, 오른쪽 컨트롤을 제공하며 멈춤 컨트롤은 네모형입니다. 공지 박스가 메뉴와 나머지 페이지 콘텐츠를 밀어내며, 닫거나 사용자가 스크롤하면 높이만큼 스크롤 위치를 보정해 빈 공간 없이 아래 콘텐츠가 함께 위로 이동합니다. 포인터가 올라오거나 키보드 포커스가 진입하면 자동 회전을 멈추며, 모션 감소 설정에서는 자동 회전을 시작하지 않습니다.
- 공통 회전 박스 표현과 제어는 [`js/modules/notice-ticker.js`](./js/modules/notice-ticker.js), 스타일은 [`css/components/notice-ticker.css`](./css/components/notice-ticker.css)에서 관리합니다.
- Firestore 전환 시 Repository 진입점과 구현체를 교체하고, 첨부 파일 메서드는 Firebase Storage 구현으로 교체합니다.

---

## 베스트 상품 상세 및 장바구니

- Best Item 상품의 이미지·상품명·가격은 [`data/best-items.json`](./data/best-items.json)에서 관리하며, 카드 선택 시 `pages/product-detail.html?id=...`의 상세 화면에 같은 정보를 표시합니다.
- 상세 화면의 장바구니 버튼으로 상품을 담고, 장바구니에서 상품별 수량·금액과 총 결제금액을 확인하거나 상품을 삭제할 수 있습니다.
- 장바구니 데이터는 `discovery:shop:cart` localStorage 키에 저장하며, 홈·공지·상세·장바구니 페이지의 장바구니 아이콘에는 총 수량 배지를 표시합니다.

## 📋 완료 전 체크리스트

작업을 완료하거나 커밋하기 전 [`spec-kit/AGENTS.md`](./spec-kit/AGENTS.md)의 **PART 4 체크리스트**를 반드시 자체 검수하세요.
- [ ] 레이아웃 규칙 준수 여부 (`.outer-box` > `.inner-box` > `.part-box`)
- [ ] 토큰 하드코딩 유무 확인
- [ ] 키보드 접근성 및 시맨틱 마크업 검증
- [ ] 불필요한 `console.log` 및 임시 텍스트(`TODO`, `test` 등) 제거

### 테스트 진행 원칙

- 변경 범위에 맞는 기존 테스트·린트·빌드 또는 브라우저 검증을 수행합니다. 문서만 수정한 경우에는 별도 테스트를 생략합니다.
- 검증 및 개발에 사용한 임시 서버·워처·백그라운드 프로세스는 작업 완료 전에 종료하고, 작업이 끝난 뒤 불필요한 프로세스가 계속 실행되지 않도록 확인합니다.