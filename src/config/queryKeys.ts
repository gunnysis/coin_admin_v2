/**
 * React Query Key Factory
 * 쿼리 키를 중앙에서 관리하여 캐시/무효화 일관성 확보
 */

export const databaseKeys = {
  all: () => ['database'] as const,
  init: () => [...databaseKeys.all(), 'init'] as const,
};

export const expenseKeys = {
  all: () => ['expenses'] as const,

  fixed: {
    all: () => expenseKeys.all(),
    lists: () => [...expenseKeys.all(), 'paginated'] as const,
    list: () => expenseKeys.fixed.lists(),
    count: () => [...expenseKeys.all(), 'count'] as const,
    total: () => [...expenseKeys.all(), 'total'] as const,
  },

  variable: {
    all: () => ['variableExpenses'] as const,
    lists: (month: string) => [...expenseKeys.variable.all(), 'paginated', month] as const,
    count: (month: string) => [...expenseKeys.variable.all(), 'count', month] as const,
    total: (month: string) => [...expenseKeys.variable.all(), 'total', month] as const,
    monthly: (year: string, month: string) =>
      [...expenseKeys.variable.all(), 'monthly', year, month] as const,
  },
};

export const exchangeRateKeys = {
  all: () => ['exchangeRate', 'USD', 'KRW'] as const,
};
