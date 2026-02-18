# E2E 테스트 설계

Expo 웹 빌드 대상 Playwright E2E 시나리오·실행 방법·제한 사항.

## 목표

- **웹 빌드**(Expo `expo start --web`) 대상으로 주요 사용자 시나리오를 자동화하여 회귀 방지 및 품질 보증
- 금액·통화(원/달러) 플로우 포함

## 범위

| 구분 | 내용 |
|------|------|
| **대상** | Expo 웹 앱 (`npm run web` → 8081, `npm run test:e2e` 시 `web:e2e` → 8082) |
| **도구** | Playwright (Chromium 기준, 필요 시 WebKit/Firefox 확장) |
| **선택자** | 접근성 라벨(`accessibilityLabel`) → DOM `aria-label` / `role` 기반 (`getByRole`, `getByLabelText`). 보조로 `getTestProps(id)`로 부여한 `data-testid`/`testID` 사용 가능 (`getByTestId`) |
| **CI** | `npm run web` 기동 후 `npx playwright test` 실행 (동일 머신 또는 별도 job) |

## 시나리오

1. **Smoke**: 앱 로드 후 메인 화면 표시(고정비/유동비 탭, 총액 카드 또는 빈 상태)
2. **고정비 추가(원화)**: 고정비 탭 → 항목 추가 → 이름·금액(원)·결제일 입력 → 추가하기 → 목록/총액 반영
3. **유동비 추가(원화)**: 유동비 탭 → 항목 추가 → 이름·금액(원)·지출일 입력 → 추가하기 → 목록 반영
4. **금액 통화 전환(선택)**: 추가 모달에서 "달러로 입력" 클릭 → 금액 입력 → "원으로 입력" 복귀 후 제출 가능 여부 확인

## 제한 사항

- **웹 빌드**: `metro.config.js`에 `resolver.assetExts`에 `wasm`을 추가해 두었으므로 `expo-sqlite` 웹 번들이 가능함. 배포 시 웹 서버에 `Cross-Origin-Embedder-Policy`, `Cross-Origin-Opener-Policy` 헤더가 필요할 수 있음([Expo SQLite 웹 설정](https://docs.expo.dev/versions/latest/sdk/sqlite#web-setup)).
- **날짜 선택**: 웹에서는 `DateTimePicker`가 렌더되지 않아 결제일/지출일을 선택할 수 없음. 따라서 E2E에서는 "이름·금액만 입력 시 추가하기 비활성화" 등 검증만 포함하며, 실제 저장까지의 전체 플로우는 네이티브 또는 웹용 날짜 입력 추가 후 확장 가능.
- **첫 실행**: Playwright 브라우저 미설치 시 `npx playwright install`(또는 `npx playwright install chromium`) 한 번 실행 필요.

## 비범위(현재)

- 네이티브(iOS/Android) E2E (Maestro/Detox 등 별도 검토)
- 환율 API 목(mock) 처리 — 실제 API 또는 fallback 사용
- 시각적 스냅샷/퍼시스턴스 테스트

## 디렉터리 및 실행

- **경로**: `e2e/` (Playwright 설정 및 스펙)
- **설정**: `playwright.config.ts` — 서버 기동 포함(포트 **8082** 사용, 8081 충돌 방지). `playwright.run.config.ts` — 서버 기동 없이 `E2E_BASE_URL`(기본 8081)로 접속.

### 실행 방법

- **방법 A (권장·수동)**  
  1. 터미널 1: `npm run web:clear` 또는 `npm run web`  
  2. 브라우저에서 `http://localhost:8081` 이 에러 없이 로드되는지 확인  
  3. 터미널 2: `npm run test:e2e:run`  
- **방법 B (한 번에)**: `npm run test:e2e` — **8082** 포트로 `npm run web:e2e` 자동 기동 후 Playwright 실행 (8081 사용 중이어도 무방).  
- 포트가 다르면: `E2E_BASE_URL=http://localhost:<포트> npm run test:e2e:run` (예: `E2E_BASE_URL=http://localhost:8082 npm run test:e2e:run`).

### 실패 시 확인 (체크리스트)

- `test:e2e:run` 만 실행했다면: **서버가 8081에서 떠 있는가?** 터미널 1에서 `npm run web` 또는 `npm run web:clear` 를 먼저 실행했는지 확인.
- 8081 포트를 사용 중인 다른 프로세스가 있는지 확인.
- Metro 캐시: `npm run web:clear` 실행. 문제가 반복되면 OS 임시 디렉터리(Windows `%TEMP%` 등) 내 `metro-file-map-*` 삭제 후 다시 시도.
- Playwright 브라우저 미설치 시: `npx playwright install chromium` 실행.

### 웹 E2E 범위 및 한계

- **웹에서 검증하는 것**: 로드, 탭 전환, 모달 열기, 이름·금액 입력, 버튼 활성화(날짜 기본값 오늘 적용 시) 등 **웹에서 존재하는 시나리오만**.
- **웹에서 하지 않는 것**: 날짜 선택기 조작(웹에서는 미렌더), "날짜 미선택 시 비활성화"처럼 **웹에서는 발생하지 않는 상태** 검증.
- **선택자**: `accessibilityLabel` → DOM `aria-label` / `role` 기준. RN Web 차이로 `aria-selected` 등은 플랫폼별로 다를 수 있음. 탭 전환은 "탭 클릭 후 다른 탭 보임" 등으로 검증.
- **testID**: `src/utils/test-utils.ts`의 `getTestProps(id)`로 주요 요소에 `data-testid`(웹)/`testID`(네이티브)가 부여됨. E2E에서 `page.getByTestId('amount-input')`, `page.getByTestId('currency-toggle')`, `page.getByTestId('tab-fixed')` 등으로 보조 사용 가능.
- **고정비/유동비 모달**: 제출 버튼은 `getByRole('button', { name: '추가하기' })` 로만 대상 (화면의 FAB "항목 추가"와 구분).

## Metro 캐시 (Unable to deserialize cloned data)

- Metro가 "Error while reading cache, falling back to a full crawl" 및 "Unable to deserialize cloned data"를 출력하면 디스크 캐시가 손상되었거나 Node/V8 버전 불일치일 수 있음. **권장**: e2e 및 웹 개발 시 주기적으로 `npm run web:clear`(또는 `npx expo start --web --clear`) 사용.
- 문제가 반복되면 Metro 파일맵 캐시를 수동 삭제: OS 임시 디렉터리(예: Windows `%TEMP%`, macOS/Linux `$TMPDIR`) 내 `metro-file-map-*` 파일을 삭제한 뒤 `npm run web:clear`로 웹을 다시 띄운다.

## 설계·작업 시 고려 사항

- React Native Web 렌더링 차이로 일부 선택자는 `data-testid` 보강 시 추가 가능
- 날짜 선택기(네이티브/웹 대화상자)는 플랫폼별로 다를 수 있음 — 웹에서는 가능한 한 동일 라벨/역할로 조작
- DB(SQLite) 상태는 테스트 전 초기화 또는 격리된 스토리지 사용 검토(현재는 단일 앱 인스턴스 가정)
