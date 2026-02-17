# 금액 통화 입력 (원 / 달러) 기능

## 개요

고정비·유동비 입력 시 **원(KRW)** 또는 **달러(USD)** 로 금액을 입력할 수 있으며, 달러 입력 시 **실시간 환율 API**로 원화로 변환한 뒤 DB에는 항상 **원(KRW) 정수**로만 저장됩니다.

**설계 원칙**: 기본 통화는 **원(한국 원화)**. 필요할 때만 달러 선택. 금액 입력 필드 + **원/달러 칩(둘 다 항상 노출)** 으로 현재 선택이 한눈에 보이고, 한 블록으로 그룹핑해 가독성을 높임.

## 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│  AddExpenseModal / AddVariableExpenseModal                       │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  AmountInputSection (공통) — 한 블록 그룹핑                    │ │
│  │  ├── InputField (금액) — 기본 원화                           │ │
│  │  ├── 원 / 달러 칩 (SVG 아이콘, 둘 다 노출·선택 강조)          │ │
│  │  └── ExchangeRateHint (달러 선택 시만: 1 USD ≈ X원, 한 줄)   │ │
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
| **공통 UI** | `AmountInputSection`으로 고정비/유동비 모달 동일 UX 및 디자인 효율 확보 |
| **아이콘** | SVG(phosphor-react-native): 원 전용 `CurrencyKrw`, 달러 전용 `CurrencyDollar`. 트리 쉐이킹으로 사용 아이콘만 번들 포함 |

## 주요 파일

| 경로 | 역할 |
|------|------|
| `src/config/constants.ts` | `EXCHANGE_RATE.API_URL`, `EXCHANGE_RATE.USD_KRW_FALLBACK` |
| `src/utils/amount.ts` | `formatAmount`, `parseAmount`, `usdToKrw(usd, rate)` |
| `src/hooks/useExchangeRate.ts` | 환율 조회 훅 (React Query + AbortSignal) |
| `src/hooks/useAmountWithCurrency.ts` | 금액·통화 상태 및 `getAmountInKrw(rate)` |
| `src/components/ui/ExchangeRateHint.tsx` | "1 USD ≈ X원" / 로딩 / 기본 환율 안내 |
| `src/components/ui/AmountInputSection.tsx` | 금액 입력(기본 원화) + 원/달러 칩(둘 다 노출, SVG 아이콘) + 환율 안내, 한 블록 그룹핑 |

## UX/UI 정리

- **기본**: 금액 입력 필드가 먼저 노출되며 기본 통화는 원(KRW). 원/달러 칩이 **둘 다 항상** 나란히 표시되어 현재 선택이 한눈에 보임.
- **통화 전환**: 원 칩(CurrencyKrw 아이콘 + "원") / 달러 칩(CurrencyDollar 아이콘 + "달러"). 선택된 칩은 primary 배경+흰 글자, 비선택은 회색 배경. 최소 터치 영역 44pt, 전환 시 햅틱. `accessibilityState={{ selected }}` 로 스크린 리더 안내.
- **블록 그룹핑**: 금액 라벨·입력 필드·통화 칩·환율을 하나의 배경( gray50 )·패딩·라운드 블록으로 묶어 스캔 용이.
- **환율 안내**: 달러 선택 시에만 한 줄로 표시 — "환율 불러오는 중…" 또는 "1 USD ≈ 1,350원 (기본 환율)". 색상은 theme 상수( textTertiary, gray500 ) 통일.
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
