import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { SPACING } from '../../constants/theme';
import { TabNavigation } from '../TabNavigation';
import { FixedExpenseFeature } from '../../features/fixed-expenses/components/FixedExpenseFeature';
import { VariableExpenseFeature } from '../../features/variable-expenses/components/VariableExpenseFeature';
import type { FixedExpenseLayoutData, VariableExpenseLayoutData } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { useTheme } from '../../contexts/ThemeContext';
import { DeviceDimensions } from '../../hooks/useDeviceDimensions';

interface TabletPortraitLayoutProps {
  device: DeviceDimensions;
  containerStyle: { paddingHorizontal: number; maxWidth?: number; alignSelf?: 'center' };
  bottomInset: number;
  fixedExpenseData: FixedExpenseLayoutData;
  variableExpenseData: VariableExpenseLayoutData;
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
  fixedExpenseData,
  variableExpenseData,
  renderHeader,
}) => {
  const { activeTab, setActiveTab } = useAppContext();
  const { isDark } = useTheme();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View className="flex-1" style={containerStyle}>
        {renderHeader()}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <View style={{ flex: 1, marginTop: SPACING.md }}>
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
              refreshError={fixedExpenseData.refreshError}
              bottomInset={bottomInset}
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
              refreshError={variableExpenseData.refreshError}
              bottomInset={bottomInset}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
});

