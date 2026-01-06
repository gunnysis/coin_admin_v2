import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TotalAmountCard } from '../TotalAmountCard';
import { ExpenseList } from '../ExpenseList';
import { VariableExpenseList } from '../VariableExpenseList';
import { VariableTotalAmountCard } from '../VariableTotalAmountCard';
import { AddButton } from '../AddButton';
import { AddExpenseModal } from '../AddExpenseModal';
import { AddVariableExpenseModal } from '../AddVariableExpenseModal';
import { TabNavigation } from '../TabNavigation';
import { FixedMonthCost, VariableMonthExpense, AddExpenseFormData, AddVariableExpenseFormData } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { useExpenseHandlers } from '../../hooks/useExpenseHandlers';
import { useVariableExpenseHandlers } from '../../hooks/useVariableExpenseHandlers';
import { DeviceDimensions } from '../../hooks/useDeviceDimensions';

interface TabletLandscapeLayoutProps {
  device: DeviceDimensions;
  containerStyle: { paddingHorizontal: number };
  bottomInset: number;
  tabletLayoutStyles: {
    grid: { paddingHorizontal: number };
    leftColumn: { maxWidth?: number; marginRight: number };
    rightColumn: { minWidth?: number };
  };
  // 고정비 데이터
  fixedExpenses: FixedMonthCost[];
  fixedTotalAmount: number;
  fixedIsLoading: boolean;
  fixedIsInitLoading: boolean;
  fixedRefreshing: boolean;
  fixedHasNextPage: boolean;
  fixedIsFetchingNextPage: boolean;
  fixedIsDeleting: boolean;
  onFixedRefresh: () => void;
  onFixedLoadMore: () => void;
  // 유동비 데이터
  variableExpenses: VariableMonthExpense[];
  variableTotalAmount: number;
  variableIsLoading: boolean;
  variableRefreshing: boolean;
  variableHasNextPage: boolean;
  variableIsFetchingNextPage: boolean;
  variableIsDeleting: boolean;
  onVariableRefresh: () => void;
  onVariableLoadMore: () => void;
  // 헤더 렌더링
  renderHeader: () => React.ReactNode;
}

export const TabletLandscapeLayout = React.memo<TabletLandscapeLayoutProps>(({
  device,
  containerStyle,
  bottomInset,
  tabletLayoutStyles,
  fixedExpenses,
  fixedTotalAmount,
  fixedIsLoading,
  fixedIsInitLoading,
  fixedRefreshing,
  fixedHasNextPage,
  fixedIsFetchingNextPage,
  fixedIsDeleting,
  onFixedRefresh,
  onFixedLoadMore,
  variableExpenses,
  variableIsLoading,
  variableRefreshing,
  variableHasNextPage,
  variableIsFetchingNextPage,
  variableIsDeleting,
  onVariableRefresh,
  onVariableLoadMore,
  renderHeader,
}) => {
  const {
    activeTab,
    setActiveTab,
    isExpanded,
    toggleExpand,
    isVariableExpanded,
    toggleVariableExpanded,
    isFixedModalVisible,
    editingFixedItem,
    isVariableModalVisible,
    editingVariableItem,
    openFixedModal,
    closeFixedModal,
    openVariableModal,
    closeVariableModal,
  } = useAppContext();
  const {
    handleDelete: handleFixedDelete,
    handleAdd: handleFixedAdd,
    handleUpdate: handleFixedUpdate,
    isPending: fixedIsPending,
  } = useExpenseHandlers();
  const {
    handleDelete: handleVariableDelete,
    handleAdd: handleVariableAdd,
    handleUpdate: handleVariableUpdate,
    isPending: variableIsPending,
  } = useVariableExpenseHandlers();

  const handleFixedEdit = React.useCallback(
    (item: FixedMonthCost) => {
      openFixedModal(item);
    },
    [openFixedModal]
  );

  const handleVariableEdit = React.useCallback(
    (item: VariableMonthExpense) => {
      openVariableModal(item);
    },
    [openVariableModal]
  );

  const handleFixedSubmit = React.useCallback(
    async (data: AddExpenseFormData) => {
      try {
        if (editingFixedItem) {
          await handleFixedUpdate({ ...data, id: editingFixedItem.id });
        } else {
          await handleFixedAdd(data);
        }
        closeFixedModal();
      } catch (error) {
        throw error;
      }
    },
    [editingFixedItem, handleFixedAdd, handleFixedUpdate, closeFixedModal]
  );

  const handleVariableSubmit = React.useCallback(
    async (data: AddVariableExpenseFormData) => {
      try {
        if (editingVariableItem) {
          await handleVariableUpdate({ ...data, id: editingVariableItem.id });
        } else {
          await handleVariableAdd(data);
        }
        closeVariableModal();
      } catch (error) {
        throw error;
      }
    },
    [editingVariableItem, handleVariableAdd, handleVariableUpdate, closeVariableModal]
  );
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      <View className="flex-1" style={containerStyle}>
        {renderHeader()}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'fixed' ? (
          <View className="flex-1 flex-row" style={tabletLayoutStyles.grid}>
            <View className="flex-1" style={tabletLayoutStyles.leftColumn}>
              <TotalAmountCard
                totalAmount={fixedTotalAmount}
                isExpanded={isExpanded}
                onToggleExpand={onToggleExpand}
                expenses={fixedExpenses}
              />
            </View>
            <View className="flex-1" style={tabletLayoutStyles.rightColumn}>
              <ExpenseList
                expenses={fixedExpenses}
                isLoading={fixedIsLoading}
                isInitLoading={fixedIsInitLoading}
                refreshing={fixedRefreshing}
                onRefresh={onFixedRefresh}
                onDelete={handleFixedDelete}
                onEdit={handleFixedEdit}
                hasNextPage={fixedHasNextPage}
                isFetchingNextPage={fixedIsFetchingNextPage}
                onLoadMore={onFixedLoadMore}
                isDeleting={fixedIsDeleting}
                bottomInset={bottomInset}
                isTabletLandscape={true}
              />
            </View>
            <AddButton
              onPress={() => openFixedModal()}
              disabled={fixedIsPending}
              bottomInset={bottomInset}
            />
          </View>
        ) : (
          <View className="flex-1 flex-row" style={tabletLayoutStyles.grid}>
            <View className="flex-1" style={tabletLayoutStyles.leftColumn}>
              <VariableTotalAmountCard
                totalAmount={variableTotalAmount}
                isExpanded={isVariableExpanded}
                onToggleExpand={toggleVariableExpanded}
                expenses={variableExpenses}
              />
            </View>
            <View className="flex-1" style={tabletLayoutStyles.rightColumn}>
              <VariableExpenseList
                expenses={variableExpenses}
                isLoading={variableIsLoading}
                isInitLoading={fixedIsInitLoading}
                refreshing={variableRefreshing}
                onRefresh={onVariableRefresh}
                onDelete={handleVariableDelete}
                onEdit={handleVariableEdit}
                hasNextPage={variableHasNextPage}
                isFetchingNextPage={variableIsFetchingNextPage}
                onLoadMore={onVariableLoadMore}
                isDeleting={variableIsDeleting}
                bottomInset={bottomInset}
                isTabletLandscape={true}
              />
            </View>
            <AddButton
              onPress={() => openVariableModal()}
              disabled={variableIsPending}
              bottomInset={bottomInset}
            />
          </View>
        )}

        {/* 모달 */}
        <AddExpenseModal
          visible={isFixedModalVisible}
          onClose={closeFixedModal}
          onAdd={handleFixedSubmit}
          onUpdate={handleFixedSubmit}
          editingItem={editingFixedItem}
          isPending={fixedIsPending}
        />
        <AddVariableExpenseModal
          visible={isVariableModalVisible}
          onClose={closeVariableModal}
          onAdd={handleVariableSubmit}
          onUpdate={handleVariableSubmit}
          editingItem={editingVariableItem}
          isPending={variableIsPending}
        />
      </View>
    </SafeAreaView>
  );
});

