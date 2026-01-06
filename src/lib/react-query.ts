/**
 * React Query 유틸리티 및 타입
 */

import { UseQueryResult, UseMutationResult } from '@tanstack/react-query';

/**
 * Query 결과 타입 추출 헬퍼
 */
export type QueryResult<T> = UseQueryResult<T, Error>;

/**
 * Mutation 결과 타입 추출 헬퍼
 */
export type MutationResult<TData, TVariables> = UseMutationResult<TData, Error, TVariables>;

/**
 * Infinite Query 페이지 타입
 */
export interface InfiniteQueryPage<T> {
  data: T[];
  nextOffset: number;
  hasMore: boolean;
}

/**
 * Infinite Query 데이터 타입
 */
export interface InfiniteQueryData<T> {
  pages: InfiniteQueryPage<T>[];
  pageParams: number[];
}

