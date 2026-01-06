/**
 * 유동비 관련 타입 정의
 */

import { VariableMonthExpense } from './expenses';

export interface ExpenseGroup {
  label: string;
  items: VariableMonthExpense[];
  total: number;
  percentage: number;
  color: string;
}

export interface DateGroup {
  date: string;
  items: VariableMonthExpense[];
  total: number;
}

