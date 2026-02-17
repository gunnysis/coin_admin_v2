import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { expenseKeys } from '../config/queryKeys';
import { AddVariableExpenseFormData, VariableMonthExpense } from '../types';
import {
  useDeleteVariableExpense,
  useAddVariableExpense,
  useUpdateVariableExpense,
  useVariableExpensesPaginated,
} from './useVariableExpenses';

/**
 * 유동비 관련 핸들러 훅
 * App.tsx의 중복 코드를 줄이기 위한 공통 훅
 */
export const useVariableExpenseHandlers = (month?: string) => {
  const queryClient = useQueryClient();
  const deleteVariableExpense = useDeleteVariableExpense(month);
  const addVariableExpense = useAddVariableExpense(month);
  const updateVariableExpense = useUpdateVariableExpense(month);
  const { refetch } = useVariableExpensesPaginated(month);

  const handleDelete = useCallback(
    (id: number) => {
      deleteVariableExpense.mutate(id, {
        onError: (error) => {
          if (__DEV__) {
            console.error('유동비 삭제 실패:', error);
          }
        },
      });
    },
    [deleteVariableExpense]
  );

  const handleAdd = useCallback(
    async (data: AddVariableExpenseFormData) => {
      try {
        await addVariableExpense.mutateAsync(data);
      } catch (error) {
        if (__DEV__) {
          console.error('유동비 추가 실패:', error);
        }
        throw error;
      }
    },
    [addVariableExpense]
  );

  const handleUpdate = useCallback(
    async (data: AddVariableExpenseFormData & { id: number }) => {
      try {
        await updateVariableExpense.mutateAsync(data);
      } catch (error) {
        if (__DEV__) {
          console.error('유동비 수정 실패:', error);
        }
        throw error;
      }
    },
    [updateVariableExpense]
  );

  const handleRefresh = useCallback(async () => {
    try {
      // React Query 캐시 무효화 및 재조회
      await queryClient.invalidateQueries({ queryKey: expenseKeys.variable.all() });
      await refetch();
    } catch (error) {
      if (__DEV__) {
        console.error('유동비 새로고침 중 오류:', error);
      }
      // 에러를 상위로 전파하여 UI에서 처리할 수 있도록 함
      throw error;
    }
  }, [queryClient, refetch]);

  return {
    handleDelete,
    handleAdd,
    handleUpdate,
    handleRefresh,
    isPending: addVariableExpense.isPending || updateVariableExpense.isPending,
    isDeleting: deleteVariableExpense.isPending,
  };
};

