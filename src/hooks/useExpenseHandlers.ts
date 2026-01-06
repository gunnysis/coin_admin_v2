import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
import { AddExpenseFormData, FixedMonthCost } from '../types';
import {
  useDeleteExpense,
  useAddExpense,
  useUpdateExpense,
  useExpensesPaginated,
} from './useExpenses';

/**
 * 고정비 관련 핸들러 훅
 * App.tsx의 중복 코드를 줄이기 위한 공통 훅
 */
export const useExpenseHandlers = () => {
  const queryClient = useQueryClient();
  const deleteExpense = useDeleteExpense();
  const addExpense = useAddExpense();
  const updateExpense = useUpdateExpense();
  const { refetch } = useExpensesPaginated();

  const handleDelete = useCallback(
    (id: number) => {
      deleteExpense.mutate(id, {
        onError: (error) => {
          if (__DEV__) {
            console.error('삭제 실패:', error);
          }
        },
      });
    },
    [deleteExpense]
  );

  const handleAdd = useCallback(
    async (data: AddExpenseFormData) => {
      try {
        await addExpense.mutateAsync(data);
      } catch (error) {
        if (__DEV__) {
          console.error('추가 실패:', error);
        }
        throw error;
      }
    },
    [addExpense]
  );

  const handleUpdate = useCallback(
    async (data: AddExpenseFormData & { id: number }) => {
      try {
        await updateExpense.mutateAsync(data);
      } catch (error) {
        if (__DEV__) {
          console.error('수정 실패:', error);
        }
        throw error;
      }
    },
    [updateExpense]
  );

  const handleRefresh = useCallback(async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES });
      await refetch();
    } catch (error) {
      if (__DEV__) {
        console.error('새로고침 중 오류:', error);
      }
      throw error;
    }
  }, [queryClient, refetch]);

  return {
    handleDelete,
    handleAdd,
    handleUpdate,
    handleRefresh,
    isPending: addExpense.isPending || updateExpense.isPending,
    isDeleting: deleteExpense.isPending,
  };
};

