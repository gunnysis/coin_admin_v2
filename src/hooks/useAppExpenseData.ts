import { useCallback } from 'react';
import { useInitDatabase, useExpensesPaginated, useTotalAmount } from './useExpenses';
import { useVariableExpensesPaginated, useVariableExpensesTotal } from './useVariableExpenses';
import { useExpenseHandlers } from './useExpenseHandlers';
import { useVariableExpenseHandlers } from './useVariableExpenseHandlers';
import type { FixedMonthCost, VariableMonthExpense } from '../types';
import type { FixedExpenseLayoutData, VariableExpenseLayoutData } from '../types/layout';

/**
 * 고정비·유동비 데이터 + 리프레시/로드모어를 한 훅으로 제공.
 * App에서 레이아웃에 넘길 fixedExpenseData, variableExpenseData 생성용.
 */
export function useAppExpenseData(
  selectedVariableMonth: string,
  setFixedRefreshing: (v: boolean) => void,
  setVariableRefreshing: (v: boolean) => void,
  isFixedRefreshing: boolean,
  isVariableRefreshing: boolean
): {
  isInitLoading: boolean;
  fixedExpenseData: FixedExpenseLayoutData;
  variableExpenseData: VariableExpenseLayoutData;
} {
  const { isLoading: isInitLoading } = useInitDatabase();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useExpensesPaginated();
  const { data: totalAmount = 0 } = useTotalAmount();
  const expenses = data?.pages.flatMap((page: { data: FixedMonthCost[] }) => page.data) ?? [];
  const { handleRefresh: handleFixedRefresh, isDeleting: fixedIsDeleting } = useExpenseHandlers();

  const {
    data: variableData,
    fetchNextPage: fetchVariableNextPage,
    hasNextPage: hasVariableNextPage,
    isFetchingNextPage: isFetchingVariableNextPage,
    isLoading: isVariableLoading,
  } = useVariableExpensesPaginated(selectedVariableMonth);
  const { data: variableTotalAmount = 0 } = useVariableExpensesTotal(selectedVariableMonth);
  const variableExpenses = variableData?.pages.flatMap((page: { data: VariableMonthExpense[] }) => page.data) ?? [];
  const { handleRefresh: handleVariableRefresh, isDeleting: variableIsDeleting } =
    useVariableExpenseHandlers(selectedVariableMonth);

  const onFixedRefresh = useCallback(async () => {
    setFixedRefreshing(true);
    try {
      await handleFixedRefresh();
    } finally {
      setFixedRefreshing(false);
    }
  }, [handleFixedRefresh, setFixedRefreshing]);

  const onVariableRefresh = useCallback(async () => {
    setVariableRefreshing(true);
    try {
      await handleVariableRefresh();
    } finally {
      setVariableRefreshing(false);
    }
  }, [handleVariableRefresh, setVariableRefreshing]);

  const fixedExpenseData: FixedExpenseLayoutData = {
    expenses,
    totalAmount,
    isLoading,
    isInitLoading,
    refreshing: isFixedRefreshing,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage: isFetchingNextPage,
    isDeleting: fixedIsDeleting,
    onRefresh: onFixedRefresh,
    onLoadMore: fetchNextPage,
  };

  const variableExpenseData: VariableExpenseLayoutData = {
    expenses: variableExpenses,
    totalAmount: variableTotalAmount,
    isLoading: isVariableLoading,
    isInitLoading,
    refreshing: isVariableRefreshing,
    hasNextPage: hasVariableNextPage ?? false,
    isFetchingNextPage: isFetchingVariableNextPage,
    isDeleting: variableIsDeleting,
    onRefresh: onVariableRefresh,
    onLoadMore: fetchVariableNextPage,
  };

  return { isInitLoading, fixedExpenseData, variableExpenseData };
}
