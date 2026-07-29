import React, { useEffect } from 'react';
import { View, Alert } from 'react-native';
import { SPACING } from '@/constants/theme';
import { formatError } from '@/utils/errorHandler';
import { TotalAmountCard } from '@/components/TotalAmountCard';
import { ExpenseList } from '@/components/ExpenseList';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { SkeletonList } from '@/components/ui/SkeletonList';
import { AddButton } from '@/components/AddButton';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { FixedMonthCost, AddExpenseFormData } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
import { useExpenseHandlers } from '@/hooks/useExpenseHandlers';

interface FixedExpenseFeatureProps {
  expenses: FixedMonthCost[];
  totalAmount: number;
  isLoading: boolean;
  isInitLoading: boolean;
  refreshing: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isDeleting: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  refreshError?: Error | null;
  bottomInset: number;
}

/**
 * 고정비 Feature 컴포넌트
 * 고정비 관련 모든 로직과 UI를 캡슐화
 */
export const FixedExpenseFeature = React.memo<FixedExpenseFeatureProps>(({
  expenses,
  totalAmount,
  isLoading,
  isInitLoading,
  refreshing,
  hasNextPage,
  isFetchingNextPage,
  isDeleting,
  onRefresh,
  onLoadMore,
  refreshError,
  bottomInset,
}) => {
  useEffect(() => {
    if (refreshError) {
      Alert.alert('새로고침 실패', formatError(refreshError).userMessage);
    }
  }, [refreshError]);

  const {
    isExpanded,
    toggleExpand,
    isFixedModalVisible,
    editingFixedItem,
    openFixedModal,
    closeFixedModal,
  } = useAppContext();

  const {
    handleDelete,
    handleAdd,
    handleUpdate,
    isPending,
  } = useExpenseHandlers();

  const handleEdit = React.useCallback((item: FixedMonthCost) => {
    openFixedModal(item);
  }, [openFixedModal]);

  const handleAddExpense = React.useCallback(async (data: AddExpenseFormData) => {
    try {
      if (editingFixedItem) {
        await handleUpdate({ ...data, id: editingFixedItem.id });
      } else {
        await handleAdd(data);
      }
      closeFixedModal();
    } catch (error) {
      // 에러는 모달에서 처리
      throw error;
    }
  }, [editingFixedItem, handleAdd, handleUpdate, closeFixedModal]);

  return (
    <View className="flex-1">
      {isInitLoading ? (
        <SkeletonCard height={120} />
      ) : (
        <TotalAmountCard
          totalAmount={totalAmount}
          isExpanded={isExpanded}
          onToggleExpand={toggleExpand}
          expenses={expenses}
        />
      )}
      <View style={{ flex: 1, marginTop: SPACING.lg }}>
        {isInitLoading ? (
          <SkeletonList />
        ) : (
          <ExpenseList
            expenses={expenses}
            isLoading={isLoading}
            isInitLoading={isInitLoading}
            refreshing={refreshing}
            onRefresh={onRefresh}
            onDelete={handleDelete}
            onEdit={handleEdit}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={onLoadMore}
            isDeleting={isDeleting}
            bottomInset={bottomInset}
          />
        )}
      </View>
      <AddButton
        onPress={() => openFixedModal()}
        disabled={isPending}
        bottomInset={bottomInset}
      />
      <AddExpenseModal
        visible={isFixedModalVisible}
        onClose={closeFixedModal}
        onAdd={handleAddExpense}
        onUpdate={handleAddExpense}
        editingItem={editingFixedItem}
        isPending={isPending}
      />
    </View>
  );
});

