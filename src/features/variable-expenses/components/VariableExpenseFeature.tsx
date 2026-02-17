import React, { useCallback } from 'react';
import { View } from 'react-native';
import { VariableExpenseList } from '@/components/VariableExpenseList';
import { AddButton } from '@/components/AddButton';
import { AddVariableExpenseModal } from '@/components/AddVariableExpenseModal';
import { VariableTotalAmountCard } from '@/components/VariableTotalAmountCard';
import { VariableMonthExpense, AddVariableExpenseFormData } from '@/types';
import { useAppContext } from '@/contexts/AppContext';
import { useVariableExpenseHandlers } from '@/hooks/useVariableExpenseHandlers';

interface VariableExpenseFeatureProps {
  expenses: VariableMonthExpense[];
  totalAmount: number;
  isLoading: boolean;
  isInitLoading: boolean;
  refreshing: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isDeleting: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  bottomInset: number;
  containerStyle: { paddingHorizontal: number };
}

/**
 * 유동비 Feature 컴포넌트
 * 유동비 관련 모든 로직과 UI를 캡슐화
 */
export const VariableExpenseFeature = React.memo<VariableExpenseFeatureProps>(({
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
  bottomInset,
  containerStyle,
}) => {
  const {
    isVariableModalVisible,
    editingVariableItem,
    openVariableModal,
    closeVariableModal,
    isVariableExpanded,
    toggleVariableExpanded,
    selectedVariableMonth,
  } = useAppContext();

  const {
    handleDelete,
    handleAdd,
    handleUpdate,
    isPending,
  } = useVariableExpenseHandlers(selectedVariableMonth);

  const handleEdit = React.useCallback((item: VariableMonthExpense) => {
    openVariableModal(item);
  }, [openVariableModal]);

  const handleAddVariableExpense = React.useCallback(async (data: AddVariableExpenseFormData) => {
    try {
      if (editingVariableItem) {
        await handleUpdate({ ...data, id: editingVariableItem.id });
      } else {
        await handleAdd(data);
      }
      closeVariableModal();
    } catch (error) {
      throw error;
    }
  }, [editingVariableItem, handleAdd, handleUpdate, closeVariableModal]);

  return (
    <View className="flex-1" style={containerStyle}>
      <VariableTotalAmountCard
        totalAmount={totalAmount}
        isExpanded={isVariableExpanded}
        onToggleExpand={toggleVariableExpanded}
        expenses={expenses}
      />
      <VariableExpenseList
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
      <AddButton
        onPress={() => openVariableModal()}
        disabled={isPending}
        bottomInset={bottomInset}
      />
      <AddVariableExpenseModal
        visible={isVariableModalVisible}
        onClose={closeVariableModal}
        onAdd={handleAddVariableExpense}
        onUpdate={handleAddVariableExpense}
        editingItem={editingVariableItem}
        isPending={isPending}
      />
    </View>
  );
});

