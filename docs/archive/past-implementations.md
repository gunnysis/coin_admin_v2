# 과거 구현·리팩토링 요약 (참고용)

유동비 월별 관리 기능의 Phase 1 구현 내용과 이후 리팩토링(메모이제이션, 타입 등)을 한 문서로 모았습니다.  
**현재 설계**: [variable-expense-month.md](../features/variable-expense-month.md), [plans.md](../planning/plans.md)

---

## Part 1. 유동비 월별 관리 기능 구현 (Phase 1 완료)

### 구현 완료 항목

1. **AppContext에 월 선택 상태**
   - `selectedVariableMonth`, `setSelectedVariableMonth`, 기본값 현재 월

2. **월 선택 유틸**
   - `parseMonth`, `formatMonth`, `getPreviousMonth`, `getNextMonth`, `formatMonthToDisplay`, `isValidMonthFormat`, `compareMonths`

3. **커스텀 훅**
   - `useMonthNavigation`: 이전/다음/현재 달, 햅틱
   - `useMonthComparison`: 현재 vs 이전 월, 증감액·증감률, 로딩

4. **MonthSelector**
   - 좌우 화살표, 중앙 월 표시(탭 가능), 현재 월 배지, 접근성, 컴팩트 모드

5. **데이터 조회 통합**
   - `useVariableExpensesPaginated` / `useVariableExpensesTotal` / `useVariableExpenseHandlers`에 월 파라미터, App·VariableExpenseFeature에서 선택 월 사용

6. **VariableTotalAmountCard**
   - MonthSelector 통합, "유동비 총액" 라벨(월에 따라 동적)

### 사용 예시

```typescript
const { selectedVariableMonth } = useAppContext();
const { goToPreviousMonth, goToNextMonth, goToCurrentMonth, isCurrentMonth } = useMonthNavigation();
const { currentTotal, previousTotal, comparison } = useMonthComparison(selectedMonth);
```

### 다음 단계 (선택)

- Phase 2: 스와이프 제스처, 하단 시트 모달, 월 전환 배너, 스켈레톤 로딩
- Phase 3: 월별 비교 카드, 비교 차트, 월별 통계 리포트

---

## Part 2. 유동비 월별 관리 리팩토링 요약

### 주요 개선

| 대상 | 개선 내용 |
|------|-----------|
| **AppContext** | 불필요한 `useEffect` 제거, Context value `useMemo` 메모이제이션 |
| **MonthSelector** | 미사용 import 제거, 상수 추출(MIN_TOUCH_SIZE, HIT_SLOP 등), 스타일·계산값 `useMemo` |
| **VariableTotalAmountCard** | 주석 "이번 달" → "선택된 월", Props 주석 정리 |
| **useMonthNavigation** | `canGoNext` 주석 추가 |
| **useMonthComparison** | `MonthComparisonResult` 타입 정의, `readonly`·`as const` 적용, 타입 export |
| **useVariableExpenseHandlers** | 에러 처리 주석 정리 |
| **hooks/index.ts** | `MonthComparisonResult` export |

### 성능·타입·품질

- **메모이제이션**: AppContext value, MonthSelector 스타일·계산값
- **타입**: `MonthComparisonResult` 명시, 불변성 보장
- **코드 품질**: 상수 추출, 매직 넘버 제거, 주석·네이밍 통일

### 테스트·향후

- 단위: 월 계산 유틸, 비교 로직, 훅
- 성능: 불필요한 리렌더링·재계산 방지 확인
- 향후: React.memo 검토, 가상화, 코드 스플리팅
