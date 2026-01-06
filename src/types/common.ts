/**
 * 공통 타입 정의
 */

/**
 * API 응답 기본 구조
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  offset: number;
  limit: number;
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

/**
 * 정렬 방향
 */
export type SortDirection = 'asc' | 'desc';

/**
 * 정렬 옵션
 */
export interface SortOption<T extends string> {
  field: T;
  direction: SortDirection;
}

/**
 * 필터 옵션
 */
export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
  value: unknown;
}

/**
 * 쿼리 옵션
 */
export interface QueryOptions<T extends string = string> {
  pagination?: PaginationParams;
  sort?: SortOption<T>;
  filters?: FilterOption[];
}

