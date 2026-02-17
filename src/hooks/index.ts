/**
 * 커스텀 훅 통합 export
 */

// Device & Layout
export { useDeviceDimensions } from './useDeviceDimensions';

// Expenses
export { useExpensesPaginated, useTotalAmount, useInitDatabase } from './useExpenses';
export { useExpenseHandlers } from './useExpenseHandlers';
export { useVariableExpensesPaginated, useVariableExpensesTotal } from './useVariableExpenses';
export { useVariableExpenseHandlers } from './useVariableExpenseHandlers';
export { useExpenseItemActions } from './useExpenseItemActions';

// Month Navigation & Comparison
export { useMonthNavigation } from './useMonthNavigation';
export { useMonthComparison, type MonthComparisonResult } from './useMonthComparison';

// Error Handling
export { useErrorHandler } from './useErrorHandler';

// Utilities
export { useDebounce } from './useDebounce';
export { useThrottle } from './useThrottle';
export { usePrevious } from './usePrevious';
export { useIsFirstRender } from './useIsFirstRender';
export { useExchangeRate } from './useExchangeRate';
export { useAppExpenseData } from './useAppExpenseData';
export {
  useAmountWithCurrency,
  type AmountCurrency,
  type UseAmountWithCurrencyOptions,
} from './useAmountWithCurrency';

