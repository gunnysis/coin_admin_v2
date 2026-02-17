# 에러 처리

## 비동기 에러 (모달 제출, 새로고침)

- **모달 제출 (고정비/유동비 추가·수정)**  
  - 모달 내부에서 `handleSubmit`이 API(DB)를 호출하고, 실패 시 `formatError`/`logError` 후 `Alert`로 사용자에게 메시지를 띄웁니다.  
  - Feature 쪽 `handleAddExpense` / `handleAddVariableExpense`는 성공 시 모달을 닫고, 에러 시 `throw`하여 모달로 전달합니다. 모달의 `catch`에서 Alert를 띄우므로, **에러 표시는 모달에서만** 합니다.

- **Pull-to-refresh**  
  - App에서 `onFixedRefresh` / `onVariableRefresh`가 핸들러를 호출합니다.  
  - 에러가 나도 `setFixedRefreshing(false)` 등으로 로딩 상태만 해제하고, 사용자에게 별도 Alert는 띄우지 않습니다. (필요 시 핸들러 내부 또는 App에서 Alert 추가 가능.)

- **환율 API (달러 입력 시)**  
  - `useExchangeRate` 훅에서 실패 시 fallback 환율(1,400원)을 사용합니다.  
  - 사용자는 저장을 계속할 수 있고, UI에서 `ExchangeRateHint`가 "(기본 환율)"을 표시할 수 있습니다.

## 동기 에러 (렌더/이벤트 중 발생)

- **ErrorBoundary**  
  - `index.tsx` 루트에서 `ErrorBoundary`로 앱 전체를 감쌉니다.  
  - 렌더링 중 발생한 예외를 잡아서 폴백 UI를 보여주고, `console.error`로 로그를 남깁니다.  
  - 하위에서 throw된 비동기 에러는 ErrorBoundary가 잡지 않으므로, 비동기 작업은 반드시 try/catch로 처리합니다.

## 정리

| 구분 | 처리 위치 | 사용자 노출 |
|------|-----------|-------------|
| 모달 제출 실패 | 모달 `catch` | Alert (formatError 메시지) |
| 새로고침 실패 | App / 핸들러 | 현재 없음 (로딩만 해제) |
| 환율 API 실패 | useExchangeRate | fallback 환율 사용, 필요 시 "(기본 환율)" 표시 |
| 렌더/동기 예외 | ErrorBoundary | 폴백 UI + 로그 |
