# 코인관리자 (Coin Admin)

월 고정비와 일별 유동비를 효율적으로 관리하는 React Native 모바일 애플리케이션입니다. 원/달러 이중 통화 입력과 실시간 환율 변환을 지원합니다.

## 🚀 빠른 시작

```bash
# 저장소 클론 후 의존성 설치
npm install

# 개발 서버 실행
npm start

# 플랫폼별 실행 (개발 서버 실행 중 터미널에서 키 입력 또는 별도 터미널)
npm run android   # Android
npm run ios       # iOS (macOS)
npm run web       # 웹 (기본 http://localhost:8081)
```

## 📱 주요 기능

- **월 고정비 관리**: 월세, 관리비 등 월 단위 고정 지출을 추가, 수정, 삭제
- **월 유동비 관리**: 일별 지출을 항목·금액·지출일·메모로 추가, 수정, 삭제
- **월별 유동비 조회·비교**: 월 선택기(화살표·스와이프)로 지난달 조회, 전월 대비 비교 막대, 월 전환 배너 ([상세 문서](docs/features/variable-expense-month.md))
- **금액 통화 입력 (원/달러)**: 원 또는 달러로 입력 가능, 달러는 실시간 환율로 원화 변환 후 저장 ([상세 문서](docs/features/amount-currency.md))
- **총액 계산**: 등록된 고정비/유동비 총액을 실시간으로 계산
- **데이터 시각화**: 금액별 그룹화 및 항목별 비율을 차트로 시각화
- **반응형 디자인**: 스마트폰과 태블릿 모두 최적화된 UI/UX
- **페이지네이션**: 대량의 데이터를 효율적으로 로드
- **오프라인 지원**: SQLite를 사용한 로컬 데이터 저장
- **다크 모드**: 라이트/다크/시스템 테마 (설정 화면에서 변경)
- **로컬 백업/복구**: 전체 데이터를 JSON 파일로 백업(공유 시트)·복구(파일 선택) ([상세 문서](docs/features/backup-restore.md))

## 🛠 기술 스택

### 핵심 기술
- **React Native** 0.81.5
- **Expo** ~54.0.27
- **TypeScript** 5.9.2
- **React** 19.1.0

### 스타일·상태·데이터
- **Nativewind / Tailwind** — 스타일링. 시맨틱 컬러(primary/expense/income), slate 중성색, 8pt 그리드·radius(card/button/input)는 `src/constants/theme.ts` 및 `tailwind.config.js`에서 관리
- **TanStack React Query v5** — 서버/비동기 상태, 무한 스크롤 페이지네이션
- **Expo SQLite** — 로컬 DB
- **Phosphor Icons** — 아이콘
- **Sentry (@sentry/react-native)** — 프로덕션 에러 리포팅 (`EXPO_PUBLIC_SENTRY_DSN` 설정 시)

## 📋 사전 요구사항

- Node.js **22.13 이상** (권장: 24 Active LTS — `.nvmrc`·package.json `engines` 기준. Node 18·20은 EOL)
- npm 또는 yarn
- Android Studio (Android 개발용)
- Xcode (iOS 개발용, macOS만)

## 📁 프로젝트 구조

```
coin-admin/
├── src/
│   ├── app/              # 메인 앱 진입점
│   ├── assets/           # 이미지 및 리소스
│   ├── components/       # 재사용 컴포넌트
│   │   ├── ui/           # UI 기본 컴포넌트
│   │   ├── layouts/      # 반응형 레이아웃 (Phone, TabletPortrait, TabletLandscape)
│   │   └── ...           # 기능별 컴포넌트
│   ├── config/           # 앱 설정 (상수, queryKeys.ts React Query Key Factory)
│   ├── constants/        # 상수·테마 (QUERY_KEYS re-export)
│   ├── contexts/         # React Context (AppContext 등)
│   ├── database/         # SQLite·DB 로직
│   ├── features/         # 도메인별 기능
│   │   ├── fixed-expenses/
│   │   └── variable-expenses/
│   ├── hooks/            # 커스텀 훅
│   ├── lib/              # 인프라 유틸 (에러, 로거, 스토리지, react-query 헬퍼)
│   ├── types/            # TypeScript 타입
│   └── utils/            # 도메인 유틸 (금액·날짜 포맷, 검증, 반응형, test-utils getTestProps)
├── docs/                 # 상세 문서
├── e2e/                  # Playwright E2E 스펙
├── android/              # Android 네이티브
├── app.config.ts         # Expo·EAS 설정 (버전: 2.2.2)
├── package.json
└── tsconfig.json
```

## ⌨️ 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `npm start` | Expo 개발 서버 실행 |
| `npm run android` | Android 에뮬레이터/기기 실행 |
| `npm run ios` | iOS 시뮬레이터 실행 (macOS) |
| `npm run web` | 웹 빌드 실행 (기본 8081) |
| `npm test` | Jest 단위 테스트 실행 |
| `npm run test:e2e` | E2E: 웹 서버 자동 기동 후 Playwright 실행 (포트 8081 비어 있어야 함, 최대 약 3분) |
| `npm run test:e2e:run` | E2E: 서버 없이 테스트만 실행 (`npm run web` 또는 `npm run web:clear` 실행 중인 터미널이 있을 때). 포트 변경 시 `E2E_BASE_URL=http://localhost:8082` 등으로 지정 |

## 🎨 주요 컴포넌트

### UI 컴포넌트
- `Typography` — 텍스트 스타일 (display/h1~caption, tabularNums 옵션)
- `Button` — 버튼 (Primary/Income/Expense 시맨틱 컬러, scale 애니메이션)
- `Card` — 카드 (Flat & shadow-sm, border-slate-100, rounded-2xl)
- `InputField` — 입력 필드 (rounded-lg, slate 팔레트)
- `AmountInputSection` — 금액 입력 Dumb 컴포넌트. amount/currency/onChangeAmount/onToggleCurrency만 받음. 원 | 달러 Segmented Control로 통화 전환, 달러 선택 시 `ExchangeRateHint`로 환율 안내. 환율·검증은 상위(훅/모달)에서 처리
- `ExchangeRateHint` — 환율 안내 (필요 시 재사용)
- `EmptyState` — 빈 상태 표시

### 기능 컴포넌트
- `ExpenseList` / `ExpenseItem` — 고정비 목록·항목
- `AddExpenseModal` — 고정비 추가/수정 모달
- `VariableExpenseList` / `VariableExpenseItem` — 유동비 목록·항목
- `AddVariableExpenseModal` — 유동비 추가/수정 모달
- `TotalAmountCard` / `VariableTotalAmountCard` — 총액 카드
- `ExpenseVisualization` / `VariableExpenseVisualization` — 데이터 시각화

## 🔧 개발 가이드

### lib vs utils
- **lib** (`src/lib/`): 범용·인프라(에러, 로거, 스토리지, react-query 유틸). 앱 비즈니스에 무관한 코드.
- **utils** (`src/utils/`): 앱 도메인(날짜·금액 포맷, 검증, 반응형). 포맷/검증은 여기서 단일 소스 유지. 자세한 역할은 [docs/development/architecture.md](docs/development/architecture.md) 참고.

### 코드 스타일
- TypeScript strict 모드
- 함수형 컴포넌트 및 Hooks
- React.memo, useMemo, useCallback 활용

### 데이터베이스
- SQLite 로컬 저장, React Query 캐시·페이지네이션
- Optimistic Update로 즉각적인 UI 반영

### 상태 관리
- **전역 UI**: React Context (`AppContext`)
- **비동기/서버 상태**: TanStack React Query v5 (`useInfiniteQuery`, 페이지 크기 10). Query Key는 `src/config/queryKeys.ts` Factory(databaseKeys, expenseKeys, exchangeRateKeys)로 중앙 관리
- **로컬**: useState, useReducer

### 반응형
- `useDeviceDimensions` 훅으로 디바이스 감지
- `PhoneLayout`, `TabletPortraitLayout`, `TabletLandscapeLayout` 사용

### 버전 관리
- `app.config.ts`의 `MARKETING_VERSION`(현재 2.2.2) 업데이트
- 프로덕션 빌드 전 버전 업데이트 권장

## 🧪 테스트

### 단위 테스트 (Jest)
- `npm test` — `src/utils/amount.ts`, `src/utils/validation.ts` 등 단위 테스트
- 금액 포맷/변환, 폼 검증 등 핵심 로직 회귀 방지

### E2E 테스트 (Playwright)
- **대상**: Expo 웹 빌드 (`npm run web` → localhost:8081)
- **선택자**: `accessibilityLabel`(aria-label/role) 및 보조로 `getTestProps(id)`의 `data-testid`(웹)/`testID`(네이티브) 사용 가능
- **최초 1회**: `npx playwright install`(또는 `npx playwright install chromium`) 로 브라우저 설치
- **실행**
  - **방법 A (수동)**: 터미널 1에서 `npm run web` 또는 `npm run web:clear` → 터미널 2에서 `npm run test:e2e:run`
  - **방법 B (한 번에)**: `npm run test:e2e` — 웹 서버 자동 기동 후 Playwright 실행 (포트 8081 비어 있어야 함)
- **다른 포트 사용 시**: `E2E_BASE_URL=http://localhost:<포트> npm run test:e2e:run`
- **상세**: [docs/testing/e2e-testing.md](docs/testing/e2e-testing.md) — 시나리오, testID 가이드, 제한 사항(웹 날짜 선택 등), 실패 시 체크리스트

## 🔧 문제 해결 (캐시·의존성)

- **Metro "Unable to deserialize cloned data" / 웹 번들 오류**: `npm run web:clear`(또는 `npx expo start --web --clear`)로 Metro 캐시를 비운 뒤 웹을 다시 띄운다. 반복되면 OS 임시 디렉터리 내 `metro-file-map-*` 파일을 수동 삭제 후 동일 명령 실행. ([E2E 테스트](docs/testing/e2e-testing.md) 문서의 "Metro 캐시" 섹션 참고.)

빌드/실행 오류 시 아래 순서로 시도해 보세요.

```bash
# 캐시 클리어 후 웹 export
npx expo export -c

# 의존성 재설치 (Windows PowerShell)
Remove-Item -Recurse -Force node_modules; Remove-Item -Force package-lock.json
npm cache clean --force
npm install
```

Unix/macOS:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📝 주요 기능 상세

### 고정비 / 유동비 관리
- 이름, 금액, 결제일(또는 지출일), 메모(유동비) 입력
- **금액**: 원(KRW) 또는 달러(USD) 선택 후 입력 — 달러는 실시간 환율로 원화 변환 저장 ([금액·통화 기능](docs/features/amount-currency.md))
- 실시간 유효성 검사, 천 단위 구분자 자동 포맷팅

### 데이터 시각화
- 금액별 그룹화 (고액/중액/저액), 항목별 비율, Progress Bar 애니메이션

### 성능
- 페이지네이션, React.memo, Optimistic Update

## 🚀 배포

- **앱 버전**: `app.config.ts`의 `MARKETING_VERSION`(현재 2.2.2)에서 관리
- **환경**: development / preview / production (각각 별도 번들 ID)
- **EAS Update**: `checkAutomatically: "ON_LOAD"` 로 OTA 업데이트 지원
- **Android**: minSdk 24, targetSdk 34

## 🔒 접근성

- 인터랙티브 요소에 `accessibilityLabel` 추가 (웹에서는 `aria-label`로 매핑)
- E2E/테스트용 식별자: `src/utils/test-utils.ts`의 `getTestProps(id)`로 웹 `data-testid`/네이티브 `testID` 부여
- 스크린 리더·키보드 네비게이션 지원

## 📄 추가 문서

**전체 목차**: [docs/README.md](docs/README.md) — 주제별 폴더 인덱스(user·development·features·testing·deployment·planning·archive)

- [사용 가이드](docs/user/guides.md) — 지난달 유동비 보기, 월 선택 FAQ
- [개발 가이드](docs/development/architecture.md) — 아키텍처(lib/utils/config), 에러 처리
- [트러블슈팅](docs/development/troubleshooting.md) — PowerShell npx 오류, Metro 캐시
- [금액·통화 기능](docs/features/amount-currency.md) — 원/달러 입력, 환율 API
- [유동비 월별 관리](docs/features/variable-expense-month.md) — 월 선택·캐싱 설계
- [E2E 테스트](docs/testing/e2e-testing.md) — Playwright, testID, 실행 방법
- [배포](docs/deployment/README.md) — 프로덕션 체크리스트, EAS Workflows, 웹 배포
- [설계·계획](docs/planning/plans.md) — 리팩토링·디자인 설계
