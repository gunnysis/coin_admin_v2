import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { TabNavigation } from '../TabNavigation';
import { FixedExpenseFeature } from '../../features/fixed-expenses/components/FixedExpenseFeature';
import { VariableExpenseFeature } from '../../features/variable-expenses/components/VariableExpenseFeature';
import type { FixedExpenseLayoutData, VariableExpenseLayoutData } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { DeviceDimensions } from '../../hooks/useDeviceDimensions';

interface PhoneLayoutProps {
  device: DeviceDimensions;
  containerStyle: { paddingHorizontal: number };
  bottomInset: number;
  fixedExpenseData: FixedExpenseLayoutData;
  variableExpenseData: VariableExpenseLayoutData;
  renderHeader: () => React.ReactNode;
}

/**
 * 폰 레이아웃 컴포넌트
 * 스마트폰에 최적화된 단일 컬럼 레이아웃
 */
export const PhoneLayout = React.memo<PhoneLayoutProps>(({
  device,
  containerStyle,
  bottomInset,
  fixedExpenseData,
  variableExpenseData,
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
            expenses={fixedExpenseData.expenses}
            totalAmount={fixedExpenseData.totalAmount}
            isLoading={fixedExpenseData.isLoading}
            isInitLoading={fixedExpenseData.isInitLoading}
            refreshing={fixedExpenseData.refreshing}
            hasNextPage={fixedExpenseData.hasNextPage}
            isFetchingNextPage={fixedExpenseData.isFetchingNextPage}
            isDeleting={fixedExpenseData.isDeleting}
            onRefresh={fixedExpenseData.onRefresh}
            onLoadMore={fixedExpenseData.onLoadMore}
            bottomInset={bottomInset}
            containerStyle={containerStyle}
          />
        ) : (
          <VariableExpenseFeature
            expenses={variableExpenseData.expenses}
            totalAmount={variableExpenseData.totalAmount}
            isLoading={variableExpenseData.isLoading}
            isInitLoading={variableExpenseData.isInitLoading}
            refreshing={variableExpenseData.refreshing}
            hasNextPage={variableExpenseData.hasNextPage}
            isFetchingNextPage={variableExpenseData.isFetchingNextPage}
            isDeleting={variableExpenseData.isDeleting}
            onRefresh={variableExpenseData.onRefresh}
            onLoadMore={variableExpenseData.onLoadMore}
            bottomInset={bottomInset}
            containerStyle={containerStyle}
          />
        )}
      </View>
    </SafeAreaView>
  );
});

