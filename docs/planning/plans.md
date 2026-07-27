# 설계·계획 (리팩토링 + 디자인)

리팩토링 설계(금액/통화 분리, Query Key Factory, testID)와 디자인 향상 설계(컬러·타이포·카드·입력 UX·로드맵)를 한 문서로 정리합니다.

> **상태 (2026-07):** Part 1(Phase 1–3) 및 Part 2 로드맵의 주요 항목 구현 완료. 미적용(선택): Bottom Sheet, Shared Element 전환, Donut 차트. 현황 상세: [improvements-roadmap.md](improvements-roadmap.md).

---

# Part 1. 리팩토링 설계 (2024-05)

## 목표

1. **관심사 분리**: UI 컴포넌트(`AmountInputSection` 등)에서 비즈니스 로직 제거.
2. **데이터 관리 표준화**: React Query Key 중앙화(캐시 관리 오류 방지).
3. **테스트 용이성**: E2E가 UI 변경에 깨지지 않도록 testID 체계 정립.

## Phase 1. 금액/통화 로직 분리 (SRP)

[amount-currency.md](../features/amount-currency.md) 설계 원칙을 코드 레벨에서 강제. UI는 "데이터 표시"만 담당.

- **AmountInputSection**: Props만 받음 — `amount`, `currency`, `onChangeAmount`, `onToggleCurrency`, `errorMessage?`, `isDisabled?`. 환율(rate)은 상위에서 처리.
- **useAmountWithCurrency**: `uiProps`(UI용) + `data`(저장용 `getAmountInKrw`) 반환 구조.

## Phase 2. React Query Key Factory

`src/config/queryKeys.ts`에 `expenseKeys`(fixed/variable), `databaseKeys`, `exchangeRateKeys` 등 Factory로 중앙 관리. 기존 문자열 배열 사용처를 Factory 호출로 교체.

## Phase 3. E2E testID 전략

`src/utils/test-utils.ts`의 `getTestProps(id)` — 웹 `data-testid`, 네이티브 `testID`. 주요 인터랙션 요소에 적용. E2E는 [e2e-testing.md](../testing/e2e-testing.md) 참고.

## 로드맵

- Week 1: Phase 1 (AmountInputSection·훅)
- Week 2: Phase 2 (queryKeys 교체)
- Week 3: Phase 3 (testID·E2E)

---

# Part 2. 디자인 향상 설계 (Design Improvement Plan)

## 디자인 철학: "Clean & Focused"

숫자(금액) 가독성 최우선, 불필요한 장식 배제, 데이터 위계 명확화.

## 1. 디자인 시스템

- **컬러**: Primary(blue-600), Expense(rose-500), Income(teal-500), Neutral(slate). Surface: 카드 배경.
- **타이포**: Display(총액)·Heading·Body·Caption. 금액은 `tabular-nums`.
- **레이아웃**: 8pt 그리드. Card 16px, Button 12px, Input 8px radius.

## 2. 컴포넌트 UI

- **카드**: 옅은 테두리(border-slate-100) + shadow-sm. (선택) 총액 카드에 Glassmorphism.
- **리스트**: 날짜별 그룹화·Sticky 헤더. (선택) Swipe Actions, 카테고리 아이콘.
- **폼·모달**: (선택) Bottom Sheet, 금액 필드 포커스, Segmented Control 통화 토글.

## 3. 인터랙션·모션

- 버튼: scale-95 눌림. 총액: 숫자 카운팅 애니메이션.
- (선택) Skeleton 로딩, Shared Element 전환.
- 햅틱: Success / Selection / Error.

## 4. 데이터 시각화

- (선택) Donut 차트, Bar 차트(지난달 vs 이번달), 차트·리스트 색상 일치.

## 5. 구현 로드맵

- Phase 1: tailwind·테마, Card/Button/Typography 통일
- Phase 2: 리스트·총액 카드 개선
- Phase 3: Bottom Sheet·입력 UX
- Phase 4: 차트·다크 모드·스켈레톤
