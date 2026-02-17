# 금액 통화 입력 (원 / 달러) 기능

## 개요

고정비·유동비 입력 시 **원(KRW)** 또는 **달러(USD)** 로 금액을 입력할 수 있으며, 달러 입력 시 **실시간 환율 API**로 원화로 변환한 뒤 DB에는 항상 **원(KRW) 정수**로만 저장됩니다.

**설계 원칙**: 기본 통화는 **원(한국 원화)**. **금액 입력이 주인공**이고, 달러는 필요할 때만 "달러로 입력" 한 번 탭으로 전환. 사용자에게 환율 숫자는 보여주지 않고, 저장 시에만 원화 변환에 사용. 수정 시에도 달러 입력 가능하며, 추가와 동일하게 원화 변환하여 저장.

**에러·안정성**: 금액 검증(빈 값/NaN/0 이하), 달러 제출 시 환율 로딩 차단, API 실패 시 fallback 환율 사용으로 저장 실패를 막음. 타입(AmountCurrency, number)과 단일 책임(훅/UI/검증 분리)으로 일관된 동작을 유지.

## 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│  AddExpenseModal / AddVariableExpenseModal                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  AmountInputSection (공통) — 한 블록 그룹핑                    │ │
│  │  ├── InputField (금액) — 기본 원화, 입력 우선                 │ │
│  │  └── "달러로 입력" / "원으로 입력" 단일 링크 (통화 전환)       │ │
│  │  (환율은 UI에 표시하지 않음, 제출 시 변환에만 사용)            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  useAmountWithCurrency()  useExchangeRate()                        │
└─────────────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
   amount, getAmountInKrw   rate, isLoading, isFallback
         │                    │
         └────────┬───────────┘
                  ▼
            제출 시 amountInKrw = getAmountInKrw(rate)
                  ▼
            DB 저장 (항상 원 정수)
```

## 기술 스택 및 최신 적용 사항

| 항목 | 적용 내용 |
|------|-----------|
| **환율 조회** | TanStack Query (React Query) v5 — `queryFn({ signal })` 로 `fetch(url, { signal })` 사용, 언마운트/중복 요청 시 자동 취소 |
| **캐시** | `staleTime` / `gcTime` 1시간 — 불필요한 API 호출 최소화 |
| **Fallback** | API 실패 시 `EXCHANGE_RATE.USD_KRW_FALLBACK`(1,400원) 사용, 사용자는 항상 저장 가능 |
| **타입** | `AmountCurrency`는 `types/common.ts`에 정의, UI·훅에서 공통 사용 |
| **공통 UI** | `AmountInputSection`으로 고정비/유동비 모달 동일 UX. 금액 입력 우선, 통화 전환은 단일 텍스트 링크 |

## 주요 파일

| 경로 | 역할 |
|------|------|
| `src/config/constants.ts` | `EXCHANGE_RATE.API_URL`, `EXCHANGE_RATE.USD_KRW_FALLBACK` |
| `src/utils/amount.ts` | `formatAmount`, `parseAmount`, `usdToKrw(usd, rate)` |
| `src/hooks/useExchangeRate.ts` | 환율 조회 훅 (React Query + AbortSignal) |
| `src/hooks/useAmountWithCurrency.ts` | 금액·통화 상태 및 `getAmountInKrw(rate)` |
| `src/components/ui/ExchangeRateHint.tsx` | 환율 안내 컴포넌트 (현재 AmountInputSection에서는 미사용. 필요 시 재사용 가능) |
| `src/components/ui/AmountInputSection.tsx` | 금액 입력(기본 원화) + "달러로 입력"/"원으로 입력" 단일 링크, 한 블록 그룹핑. 환율 비노출 |

## UX/UI 정리

- **기본**: 금액 입력 필드가 시각적·동작상 주인공. 기본 통화는 원(KRW). 대부분 사용자는 금액만 입력하면 됨.
- **통화 전환**: 입력 필드 아래 **"달러로 입력"** / **"원으로 입력"** 텍스트 링크 하나만 표시. 탭 한 번으로 전환 후 금액 필드에 포커스 유지. 최소 터치 영역 44pt, 전환 시 햅틱. "찾아서 토글"하지 않고 한 동작으로 전환.
- **환율 비노출**: 사용자는 현재 환율을 확인할 필요 없음(저장 목적만 있음). 화면에 "1 USD ≈ X원" 등 표시하지 않음. 변환은 제출 시 백엔드에서만 사용.
- **블록 그룹핑**: 금액 라벨·입력 필드·통화 링크를 하나의 배경( gray50 )·패딩·라운드 블록으로 묶어 스캔 용이.
- **수정 모드**: 추가와 동일하게 통화 전환 가능. 수정 시에도 "달러로 입력"으로 달러 금액을 넣을 수 있으며, 저장 시 현재 환율로 원화 변환하여 저장.

## API 사양

- **Frankfurter API**: `GET https://api.frankfurter.app/latest?from=USD&to=KRW` (기본값)
- **환율 URL 오버라이드**: 환경변수 `EXPO_PUBLIC_EXCHANGE_RATE_URL`을 설정하면 해당 URL을 사용합니다. 테스트/스테이징에서 다른 엔드포인트 사용 시 유용합니다.
- **응답**: `{ rates: { KRW: number } }`
- **제한**: 무료, API 키 불필요. 캐시 1시간으로 호출 빈도 최소화.

## 데이터 흐름

1. 사용자가 통화(원/달러) 선택 후 금액 입력.
2. 제출 시: `amountCurrency === 'KRW'` → `amount` 그대로 원으로 저장; `'USD'` → `getAmountInKrw(exchangeRate)`로 원화 정수 계산 후 저장.
3. 환율 로딩 중에 달러로 제출 시: "환율을 불러오는 중입니다. 잠시 후 다시 시도해주세요." 알림으로 차단.

---

## 수정 시 달러 입력 설계

- **추가와 동일**: 고정비/유동비 수정 시에도 "달러로 입력" 링크 활성. 달러로 입력한 금액은 저장 시 **현재 환율로 원화 변환**하여 저장(추가 시와 동일).
- **초기값**: 수정 모드에서는 DB에 저장된 원화 금액을 불러와 **원(KRW)** 으로 표시. 사용자가 "달러로 입력"을 탭하면 달러 모드로 전환 후 새 금액 입력 가능.
- **통화 전환 비활성**: 제출 중(`isPending`)에만 통화 링크 비활성. 수정 모드 자체로는 비활성하지 않음.

---

## 에러·검증 설계

- **금액 검증**: `validateAmount(amount)` — 빈 값, NaN, 0 이하 시 에러 메시지. `amount`는 훅에서 숫자만 추출한 문자열(parseAmount 결과).
- **제출 차단**: (1) 폼 검증 실패 시 제출 버튼 비활성. (2) 달러 선택 시 환율 로딩 중이면 제출 시 알림으로 차단 후 `getAmountInKrw(rate)` 호출하지 않음.
- **환율 실패**: API 실패 시 `EXCHANGE_RATE.USD_KRW_FALLBACK` 사용. 사용자는 항상 저장 가능. UI에 환율 숫자는 표시하지 않음.
- **타입**: `AmountCurrency`는 `'KRW' | 'USD'`. `getAmountInKrw(rate)`에 항상 number 전달(훅/모달에서 보장).

---

## 설계·작업 시 고려 사항 (디버깅, 리팩토링, 성능, UX/UI, 가독성)

- **디버깅**: 금액/통화 관련 이슈 시 확인할 것 — (1) `amount`/`formattedAmount`/`amountCurrency` 상태 일치, (2) 제출 시 `getAmountInKrw(rate)` 입력(amount, rate) 유효성, (3) 수정 모드에서 `initialAmountKrw` 반영 여부. 필요 시 개발 환경에서만 로그로 변환 전후 값 확인.
- **리팩토링**: `AmountInputSection`은 금액·통화 표시/전환만 담당. 검증·제출·환율 조회는 모달/훅에 두어 단일 책임 유지. AmountInputSection은 `exchangeRate*` props를 받지 않음. 환율 조회·제출 시 변환은 모달에서 `useExchangeRate()`와 `getAmountInKrw(rate)`로만 사용.
- **성능**: 훅 내 `useCallback`/`useMemo`로 핸들러·파생 값 고정. 환율은 React Query 1시간 캐시로 중복 요청 최소화. 통화 전환 시 `onAfterCurrencyChange`로 포커스만 부여하고 불필요한 리렌더 최소화.
- **UX/UI**: 금액 입력 필드가 주인공. 통화 전환은 단일 링크 한 번 탭. 환율 비노출로 인지 부하 감소. 블록 그룹핑으로 스캔 용이. 최소 터치 영역 44pt, 전환 시 햅틱.
- **가독성·효율성**: 라벨/placeholder/helperText로 원·달러 구분. 접근성(accessibilityLabel/Hint/State) 유지. 수정 시에도 달러 입력 가능해 추가와 동일한 멘탈 모델 유지.

---

## 관련 문서

- [개발 가이드](../../README.md#-개발-가이드) — 코드 스타일, 상태 관리, 반응형
- [접근성](../../README.md#-접근성) — 스크린 리더, 키보드 네비게이션
