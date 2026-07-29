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
| **선택자** | 접근성 라벨(`accessibilityLabel`) → DOM `aria-label` / `role` 기반 (`getByRole`, `getByLabelText`). 보조로 `getTestProps(id)`가 부여한 `testID` 사용 (`getByTestId` — react-native-web이 `data-testid`로 매핑. 웹 분기로 `data-testid`를 직접 넘기면 RNW 0.21+에서 DOM에 전달되지 않으므로 금지) |
| **CI** | `npm run web` 기동 후 `npx playwright test` 실행 (동일 머신 또는 별도 job) |

## 시나리오

1. **Smoke**: 앱 로드 후 메인 화면 표시(고정비/유동비 탭, 총액 카드 또는 빈 상태)
2. **고정비 추가(원화)**: 고정비 탭 → 항목 추가 → 이름·금액(원)·결제일 입력 → 추가하기 → 모달 닫힘 + **목록 반영(고유 이름 노출)·총액 반영(기존 총액 + 입력 금액)** 검증
3. **유동비 추가(원화)**: 유동비 탭 → 항목 추가 → 이름·금액(원)·지출일 입력 → 추가하기 → 모달 닫힘 + **목록·총액 반영** 검증(2번과 동일 패턴)
4. **금액 통화 전환(선택)**: 추가 모달에서 "달러로 입력" 클릭 → 금액 입력 → "원으로 입력" 복귀 후 제출 가능 여부 확인

## 제한 사항

- **웹 빌드**: `metro.config.js`에 `resolver.assetExts`에 `wasm`을 추가해 두었으므로 `expo-sqlite` 웹 번들이 가능함. 배포 시 웹 서버에 **COOP/COEP** 헤더가 필요할 수 있음 → [웹 배포](#웹-배포) 참고.
- **날짜 선택**: 웹에서는 고정비/유동비 모달에 **텍스트 날짜 입력**(`YYYY-MM-DD`)이 노출되므로, E2E에서 결제일/지출일 입력 후 저장 플로우까지 검증 가능.
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
- **웹에서 하는 것**: 결제일/지출일은 텍스트 필드(`data-testid="date-picker"`)로 `YYYY-MM-DD` 입력 가능. 이름·금액·날짜 입력 후 저장 플로우 E2E 포함.
- **선택자**: `accessibilityLabel` → DOM `aria-label` / `role` 기준. RN Web 차이로 `aria-selected` 등은 플랫폼별로 다를 수 있음. 탭 전환은 "탭 클릭 후 다른 탭 보임" 등으로 검증.
- **testID**: `src/utils/test-utils.ts`의 `getTestProps(id)`로 주요 요소에 `data-testid`(웹)/`testID`(네이티브)가 부여됨. E2E에서 `page.getByTestId('amount-input')`, `page.getByTestId('currency-toggle')`, `page.getByTestId('tab-fixed')` 등으로 보조 사용 가능.
- **총액 검증 패턴**: 총액 카드의 금액 요소에 `fixed-total-amount`/`variable-total-amount` testID가 있고, 해당 요소의 `aria-label`("총액 N원")은 **카운트업 애니메이션과 무관하게 최종값을 즉시 반영**한다 — 애니메이션 중인 표시 텍스트 대신 aria-label을 파싱해 "기존 총액 + 입력 금액"을 정확 비교한다(fixed/variable spec의 저장 검증 참고).
- **고정비/유동비 모달**: 제출 버튼은 `getByRole('button', { name: '추가하기' })` 로만 대상 (화면의 FAB "항목 추가"와 구분).

## Metro 캐시 (Unable to deserialize cloned data)

- Metro가 "Error while reading cache, falling back to a full crawl" 및 "Unable to deserialize cloned data"를 출력하면 디스크 캐시가 손상되었거나 Node/V8 버전 불일치일 수 있음. **권장**: e2e 및 웹 개발 시 주기적으로 `npm run web:clear`(또는 `npx expo start --web --clear`) 사용.
- 문제가 반복되면 Metro 파일맵 캐시를 수동 삭제: OS 임시 디렉터리(예: Windows `%TEMP%`, macOS/Linux `$TMPDIR`) 내 `metro-file-map-*` 파일을 삭제한 뒤 `npm run web:clear`로 웹을 다시 띄운다.

## 웹 배포

웹 앱을 정적 빌드하여 호스팅할 때 다음을 적용한다.

1. **정적 빌드 절차**
   - `npx expo export --platform web`로 `dist/`(또는 설정된 출력 디렉터리)에 정적 파일 생성.
   - 생성된 파일을 웹 서버 또는 CDN에 업로드. 루트를 SPA로 서빙하려면 `index.html` 기준 fallback(예: Nginx `try_files`) 설정.

2. **COOP/COEP 헤더**
   - `expo-sqlite` 웹 번들(WASM) 사용 시 공유 배열 메모리 요구로 다음 헤더가 필요할 수 있음([Expo SQLite 웹 설정](https://docs.expo.dev/versions/latest/sdk/sqlite#web-setup)):
     - `Cross-Origin-Opener-Policy: same-origin`
     - `Cross-Origin-Embedder-Policy: require-corp`
   - Nginx 예: `add_header Cross-Origin-Opener-Policy same-origin;` / `add_header Cross-Origin-Embedder-Policy require-corp;`
   - 필요 시 에셋(worker, wasm)에 `Cross-Origin-Resource-Policy` 등 추가.
   - 상세 절차·Nginx 예시는 [deploy-web.md](../deployment/deploy-web.md) 참고.

## 설계·작업 시 고려 사항

- React Native Web 렌더링 차이로 일부 선택자는 `data-testid` 보강 시 추가 가능
- 날짜 선택기(네이티브/웹 대화상자)는 플랫폼별로 다를 수 있음 — 웹에서는 가능한 한 동일 라벨/역할로 조작
- DB(SQLite) 상태는 테스트 전 초기화 또는 격리된 스토리지 사용 검토(현재는 단일 앱 인스턴스 가정)
