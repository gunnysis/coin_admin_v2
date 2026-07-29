# 금액 통화 입력 (원 / 달러) 기능

고정비·유동비 입력 시 원/달러 선택, 실시간 환율 변환, 저장 시 원화 정수 저장.

## 개요

고정비·유동비 입력 시 **원(KRW)** 또는 **달러(USD)** 로 금액을 입력할 수 있으며, 달러 입력 시 **실시간 환율 API**로 원화로 변환한 뒤 DB에는 항상 **원(KRW) 정수**로만 저장됩니다.

**설계 원칙**: 기본 통화는 **원(한국 원화)**. **금액 입력이 주인공**이고, 통화는 **원 | 달러 Segmented Control**로 전환. 달러 선택 시 저장 시점에 원화로 변환. 수정 시에도 달러 입력 가능하며, 추가와 동일하게 원화 변환하여 저장. **환율 힌트 UI는 표시하지 않는다** — "변환은 저장 시에만" 원칙으로 UI 노출을 의도적으로 제거했다(커밋 cbe37be, 2026-02-17). `ExchangeRateHint` 컴포넌트는 재사용 대비로 정의만 남아 있고 **현재 어디에도 배선되지 않음**.

**에러·안정성**: 금액 검증(빈 값/NaN/0 이하), 달러 제출 시 환율 로딩 차단, API 실패 시 fallback 환율 사용으로 저장 실패를 막음. 타입(AmountCurrency, number)과 단일 책임(훅/UI/검증 분리)으로 일관된 동작을 유지.

## 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│  AddExpenseModal / AddVariableExpenseModal                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  AmountInputSection (공통) — 한 블록 그룹핑                    │ │
│  │  ├── InputField (금액) — 기본 원화, 입력 우선                 │ │
│  │  └── 원 | 달러 Segmented Control (통화 전환)                  │ │
│  │  (환율 힌트 UI 없음 — 변환은 저장 시에만, cbe37be에서 제거)    │ │
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
| **환율 조회** | TanStack Query v5 — `queryFn({ signal })`, 언마운트/중복 시 자동 취소 |
| **캐시** | `staleTime` / `gcTime` 1시간 |
| **Fallback** | API 실패 시 `EXCHANGE_RATE.USD_KRW_FALLBACK`(1,400원) |
| **타입** | `AmountCurrency` — `types/common.ts` |
| **공통 UI** | `AmountInputSection` — 고정비/유동비 동일 UX |

## 주요 파일

| 경로 | 역할 |
|------|------|
| `src/config/constants.ts` | `EXCHANGE_RATE.API_URL`, `USD_KRW_FALLBACK` |
| `src/utils/amount.ts` | `formatAmount`, `parseAmount`, `usdToKrw(usd, rate)` |
| `src/hooks/useExchangeRate.ts` | 환율 조회 훅 |
| `src/hooks/useAmountWithCurrency.ts` | 금액·통화 상태, `getAmountInKrw(rate)` |
| `src/components/ui/AmountInputSection.tsx` | 금액 입력 + 원/달러 Segmented Control |
| `src/components/ui/ExchangeRateHint.tsx` | 환율 안내 컴포넌트 — **현재 미배선(미사용)**. cbe37be에서 UI 노출 제거 후 잔존 |

## UX/UI 정리

- **기본**: 금액 입력 필드가 주인공. 기본 통화 원(KRW). 통화 전환은 원 | 달러 Segmented Control, 44pt 터치 영역, 햅틱. 모달 오픈 시 금액 필드 자동 포커스.
- **환율 표시**: 하지 않음 — 달러 선택 시에도 환율 안내 없이 저장 시 변환만 수행. 환율 로딩 중 달러 제출은 알림으로 차단, API 실패 시 fallback(1,400원)으로 저장. **fallback 사용 여부도 UI에 표시되지 않음**(모달이 `isFallback` 값을 받아서 사용하지 않음 — 표시가 필요해지면 `ExchangeRateHint` 재배선 검토).

## API 사양

- **Frankfurter API**: `GET https://api.frankfurter.app/latest?from=USD&to=KRW` (기본)
- **오버라이드**: `EXPO_PUBLIC_EXCHANGE_RATE_URL` 환경변수
- **응답**: `{ rates: { KRW: number } }`

## 데이터 흐름

1. 통화 선택 후 금액 입력.
2. 제출: KRW → 그대로 저장; USD → `getAmountInKrw(exchangeRate)` 후 저장.
3. 환율 로딩 중 달러 제출 시 알림으로 차단.

## 에러·검증

- 금액: `validateAmount(amount)` — 빈 값/NaN/0 이하 시 에러. 제출 전 폼 검증·환율 로딩 차단.
- 환율 실패 시 fallback 사용.

## 관련 문서

- [개발 가이드](../development/architecture.md) — 아키텍처·에러 처리
- [설계·계획](../planning/plans.md) — 리팩토링·디자인
- [프로젝트 README](../../README.md) — 개발 가이드·접근성
