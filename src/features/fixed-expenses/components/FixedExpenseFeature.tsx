import React from 'react';
import { View } from 'react-native';
import { TotalAmountCard } from '../../../components/TotalAmountCard';
import { ExpenseList } from '../../../components/ExpenseList';
import { AddButton } from '../../../components/AddButton';
import { AddExpenseModal } from '../../../components/AddExpenseModal';
import { FixedMonthCost, AddExpenseFormData } from '../../../types';
import { useAppContext } from '../../../contexts/AppContext';
import { useExpenseHandlers } from '../../../hooks/useExpenseHandlers';

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
  bottomInset: number;
  containerStyle: { paddingHorizontal: number };
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
  bottomInset,
  containerStyle,
}) => {
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
    <View className="flex-1" style={containerStyle}>
      <TotalAmountCard
        totalAmount={totalAmount}
        isExpanded={isExpanded}
        onToggleExpand={toggleExpand}
        expenses={expenses}
      />
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

