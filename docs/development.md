# 개발 가이드: 아키텍처·에러 처리

폴더 역할(lib/utils/config)과 비동기·동기 에러 처리 위치 정리. 설계·계획은 [plans.md](plans.md) 참고.

---

## 1. 아키텍처 (폴더 역할)

### lib vs utils

- **`src/lib/`**: 범용·인프라용 유틸. 에러 타입/정규화(`errors`), 로거(`logger`), React Query 유틸(`react-query`), 스토리지(`storage`), DB 헬퍼(`db-utils`) 등 앱에 종속되지 않는 유틸. hooks·서비스 레이어에서 사용.
- **`src/utils/`**: 앱 도메인 유틸. 날짜·금액 포맷(`date`, `format`, `amount`), 지출 폼 검증(`validation`), 반응형 계산(`responsive`), 에러 메시지 포맷(`errorHandler`), E2E용 `getTestProps`(`test-utils`) 등. 컴포넌트·훅에서 사용.

포맷팅(금액, 날짜)은 **단일 소스**로 `utils/format.ts`, `utils/date.ts` 등에만 두고, `lib`에서는 재export하지 않습니다.

### config

- **`src/config/`**: 앱 설정·상수. `constants.ts`(환율, 메시지 등), **`queryKeys.ts`**(React Query Key Factory: `databaseKeys`, `expenseKeys`, `exchangeRateKeys`). Query Key는 여기서 중앙 관리하고 `constants`에서 re-export합니다.

---

## 2. 에러 처리

### 비동기 에러 (모달 제출, 새로고침)

- **모달 제출 (고정비/유동비 추가·수정)**  
  모달 `handleSubmit`이 DB를 호출하고, 실패 시 `formatError`/`logError` 후 `Alert`로 사용자 노출. Feature 쪽 핸들러는 성공 시 모달 닫기, 에러 시 `throw` → 모달 `catch`에서 Alert. **에러 표시는 모달에서만.**

- **Pull-to-refresh**  
  에러 시 로딩 상태만 해제, 별도 Alert 없음. (필요 시 핸들러/App에서 Alert 추가 가능.)

- **환율 API (달러 입력 시)**  
  `useExchangeRate` 실패 시 fallback 환율(1,400원) 사용. 저장 가능. UI에서 "(기본 환율)" 표시 가능.

### 동기 에러 (렌더/이벤트)

- **ErrorBoundary**  
  루트에서 앱 전체 감쌈. 렌더 중 예외 → 폴백 UI + `console.error`. 비동기 에러는 잡지 않으므로 try/catch 필수.

### 정리

| 구분 | 처리 위치 | 사용자 노출 |
|------|-----------|-------------|
| 모달 제출 실패 | 모달 `catch` | Alert (formatError 메시지) |
| 새로고침 실패 | App / 핸들러 | 없음 (로딩만 해제) |
| 환율 API 실패 | useExchangeRate | fallback 환율 |
| 렌더/동기 예외 | ErrorBoundary | 폴백 UI + 로그 |
