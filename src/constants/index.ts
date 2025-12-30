export const PAGE_SIZE = 10;

export const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const DATE_FORMAT_PLACEHOLDER = 'YYYY-MM-DD';

export const QUERY_KEYS = {
  DATABASE: ['database'] as const,
  EXPENSES: ['expenses'] as const,
  EXPENSES_PAGINATED: ['expenses', 'paginated'] as const,
  EXPENSES_COUNT: ['expenses', 'count'] as const,
  EXPENSES_TOTAL: ['expenses', 'total'] as const,
} as const;
