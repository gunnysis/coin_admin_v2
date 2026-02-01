# 유동비 월별 관리 설계 문서 v2.0
## 최신 기술 & UX/UI 최적화 버전

## 개요
유동비 기능의 월별 관리 시스템을 최신 기술 스택과 사용자 경험 최적화 패턴으로 재설계합니다.

## 핵심 설계 원칙

### 1. 사용자 경험 우선 (UX First)
- **직관적인 인터랙션**: 스와이프 제스처로 월 변경
- **즉각적인 피드백**: 햅틱 피드백, 애니메이션, 로딩 상태
- **비침투적 알림**: 토스트 메시지, 배너 형태
- **접근성**: 스크린 리더, 키보드 네비게이션 지원

### 2. 성능 최적화
- **React Query 캐싱**: 월별 데이터 자동 캐싱 및 동기화
- **가상화**: 대량 데이터 리스트 가상화 (FlatList)
- **메모이제이션**: 불필요한 리렌더링 방지
- **코드 스플리팅**: 월 선택 모달 지연 로딩

### 3. 현대적 UI 패턴
- **하단 시트 (Bottom Sheet)**: 월 선택 모달
- **스켈레톤 로딩**: 데이터 로딩 중 상태 표시
- **마이크로 인터랙션**: 버튼, 카드 상호작용 애니메이션
- **그라데이션 & 글래스모피즘**: 시각적 깊이감

## 아키텍처 설계

### 상태 관리 계층화
```
┌─────────────────────────────────────┐
│   UI Layer (Components)             │
│   - MonthSelector (스와이프 지원)    │
│   - MonthComparisonCard              │
│   - SkeletonLoader                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Hook Layer (Custom Hooks)          │
│   - useMonthNavigation               │
│   - useMonthComparison               │
│   - useMonthTransition                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   State Layer (Context + React Query)│
│   - AppContext (selectedMonth)       │
│   - React Query (월별 데이터 캐싱)  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   Data Layer (Database)             │
│   - SQLite (월별 인덱싱)             │
└─────────────────────────────────────┘
```

## 기능 상세 설계

### 1. 월 선택 시스템

#### 1.1 스와이프 네비게이션
```typescript
// 스와이프로 월 변경 (좌우 스와이프)
- 왼쪽 스와이프: 다음 달
- 오른쪽 스와이프: 이전 달
- 애니메이션: 슬라이드 전환 효과
- 햅틱 피드백: 스와이프 완료 시
```

#### 1.2 하단 시트 모달
```typescript
// 월 선택 하단 시트
- 드래그 가능한 모달
- 월 목록 (최근 12개월)
- 빠른 선택 버튼 (이번 달, 지난 달)
- 검색 기능 (연도/월 검색)
```

#### 1.3 월 표시 헤더
```typescript
// VariableTotalAmountCard 상단
- 현재 선택된 월 표시
- 좌우 화살표 버튼 (이전/다음 달)
- 월 선택 버튼 (하단 시트 열기)
- 현재 월 표시 배지 (선택적)
```

### 2. 월 전환 감지 및 알림

#### 2.1 자동 월 감지
```typescript
// 앱 실행 시 또는 포그라운드 복귀 시
- 현재 월과 저장된 월 비교
- 월 변경 감지 시 자동 업데이트
- 사용자 알림 (선택적)
```

#### 2.2 스마트 알림
```typescript
// 비침투적 배너 알림
- 위치: 화면 상단
- 내용: "새로운 달이 시작되었습니다"
- 액션: "지난 달 보기" 버튼
- 자동 닫힘: 5초 후 또는 사용자 닫기
- 애니메이션: 슬라이드 다운
```

### 3. 월별 비교 기능

#### 3.1 비교 카드 컴포넌트
```typescript
// VariableTotalAmountCard 확장 영역
- 이전 달 총액 표시
- 증감액 및 증감률
- 시각적 인디케이터 (↑↓ 아이콘)
- 카테고리별 비교 (선택적)
```

#### 3.2 비교 차트
```typescript
// 월별 비교 차트
- 막대 그래프 (현재 월 vs 이전 월)
- 카테고리별 비교
- 인터랙티브 툴팁
```

### 4. 성능 최적화 전략

#### 4.1 React Query 캐싱
```typescript
// 월별 데이터 캐싱 전략
- 각 월별로 독립적인 캐시 키
- staleTime: 5분 (자주 변경되지 않음)
- cacheTime: 30분 (오래된 데이터 유지)
- prefetch: 이전/다음 달 데이터 미리 로드
```

#### 4.2 가상화
```typescript
// 대량 데이터 처리
- FlatList 가상화 (이미 적용됨)
- 월별 통계 계산 최적화
- 메모이제이션된 통계 데이터
```

#### 4.3 코드 스플리팅
```typescript
// 동적 임포트
- MonthSelector 모달: React.lazy
- 비교 차트: 필요 시 로드
```

## 컴포넌트 설계

### 1. MonthSelector (월 선택기)
```typescript
interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onSwipeLeft?: () => void;  // 다음 달
  onSwipeRight?: () => void; // 이전 달
  enableSwipe?: boolean;
}

// 기능:
// - 스와이프 제스처 지원
// - 하단 시트 모달
// - 애니메이션 전환
// - 햅틱 피드백
```

### 2. MonthComparisonCard (월 비교 카드)
```typescript
interface MonthComparisonCardProps {
  currentMonth: string;
  previousMonth: string;
  currentTotal: number;
  previousTotal: number;
  isLoading?: boolean;
}

// 기능:
// - 증감액/증감률 계산
// - 시각적 인디케이터
// - 애니메이션 표시
```

### 3. MonthTransitionBanner (월 전환 배너)
```typescript
interface MonthTransitionBannerProps {
  visible: boolean;
  onViewPreviousMonth: () => void;
  onDismiss: () => void;
}

// 기능:
// - 자동 표시/숨김
// - 슬라이드 애니메이션
// - 액션 버튼
```

### 4. SkeletonMonthCard (스켈레톤 로더)
```typescript
// 데이터 로딩 중 표시
// - 총액 영역 스켈레톤
// - 리스트 아이템 스켈레톤
// - 펄스 애니메이션
```

## 커스텀 훅 설계

### 1. useMonthNavigation
```typescript
// 월 네비게이션 로직
const useMonthNavigation = () => {
  const { selectedMonth, setSelectedMonth } = useAppContext();
  
  const goToPreviousMonth = useCallback(() => {
    const prev = getPreviousMonth(selectedMonth);
    setSelectedMonth(prev);
    triggerHaptic('light');
  }, [selectedMonth, setSelectedMonth]);
  
  const goToNextMonth = useCallback(() => {
    const next = getNextMonth(selectedMonth);
    setSelectedMonth(next);
    triggerHaptic('light');
  }, [selectedMonth, setSelectedMonth]);
  
  const goToCurrentMonth = useCallback(() => {
    setSelectedMonth(getCurrentMonth());
    triggerHaptic('success');
  }, [setSelectedMonth]);
  
  return {
    selectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    canGoPrevious: compareMonths(selectedMonth, getCurrentMonth()) < 0,
    canGoNext: compareMonths(selectedMonth, getCurrentMonth()) > 0,
  };
};
```

### 2. useMonthComparison
```typescript
// 월별 비교 데이터
const useMonthComparison = (currentMonth: string) => {
  const previousMonth = getPreviousMonth(currentMonth);
  
  const { data: currentData } = useVariableExpensesTotal(currentMonth);
  const { data: previousData } = useVariableExpensesTotal(previousMonth);
  
  const comparison = useMemo(() => {
    if (!currentData || !previousData) return null;
    
    const diff = currentData - previousData;
    const percentage = previousData > 0 
      ? ((diff / previousData) * 100).toFixed(1)
      : '0.0';
    
    return {
      diff,
      percentage: parseFloat(percentage),
      isIncrease: diff > 0,
      isDecrease: diff < 0,
    };
  }, [currentData, previousData]);
  
  return {
    currentTotal: currentData || 0,
    previousTotal: previousData || 0,
    comparison,
    isLoading: !currentData || !previousData,
  };
};
```

### 3. useMonthTransition
```typescript
// 월 전환 감지 및 알림
const useMonthTransition = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [lastKnownMonth, setLastKnownMonth] = useState<string | null>(null);
  
  useEffect(() => {
    const currentMonth = getCurrentMonth();
    
    // 앱 첫 실행 또는 월 변경 감지
    if (lastKnownMonth && lastKnownMonth !== currentMonth) {
      setShowBanner(true);
    }
    
    setLastKnownMonth(currentMonth);
  }, [lastKnownMonth]);
  
  const handleDismiss = useCallback(() => {
    setShowBanner(false);
  }, []);
  
  return {
    showBanner,
    handleDismiss,
  };
};
```

## UI/UX 디자인 가이드

### 1. 월 선택기 디자인
```
┌─────────────────────────────────────┐
│  [←]  2024년 1월  [선택]  [→]      │
└─────────────────────────────────────┘

- 좌우 화살표: 이전/다음 달
- 중앙 텍스트: 현재 선택된 월 (탭 가능 → 하단 시트)
- 현재 월일 경우 배지 표시
```

### 2. 하단 시트 디자인
```
┌─────────────────────────────────────┐
│  ═══════════════════════════        │  ← 드래그 핸들
│  월 선택                             │
│  ────────────────────────────────   │
│  [이번 달]  [지난 달]               │  ← 빠른 선택
│  ────────────────────────────────   │
│  2024년 1월  ✓                      │
│  2023년 12월                        │
│  2023년 11월                        │
│  ...                                │
└─────────────────────────────────────┘
```

### 3. 비교 카드 디자인
```
┌─────────────────────────────────────┐
│  이번 달: 500,000원                 │
│  지난 달: 450,000원                 │
│  ────────────────────────────────   │
│  ↑ 50,000원 (+11.1%)               │
└─────────────────────────────────────┘
```

## 구현 우선순위

### Phase 1: 핵심 기능 (필수)
1. ✅ AppContext에 월 선택 상태 추가
2. ✅ 월 선택 유틸리티 함수
3. ✅ MonthSelector 컴포넌트 (기본 버전)
4. ✅ 데이터 조회 로직에 월 파라미터 적용
5. ✅ useMonthNavigation 훅

### Phase 2: UX 개선 (권장)
1. 스와이프 제스처 지원
2. 하단 시트 모달
3. 월 전환 배너
4. 스켈레톤 로딩

### Phase 3: 고급 기능 (선택)
1. 월별 비교 카드
2. 비교 차트
3. 월별 통계 리포트
4. 데이터 내보내기

## 기술 스택 추가 고려사항

### 선택적 의존성
```json
{
  "react-native-gesture-handler": "^2.x",  // 스와이프 제스처
  "react-native-reanimated": "^3.x",      // 고성능 애니메이션
  "@gorhom/bottom-sheet": "^4.x"          // 하단 시트 모달
}
```

### 성능 최적화
- React Query의 `prefetchQuery` 활용
- `useMemo`, `useCallback` 적극 활용
- 컴포넌트 메모이제이션 (`React.memo`)

## 접근성 고려사항

### 스크린 리더
- 월 선택 버튼: "월 선택, 현재 2024년 1월"
- 비교 정보: "이번 달 총액 500,000원, 지난 달 대비 11.1% 증가"

### 키보드 네비게이션
- Tab 키로 월 선택 버튼 포커스
- 화살표 키로 월 변경 (선택적)

### 시각적 피드백
- 포커스 인디케이터
- 충분한 색상 대비
- 애니메이션 감소 옵션 (설정)

## 테스트 전략

### 단위 테스트
- 월 계산 유틸리티 함수
- 비교 로직
- 훅 로직

### 통합 테스트
- 월 선택 → 데이터 조회 플로우
- 월 전환 감지
- React Query 캐싱 동작

### E2E 테스트
- 스와이프 제스처
- 하단 시트 모달
- 월별 데이터 표시
