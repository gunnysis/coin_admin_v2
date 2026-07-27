import React, { useEffect } from 'react';
import { View, Alert } from 'react-native';
import { formatError } from '../../utils/errorHandler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SPACING } from '../../constants/theme';
import { TotalAmountCard } from '../TotalAmountCard';
import { ExpenseList } from '../ExpenseList';
import { SkeletonCard } from '../ui/SkeletonCard';
import { SkeletonList } from '../ui/SkeletonList';
import { VariableExpenseList } from '../VariableExpenseList';
import { VariableTotalAmountCard } from '../VariableTotalAmountCard';
import { MonthTransitionBanner } from '../MonthTransitionBanner';
import { AddButton } from '../AddButton';
import { AddExpenseModal } from '../AddExpenseModal';
import { AddVariableExpenseModal } from '../AddVariableExpenseModal';
import { TabNavigation } from '../TabNavigation';
import type { FixedMonthCost, VariableMonthExpense, AddExpenseFormData, AddVariableExpenseFormData } from '../../types';
import type { FixedExpenseLayoutData, VariableExpenseLayoutData } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';
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
  fixedExpenseData: FixedExpenseLayoutData;
  variableExpenseData: VariableExpenseLayoutData;
  renderHeader: () => React.ReactNode;
}

export const TabletLandscapeLayout = React.memo<TabletLandscapeLayoutProps>(({
  device,
  containerStyle,
  bottomInset,
  tabletLayoutStyles,
  fixedExpenseData,
  variableExpenseData,
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
    selectedVariableMonth,
  } = useAppContext();
  const { isDark } = useTheme();
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
  } = useVariableExpenseHandlers(selectedVariableMonth);

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

  useEffect(() => {
    if (fixedExpenseData.refreshError) {
      Alert.alert('새로고침 실패', formatError(fixedExpenseData.refreshError).userMessage);
    }
  }, [fixedExpenseData.refreshError]);

  useEffect(() => {
    if (variableExpenseData.refreshError) {
      Alert.alert('새로고침 실패', formatError(variableExpenseData.refreshError).userMessage);
    }
  }, [variableExpenseData.refreshError]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View className="flex-1" style={containerStyle}>
        {renderHeader()}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'fixed' ? (
          <View
            className="flex-1 flex-row"
            style={[tabletLayoutStyles.grid, { marginTop: SPACING.md }]}
          >
            <View className="flex-1" style={tabletLayoutStyles.leftColumn}>
              {fixedExpenseData.isInitLoading ? (
                <SkeletonCard height={120} />
              ) : (
                <TotalAmountCard
                  totalAmount={fixedExpenseData.totalAmount}
                  isExpanded={isExpanded}
                  onToggleExpand={toggleExpand}
                  expenses={fixedExpenseData.expenses}
                />
              )}
            </View>
            <View className="flex-1" style={tabletLayoutStyles.rightColumn}>
              {fixedExpenseData.isInitLoading ? (
                <SkeletonList />
              ) : (
              <ExpenseList
                expenses={fixedExpenseData.expenses}
                isLoading={fixedExpenseData.isLoading}
                isInitLoading={fixedExpenseData.isInitLoading}
                refreshing={fixedExpenseData.refreshing}
                onRefresh={fixedExpenseData.onRefresh}
                onDelete={handleFixedDelete}
                onEdit={handleFixedEdit}
                hasNextPage={fixedExpenseData.hasNextPage}
                isFetchingNextPage={fixedExpenseData.isFetchingNextPage}
                onLoadMore={fixedExpenseData.onLoadMore}
                isDeleting={fixedExpenseData.isDeleting}
                bottomInset={bottomInset}
                isTabletLandscape={true}
              />
              )}
            </View>
            <AddButton
              onPress={() => openFixedModal()}
              disabled={fixedIsPending}
              bottomInset={bottomInset}
            />
          </View>
        ) : (
          <View
            className="flex-1 flex-row"
            style={[tabletLayoutStyles.grid, { marginTop: SPACING.md }]}
          >
            <View className="flex-1" style={tabletLayoutStyles.leftColumn}>
              <MonthTransitionBanner month={selectedVariableMonth} />
              {variableExpenseData.isInitLoading ? (
                <SkeletonCard height={120} />
              ) : (
              <VariableTotalAmountCard
                totalAmount={variableExpenseData.totalAmount}
                isExpanded={isVariableExpanded}
                onToggleExpand={toggleVariableExpanded}
                expenses={variableExpenseData.expenses}
              />
              )}
            </View>
            <View className="flex-1" style={tabletLayoutStyles.rightColumn}>
              {variableExpenseData.isInitLoading ? (
                <SkeletonList />
              ) : (
              <VariableExpenseList
                expenses={variableExpenseData.expenses}
                isLoading={variableExpenseData.isLoading}
                isInitLoading={variableExpenseData.isInitLoading}
                refreshing={variableExpenseData.refreshing}
                onRefresh={variableExpenseData.onRefresh}
                onDelete={handleVariableDelete}
                onEdit={handleVariableEdit}
                hasNextPage={variableExpenseData.hasNextPage}
                isFetchingNextPage={variableExpenseData.isFetchingNextPage}
                onLoadMore={variableExpenseData.onLoadMore}
                isDeleting={variableExpenseData.isDeleting}
                bottomInset={bottomInset}
                isTabletLandscape={true}
              />
              )}
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

