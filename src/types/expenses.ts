/**
 * 지출 관련 타입 정의
 */

import { PaginatedResponse } from './common';

/**
 * 고정비 항목
 */
export interface FixedMonthCost {
  id: number;
  created_at: string;
  amount: number;
  name: string;
  start_date: string;
}

/**
 * 고정비 추가/수정 폼 데이터
 */
export interface AddExpenseFormData {
  name: string;
  amount: number;
  start_date: string;
}

/**
 * 유동비 항목
 */
export interface VariableMonthExpense {
  id: number;
  created_at: string;
  amount: number;
  name: string;
  spent_date: string;
  category?: string;
  memo?: string;
}

/**
 * 유동비 추가/수정 폼 데이터
 */
export interface AddVariableExpenseFormData {
  name: string;
  amount: number;
  spent_date: string;
  category?: string;
  memo?: string;
}

/**
 * 무한 스크롤 페이지 구조
 */
export interface InfiniteQueryPage<T> {
  data: T[];
  nextOffset: number;
  hasMore: boolean;
}

/**
 * 무한 스크롤 데이터 구조
 */
export interface InfiniteQueryData<T> {
  pages: InfiniteQueryPage<T>[];
  pageParams: number[];
}

/**
 * 고정비 무한 스크롤 타입 별칭
 */
export type InfiniteQueryExpensePage = InfiniteQueryPage<FixedMonthCost>;
export type InfiniteQueryExpenseData = InfiniteQueryData<FixedMonthCost>;

/**
 * 유동비 무한 스크롤 타입 별칭
 */
export type InfiniteQueryVariablePage = InfiniteQueryPage<VariableMonthExpense>;
export type InfiniteQueryVariableData = InfiniteQueryData<VariableMonthExpense>;

