// Re-export from config
export { PAGINATION, DATE_FORMAT, ANIMATION, TIMING, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants';

// Legacy exports for backward compatibility
export const PAGE_SIZE = 10;
export const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const DATE_FORMAT_PLACEHOLDER = 'YYYY-MM-DD';

export const QUERY_KEYS = {
  DATABASE: ['database'] as const,
  EXPENSES: ['expenses'] as const,
  EXPENSES_PAGINATED: ['expenses', 'paginated'] as const,
  EXPENSES_COUNT: ['expenses', 'count'] as const,
  EXPENSES_TOTAL: ['expenses', 'total'] as const,
  VARIABLE_EXPENSES: ['variableExpenses'] as const,
  VARIABLE_EXPENSES_PAGINATED: ['variableExpenses', 'paginated'] as const,
  VARIABLE_EXPENSES_COUNT: ['variableExpenses', 'count'] as const,
  VARIABLE_EXPENSES_TOTAL: ['variableExpenses', 'total'] as const,
  VARIABLE_EXPENSES_MONTHLY: ['variableExpenses', 'monthly'] as const,
} as const;

// 유동비 카테고리 목록
export const EXPENSE_CATEGORIES = [
  '식비',
  '교통비',
  '쇼핑',
  '의료',
  '교육',
  '오락',
  '기타',
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
