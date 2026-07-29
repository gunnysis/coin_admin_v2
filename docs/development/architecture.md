# 개발 가이드: 아키텍처·에러 처리

폴더 역할(lib/utils/config)과 비동기·동기 에러 처리 위치 정리. 설계·계획은 [plans.md](../planning/plans.md) 참고.

---

## 1. 아키텍처 (폴더 역할)

### 전체 폴더 맵

- **`src/features/`**: 도메인별 Feature(`fixed-expenses`, `variable-expenses`, `settings`) — 각 Feature 컴포넌트가 해당 도메인의 로직·UI를 캡슐화.
- **`src/components/`**: 재사용 컴포넌트(`ui/` 기본 요소, `layouts/` 반응형 레이아웃 3종, 시각화·리스트 등).
- **`src/contexts/`**: 전역 상태 — `AppContext`(모달·선택·로딩), `ThemeContext`(light/dark/system, `Storage` 영속).
- **`src/hooks/`**: 커스텀 훅(데이터 조회·핸들러·환율·햅틱·월 비교 등).
- **`src/database/`**: expo-sqlite 접근 계층(`db.ts`).
- **`src/lib/` · `src/utils/` · `src/config/`**: 아래 상세.

### lib vs utils

- **`src/lib/`**: 범용·인프라용 유틸. 에러 타입/정규화(`errors`), 로거(`logger`), React Query 유틸(`react-query`), 스토리지(`storage`), DB 헬퍼(`db-utils`), 배열/객체/성능 유틸(`array`, `object`, `performance`, `hooks`), 에러 리포팅(`errorReporting`), **백업**(`backup/`: 스냅샷 타입, 어댑터 인터페이스, `backupService`, `LocalBackupAdapter`) 등 앱에 종속되지 않는 유틸. hooks·서비스 레이어에서 사용.
- **`src/utils/`**: 앱 도메인 유틸. 날짜·금액 포맷(`date`, `format`, `amount`), 지출 폼 검증(`validation` — `ValidationResult`의 단일 소스), 반응형 계산(`responsive`), 에러 메시지 포맷(`errorHandler`), E2E용 `getTestProps`(`test-utils`) 등. 컴포넌트·훅에서 사용. (과거 `lib/validation.ts`가 같은 이름의 `ValidationResult`를 중복 정의했으나 미사용 확인 후 2026-07-29 제거 — 검증은 utils에만 둔다.)

포맷팅(금액, 날짜)은 **단일 소스**로 `utils/format.ts`, `utils/date.ts` 등에만 두고, `lib`에서는 재export하지 않습니다.

### config

- **`src/config/`**: 앱 설정·상수. `constants.ts`(환율, 메시지 등), `queryClient.ts`(전역 기본값: staleTime 5분/gcTime 10분), **`queryKeys.ts`**(React Query Key Factory: `databaseKeys`, `expenseKeys`, `exchangeRateKeys`). Query Key는 여기서 중앙 관리하고, 소비처(hooks·BackupRestoreSection)는 `@/config/queryKeys`에서 직접 import합니다(re-export 없음).

---

## 2. 에러 처리

### 비동기 에러 (모달 제출, 새로고침)

- **모달 제출 (고정비/유동비 추가·수정)**  
  모달 `handleSubmit`이 DB를 호출하고, 실패 시 `formatError`/`logError` 후 `Alert`로 사용자 노출. Feature 쪽 핸들러는 성공 시 모달 닫기, 에러 시 `throw` → 모달 `catch`에서 Alert. **에러 표시는 모달에서만.**

- **Pull-to-refresh**  
  에러 시 로딩 상태 해제 후 `Alert.alert('새로고침 실패', ...)`로 사용자에게 알림 (FixedExpenseFeature / VariableExpenseFeature).

- **환율 API (달러 입력 시)**  
  `useExchangeRate` 실패 시 fallback 환율(1,400원) 사용. 저장 가능. 달러 선택 시 `ExchangeRateHint`가 환율(로딩/1 USD ≈ n원/기본 환율 안내)을 표시.

### 동기 에러 (렌더/이벤트)

- **ErrorBoundary**  
  루트에서 앱 전체 감쌈. 렌더 중 예외 → 폴백 UI + `console.error`. 비동기 에러는 잡지 않으므로 try/catch 필수.

### 에러 리포팅 (프로덕션)

- `src/lib/errorReporting.ts` — 프로덕션 빌드에서 `EXPO_PUBLIC_SENTRY_DSN`이 설정된 경우에만 Sentry 초기화(`@sentry/react-native`). `logger.setErrorReporter()`를 연결해 `logger.error` 호출이 Sentry로 전송된다. dev 또는 DSN 미설정 시 no-op. 상세: [프로덕션 배포](../deployment/production-deployment.md).

### 정리

| 구분 | 처리 위치 | 사용자 노출 |
|------|-----------|-------------|
| 모달 제출 실패 | 모달 `catch` | Alert (formatError 메시지) |
| 새로고침 실패 | Feature 컴포넌트 | Alert ("새로고침 실패") |
| 환율 API 실패 | useExchangeRate | fallback 환율 |
| 렌더/동기 예외 | ErrorBoundary | 폴백 UI + 로그 |
| 백업/복구 실패 | BackupRestoreSection | 카드 내 에러 문구 |
