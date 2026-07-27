import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getFixedMonthCosts,
  getFixedMonthCostsCount,
  deleteFixedMonthCost,
  addFixedMonthCost,
  updateFixedMonthCost,
  getDatabase,
} from '../database/db';
import { InfiniteQueryExpensePage, InfiniteQueryExpenseData, AddExpenseFormData } from '../types';
import { PAGE_SIZE } from '../constants';
import { databaseKeys, expenseKeys } from '../config/queryKeys';

// 데이터베이스 초기화
export const useInitDatabase = () => {
  return useQuery({
    queryKey: databaseKeys.init(),
    queryFn: async () => {
      await getDatabase();
      return true;
    },
    staleTime: Infinity, // 한 번만 실행
    gcTime: Infinity,
  });
};

// 페이지네이션 방식 (더 보기 버튼)
export const useExpensesPaginated = () => {
  return useInfiniteQuery<
    InfiniteQueryExpensePage,
    Error,
    InfiniteQueryExpenseData,
    ReturnType<typeof expenseKeys.fixed.lists>,
    number
  >({
    queryKey: expenseKeys.fixed.lists(),
    queryFn: async ({ pageParam = 0 }) => {
      const data = await getFixedMonthCosts(PAGE_SIZE, pageParam);
      return {
        data,
        nextOffset: pageParam + data.length,
        hasMore: data.length === PAGE_SIZE,
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) {
        return undefined; // 더 이상 데이터 없음
      }
      return lastPage.nextOffset;
    },
    initialPageParam: 0,
  });
};

// 전체 데이터 개수 조회
export const useExpensesCount = () => {
  return useQuery({
    queryKey: expenseKeys.fixed.count(),
    queryFn: getFixedMonthCostsCount,
  });
};

// 총액 계산
export const useTotalAmount = () => {
  return useQuery<number>({
    queryKey: expenseKeys.fixed.total(),
    queryFn: async () => {
      const count = await getFixedMonthCostsCount();
      const allData = await getFixedMonthCosts(count, 0);
      return allData.reduce((acc, item) => acc + item.amount, 0);
    },
  });
};

// 항목 삭제 (Optimistic Update)
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number, { previousPages: InfiniteQueryExpenseData | undefined }>({
    mutationFn: deleteFixedMonthCost,
    onMutate: async (id) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: expenseKeys.fixed.all() });

      // 이전 데이터 백업
      const previousPages = queryClient.getQueryData<InfiniteQueryExpenseData>(
        expenseKeys.fixed.lists()
      );

      // 낙관적 업데이트: 즉시 UI에서 제거
      queryClient.setQueryData<InfiniteQueryExpenseData>(
        expenseKeys.fixed.lists(),
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
      queryClient.setQueryData<number>(expenseKeys.fixed.total(), (old = 0) => {
        const expense = previousPages?.pages
          .flatMap((p) => p.data)
          .find((item) => item.id === id);
        return expense ? old - expense.amount : old;
      });

      return { previousPages };
    },
    onError: (err, id, context) => {
      // 에러 발생 시 롤백
      if (context?.previousPages) {
        queryClient.setQueryData(expenseKeys.fixed.lists(), context.previousPages);
      }
    },
    onSettled: () => {
      // 성공/실패 관계없이 데이터 재검증
      queryClient.invalidateQueries({ queryKey: expenseKeys.fixed.all() });
    },
  });
};

// 항목 추가
export const useAddExpense = () => {
  const queryClient = useQueryClient();

  return useMutation<number, Error, AddExpenseFormData>({
    mutationFn: ({ name, amount, start_date }) =>
      addFixedMonthCost(name, amount, start_date),
    onSuccess: () => {
      // 성공 시 관련 쿼리 무효화하여 재조회
      queryClient.invalidateQueries({ queryKey: expenseKeys.fixed.all() });
    },
    onError: (error) => {
      if (__DEV__) {
        console.error('고정비 추가 실패:', error);
      }
    },
  });
};

// 항목 수정 (Optimistic Update)
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    AddExpenseFormData & { id: number },
    { previousPages: InfiniteQueryExpenseData | undefined; previousTotal: number | undefined }
  >({
    mutationFn: ({ id, name, amount, start_date }) =>
      updateFixedMonthCost(id, name, amount, start_date),
    onMutate: async (newData) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: expenseKeys.fixed.all() });

      // 이전 데이터 백업
      const previousPages = queryClient.getQueryData<InfiniteQueryExpenseData>(
        expenseKeys.fixed.lists()
      );
      const previousTotal = queryClient.getQueryData<number>(expenseKeys.fixed.total());

      // 낙관적 업데이트: 즉시 UI에서 수정
      queryClient.setQueryData<InfiniteQueryExpenseData>(
        expenseKeys.fixed.lists(),
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
                      start_date: newData.start_date,
                    }
                  : item
              ),
            })),
          };
        }
      );

      // 총액도 낙관적 업데이트
      queryClient.setQueryData<number>(expenseKeys.fixed.total(), (old = 0) => {
        const oldExpense = previousPages?.pages
          .flatMap((p) => p.data)
          .find((item) => item.id === newData.id);
        if (oldExpense) {
          return old - oldExpense.amount + newData.amount;
        }
        return old;
      });

      return { previousPages, previousTotal };
    },
    onError: (err, newData, context) => {
      // 에러 발생 시 롤백
      if (context?.previousPages) {
        queryClient.setQueryData(expenseKeys.fixed.lists(), context.previousPages);
      }
      if (context?.previousTotal !== undefined) {
        queryClient.setQueryData(expenseKeys.fixed.total(), context.previousTotal);
      }
    },
    onSettled: () => {
      // 성공/실패 관계없이 데이터 재검증
      queryClient.invalidateQueries({ queryKey: expenseKeys.fixed.all() });
    },
  });
};
