import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../constants';
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
export const useVariableExpenseHandlers = () => {
  const queryClient = useQueryClient();
  const deleteVariableExpense = useDeleteVariableExpense();
  const addVariableExpense = useAddVariableExpense();
  const updateVariableExpense = useUpdateVariableExpense();
  const { refetch } = useVariableExpensesPaginated();

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
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VARIABLE_EXPENSES });
      await refetch();
    } catch (error) {
      if (__DEV__) {
        console.error('유동비 새로고침 중 오류:', error);
      }
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

