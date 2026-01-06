import React, { useCallback } from 'react';
import { View } from 'react-native';
import { VariableExpenseList } from '../../../components/VariableExpenseList';
import { AddButton } from '../../../components/AddButton';
import { AddVariableExpenseModal } from '../../../components/AddVariableExpenseModal';
import { VariableTotalAmountCard } from '../../../components/VariableTotalAmountCard';
import { VariableMonthExpense, AddVariableExpenseFormData } from '../../../types';
import { useAppContext } from '../../../contexts/AppContext';
import { useVariableExpenseHandlers } from '../../../hooks/useVariableExpenseHandlers';

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
  } = useAppContext();

  const {
    handleDelete,
    handleAdd,
    handleUpdate,
    isPending,
  } = useVariableExpenseHandlers();

  const handleEdit = React.useCallback((item: VariableMonthExpense) => {
    openVariableModal(item);
  }, [openVariableModal]);

  const handleAddVariableExpense = React.useCallback(async (data: AddVariableExpenseFormData) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VariableExpenseFeature.tsx:59',message:'handleAddVariableExpense called',data:{hasEditingVariableItem:!!editingVariableItem,editingItemId:editingVariableItem?.id,data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    try {
      if (editingVariableItem) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VariableExpenseFeature.tsx:62',message:'Calling handleUpdate',data:{id:editingVariableItem.id,data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        await handleUpdate({ ...data, id: editingVariableItem.id });
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VariableExpenseFeature.tsx:65',message:'Calling handleAdd',data,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
        // #endregion
        await handleAdd(data);
      }
      closeVariableModal();
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'VariableExpenseFeature.tsx:70',message:'Error in handleAddVariableExpense',data:{error:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      // 에러는 모달에서 처리
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

