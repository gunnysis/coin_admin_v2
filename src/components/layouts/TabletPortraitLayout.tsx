import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TabNavigation } from '../TabNavigation';
import { FixedExpenseFeature } from '../../features/fixed-expenses/components/FixedExpenseFeature';
import { VariableExpenseFeature } from '../../features/variable-expenses/components/VariableExpenseFeature';
import { FixedMonthCost, VariableMonthExpense } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { DeviceDimensions } from '../../hooks/useDeviceDimensions';

interface TabletPortraitLayoutProps {
  device: DeviceDimensions;
  containerStyle: { paddingHorizontal: number; maxWidth?: number; alignSelf?: 'center' };
  bottomInset: number;
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

/**
 * 태블릿 세로 모드 레이아웃 컴포넌트
 * 중앙 정렬된 최적 너비 레이아웃
 */
export const TabletPortraitLayout = React.memo<TabletPortraitLayoutProps>(({
  device,
  containerStyle,
  bottomInset,
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
  variableTotalAmount,
  variableIsLoading,
  variableRefreshing,
  variableHasNextPage,
  variableIsFetchingNextPage,
  variableIsDeleting,
  onVariableRefresh,
  onVariableLoadMore,
  renderHeader,
}) => {
  const { activeTab, setActiveTab } = useAppContext();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View className="flex-1" style={containerStyle}>
        {renderHeader()}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'fixed' ? (
          <FixedExpenseFeature
            expenses={fixedExpenses}
            totalAmount={fixedTotalAmount}
            isLoading={fixedIsLoading}
            isInitLoading={fixedIsInitLoading}
            refreshing={fixedRefreshing}
            hasNextPage={fixedHasNextPage}
            isFetchingNextPage={fixedIsFetchingNextPage}
            isDeleting={fixedIsDeleting}
            onRefresh={onFixedRefresh}
            onLoadMore={onFixedLoadMore}
            bottomInset={bottomInset}
            containerStyle={containerStyle}
          />
        ) : (
          <VariableExpenseFeature
            expenses={variableExpenses}
            totalAmount={variableTotalAmount}
            isLoading={variableIsLoading}
            isInitLoading={fixedIsInitLoading}
            refreshing={variableRefreshing}
            hasNextPage={variableHasNextPage}
            isFetchingNextPage={variableIsFetchingNextPage}
            isDeleting={variableIsDeleting}
            onRefresh={onVariableRefresh}
            onLoadMore={onVariableLoadMore}
            bottomInset={bottomInset}
            containerStyle={containerStyle}
          />
        )}
      </View>
    </SafeAreaView>
  );
});

