import type { FixedMonthCost, VariableMonthExpense } from './expenses';

/** 고정비 목록/총액·로딩·리프레시 등 레이아웃에 전달하는 한 덩어리 */
export interface FixedExpenseLayoutData {
  expenses: FixedMonthCost[];
  totalAmount: number;
  isLoading: boolean;
  isInitLoading: boolean;
  refreshing: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isDeleting: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
}

/** 유동비 목록/총액·로딩·리프레시 등 레이아웃에 전달하는 한 덩어리 */
export interface VariableExpenseLayoutData {
  expenses: VariableMonthExpense[];
  totalAmount: number;
  isLoading: boolean;
  isInitLoading: boolean;
  refreshing: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isDeleting: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
}
