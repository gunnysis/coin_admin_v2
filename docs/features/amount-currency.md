# 금액 통화 입력 (원 / 달러) 기능

## 개요

고정비·유동비 입력 시 **원(KRW)** 또는 **달러(USD)** 로 금액을 입력할 수 있으며, 달러 입력 시 **실시간 환율 API**로 원화로 변환한 뒤 DB에는 항상 **원(KRW) 정수**로만 저장됩니다.

**설계 원칙**: 기본 통화는 **원(한국 원화)**. **금액 입력이 주인공**이고, 달러는 필요할 때만 "달러로 입력" 한 번 탭으로 전환. 사용자에게 환율 숫자는 보여주지 않고, 저장 시에만 원화 변환에 사용.

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
- **수정 모드**: 통화 전환 비활성화, 금액만 원으로 표시·편집.

## API 사양

- **Frankfurter API**: `GET https://api.frankfurter.app/latest?from=USD&to=KRW` (기본값)
- **환율 URL 오버라이드**: 환경변수 `EXPO_PUBLIC_EXCHANGE_RATE_URL`을 설정하면 해당 URL을 사용합니다. 테스트/스테이징에서 다른 엔드포인트 사용 시 유용합니다.
- **응답**: `{ rates: { KRW: number } }`
- **제한**: 무료, API 키 불필요. 캐시 1시간으로 호출 빈도 최소화.

## 데이터 흐름

1. 사용자가 통화(원/달러) 선택 후 금액 입력.
2. 제출 시: `amountCurrency === 'KRW'` → `amount` 그대로 원으로 저장; `'USD'` → `getAmountInKrw(exchangeRate)`로 원화 정수 계산 후 저장.
3. 환율 로딩 중에 달러로 제출 시: "환율을 불러오는 중입니다. 잠시 후 다시 시도해주세요." 알림으로 차단.

## 관련 문서

- [개발 가이드](../../README.md#-개발-가이드) — 코드 스타일, 상태 관리, 반응형
- [접근성](../../README.md#-접근성) — 스크린 리더, 키보드 네비게이션
