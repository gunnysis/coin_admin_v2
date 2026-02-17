import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getVariableMonthExpenses,
  getVariableMonthExpensesCount,
  getVariableMonthExpensesTotal,
  deleteVariableMonthExpense,
  addVariableMonthExpense,
  updateVariableMonthExpense,
  getVariableExpensesMonthlyStats,
} from '../database/db';
import {
  VariableMonthExpense,
  VariableExpenseInfiniteQueryPage,
  VariableExpenseInfiniteQueryData,
  AddVariableExpenseFormData,
} from '../types';
import { PAGE_SIZE } from '../constants';
import { expenseKeys } from '../config/queryKeys';
import { getTodayDateString } from '../utils/date';

// 현재 월 문자열 반환 (YYYY-MM)
const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// 유동비 페이지네이션 조회
export const useVariableExpensesPaginated = (month?: string) => {
  const targetMonth = month || getCurrentMonth();
  
  return useInfiniteQuery<
    VariableExpenseInfiniteQueryPage,
    Error,
    VariableExpenseInfiniteQueryData,
    (string | number)[],
    number
  >({
    queryKey: expenseKeys.variable.lists(targetMonth),
    queryFn: async ({ pageParam = 0 }) => {
      const data = await getVariableMonthExpenses(PAGE_SIZE, pageParam, targetMonth);
      return {
        data,
        nextOffset: pageParam + data.length,
        hasMore: data.length === PAGE_SIZE,
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) {
        return undefined;
      }
      return lastPage.nextOffset;
    },
    initialPageParam: 0,
  });
};

// 유동비 개수 조회
export const useVariableExpensesCount = (month?: string) => {
  const targetMonth = month || getCurrentMonth();
  
  return useQuery({
    queryKey: expenseKeys.variable.count(targetMonth),
    queryFn: () => getVariableMonthExpensesCount(targetMonth),
  });
};

// 유동비 총액 조회
export const useVariableExpensesTotal = (month?: string) => {
  const targetMonth = month || getCurrentMonth();
  
  return useQuery<number>({
    queryKey: expenseKeys.variable.total(targetMonth),
    queryFn: () => getVariableMonthExpensesTotal(targetMonth),
  });
};

// 월별 유동비 통계 조회
export const useVariableExpensesMonthlyStats = (year: string, month: string) => {
  return useQuery({
    queryKey: expenseKeys.variable.monthly(year, month),
    queryFn: () => getVariableExpensesMonthlyStats(year, month),
  });
};

// 유동비 삭제 (Optimistic Update)
export const useDeleteVariableExpense = (month?: string) => {
  const queryClient = useQueryClient();
  const targetMonth = month || getCurrentMonth();

  return useMutation<void, Error, number, { previousPages: VariableExpenseInfiniteQueryData | undefined }>({
    mutationFn: deleteVariableMonthExpense,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: expenseKeys.variable.all() });

      const previousPages = queryClient.getQueryData<VariableExpenseInfiniteQueryData>(
        expenseKeys.variable.lists(targetMonth)
      );

      // 낙관적 업데이트
      queryClient.setQueryData<VariableExpenseInfiniteQueryData>(
        expenseKeys.variable.lists(targetMonth),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.filter((item) => item.id !== id),
            })),
          };
        }
      );

      // 총액도 낙관적 업데이트
      queryClient.setQueryData<number>(
        expenseKeys.variable.total(targetMonth),
        (old = 0) => {
          const expense = previousPages?.pages
            .flatMap((p) => p.data)
            .find((item) => item.id === id);
          return expense ? old - expense.amount : old;
        }
      );

      return { previousPages };
    },
    onError: (err, id, context) => {
      if (context?.previousPages) {
        queryClient.setQueryData(
          expenseKeys.variable.lists(targetMonth),
          context.previousPages
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.variable.all() });
    },
  });
};

// 유동비 추가
export const useAddVariableExpense = (month?: string) => {
  const queryClient = useQueryClient();
  const targetMonth = month || getCurrentMonth();

  return useMutation<number, Error, AddVariableExpenseFormData>({
    mutationFn: ({ name, amount, spent_date, category, memo }) =>
      addVariableMonthExpense(name, amount, spent_date, category, memo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.variable.all() });
    },
    onError: (error) => {
      if (__DEV__) {
        console.error('유동비 추가 실패:', error);
      }
    },
  });
};

// 유동비 수정 (Optimistic Update)
export const useUpdateVariableExpense = (month?: string) => {
  const queryClient = useQueryClient();
  const targetMonth = month || getCurrentMonth();

  return useMutation<
    void,
    Error,
    AddVariableExpenseFormData & { id: number },
    { previousPages: VariableExpenseInfiniteQueryData | undefined; previousTotal: number | undefined }
  >({
    mutationFn: ({ id, name, amount, spent_date, category, memo }) =>
      updateVariableMonthExpense(id, name, amount, spent_date, category, memo),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: expenseKeys.variable.all() });

      const previousPages = queryClient.getQueryData<VariableExpenseInfiniteQueryData>(
        expenseKeys.variable.lists(targetMonth)
      );
      const previousTotal = queryClient.getQueryData<number>(
        expenseKeys.variable.total(targetMonth)
      );

      // 낙관적 업데이트
      queryClient.setQueryData<VariableExpenseInfiniteQueryData>(
        expenseKeys.variable.lists(targetMonth),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((item) =>
                item.id === newData.id
                  ? {
                      ...item,
                      name: newData.name,
                      amount: newData.amount,
                      spent_date: newData.spent_date,
                      category: newData.category,
                      memo: newData.memo,
                    }
                  : item
              ),
            })),
          };
        }
      );

      // 총액도 낙관적 업데이트
      queryClient.setQueryData<number>(
        expenseKeys.variable.total(targetMonth),
        (old = 0) => {
          const oldExpense = previousPages?.pages
            .flatMap((p) => p.data)
            .find((item) => item.id === newData.id);
          if (oldExpense) {
            return old - oldExpense.amount + newData.amount;
          }
          return old;
        }
      );

      return { previousPages, previousTotal };
    },
    onError: (err, newData, context) => {
      if (context?.previousPages) {
        queryClient.setQueryData(
          expenseKeys.variable.lists(targetMonth),
          context.previousPages
        );
      }
      if (context?.previousTotal !== undefined) {
        queryClient.setQueryData(
          expenseKeys.variable.total(targetMonth),
          context.previousTotal
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.variable.all() });
    },
  });
};

