import { useMemo } from 'react';
import { useVariableExpensesTotal } from './useVariableExpenses';
import { getPreviousMonth } from '../utils/date';

/**
 * 월별 비교 결과 타입
 */
export interface MonthComparisonResult {
  readonly diff: number;
  readonly percentage: number;
  readonly isIncrease: boolean;
  readonly isDecrease: boolean;
  readonly isEqual: boolean;
}

/**
 * 월별 비교 커스텀 훅
 * 
 * 현재 선택된 월과 이전 달의 데이터를 비교하여
 * 증감액, 증감률 등의 정보를 제공합니다.
 */
export const useMonthComparison = (currentMonth: string) => {
  const previousMonth = useMemo(() => getPreviousMonth(currentMonth), [currentMonth]);

  // 현재 월 총액
  const { data: currentTotal = 0, isLoading: isLoadingCurrent } = useVariableExpensesTotal(currentMonth);
  
  // 이전 월 총액
  const { data: previousTotal = 0, isLoading: isLoadingPrevious } = useVariableExpensesTotal(previousMonth);

  // 비교 데이터 계산
  const comparison = useMemo<MonthComparisonResult | null>(() => {
    if (isLoadingCurrent || isLoadingPrevious) {
      return null;
    }

    const diff = currentTotal - previousTotal;
    const percentage = previousTotal > 0
      ? parseFloat(((diff / previousTotal) * 100).toFixed(1))
      : currentTotal > 0 ? 100 : 0;

    return {
      diff,
      percentage,
      isIncrease: diff > 0,
      isDecrease: diff < 0,
      isEqual: diff === 0,
    };
  }, [currentTotal, previousTotal, isLoadingCurrent, isLoadingPrevious]);

  return {
    currentTotal,
    previousTotal,
    previousMonth,
    comparison,
    isLoading: isLoadingCurrent || isLoadingPrevious,
  } as const;
};
