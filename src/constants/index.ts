// Re-export from config (single source of truth)
export {
  PAGINATION,
  DATE_FORMAT,
  ANIMATION,
  TIMING,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  EXCHANGE_RATE,
} from '../config/constants';

// Legacy aliases: config와 동기화 유지
import { PAGINATION, DATE_FORMAT } from '../config/constants';
export const PAGE_SIZE = PAGINATION.PAGE_SIZE;
export const DATE_FORMAT_REGEX = DATE_FORMAT.REGEX;
export const DATE_FORMAT_PLACEHOLDER = DATE_FORMAT.PLACEHOLDER;

export { QUERY_KEYS } from '../config/queryKeys';

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
