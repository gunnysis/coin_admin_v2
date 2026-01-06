import React, { useMemo, useCallback } from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { VariableMonthExpense } from '../types';
import { VariableExpenseItem } from './VariableExpenseItem';
import { Typography } from './ui/Typography';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { COLORS, SPACING } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsivePadding } from '../utils/responsive';

interface VariableExpenseListProps {
  expenses: VariableMonthExpense[];
  isLoading?: boolean;
  isInitLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onDelete: (id: number) => void;
  onEdit?: (item: VariableMonthExpense) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  isDeleting?: boolean;
  bottomInset?: number;
  isTabletLandscape?: boolean;
}

export const VariableExpenseList = React.memo<VariableExpenseListProps>(({
  expenses,
  isLoading = false,
  isInitLoading = false,
  refreshing = false,
  onRefresh,
  onDelete,
  onEdit,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  isDeleting = false,
  bottomInset = 0,
  isTabletLandscape = false,
}) => {
  const device = useDeviceDimensions();
  
  const bottomPadding = useMemo(() => {
    if (isTabletLandscape) {
      return bottomInset + SPACING.base;
    }
    const buttonHeight = 56;
    const buttonMargin = Platform.OS === 'ios' ? SPACING.xl : SPACING.lg;
    const additionalPadding = SPACING.base;
    
    return bottomInset + buttonHeight + buttonMargin + additionalPadding;
  }, [bottomInset, isTabletLandscape]);
  
  const responsivePadding = getResponsivePadding(device, SPACING.base);
  const listPaddingHorizontal = 0;
  
  const renderItem = React.useCallback(({ item }: { item: VariableMonthExpense }) => (
    <VariableExpenseItem
      item={item}
      onDelete={onDelete}
      onEdit={onEdit}
      isDeleting={isDeleting}
    />
  ), [onDelete, onEdit, isDeleting]);

  const keyExtractor = React.useCallback((item: VariableMonthExpense) => item.id.toString(), []);

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }

    if (hasNextPage && onLoadMore) {
      return (
        <View className="py-4 items-center">
          <Button
            variant="primary"
            size="md"
            onPress={onLoadMore}
            disabled={isFetchingNextPage}
            loading={isFetchingNextPage}
            accessibilityLabel="더 보기"
          >
            더 보기
          </Button>
        </View>
      );
    }

    if (expenses.length > 0) {
      return (
        <View className="py-4 items-center">
          <Typography variant="body2" color="textTertiary">
            모든 데이터를 불러왔습니다
          </Typography>
        </View>
      );
    }

    return null;
  }, [isFetchingNextPage, hasNextPage, onLoadMore, expenses.length]);

  const renderEmpty = useCallback(() => {
    if (isLoading || isInitLoading) {
      return (
        <EmptyState
          icon="⏳"
          title="데이터를 불러오는 중..."
          description="잠시만 기다려주세요"
        />
      );
    }
    return (
      <EmptyState
        icon="💸"
        title="등록된 유동비가 없습니다"
        description="하단의 + 버튼을 눌러 유동비를 추가해보세요"
      />
    );
  }, [isLoading, isInitLoading]);

  return (
    <View className="flex-1">
      {!isTabletLandscape && (
        <Typography 
          variant="h3" 
          color="textPrimary" 
          className="mb-4"
          style={{ marginHorizontal: device.isTablet ? 0 : responsivePadding }}
        >
          월 유동비 항목
        </Typography>
      )}

      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ 
          paddingBottom: bottomPadding,
          paddingHorizontal: device.isTablet && !isTabletLandscape ? 0 : listPaddingHorizontal,
          ...(expenses.length === 0 && { flexGrow: 1 }),
        }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={true}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          ) : undefined
        }
        removeClippedSubviews={device.isTablet ? false : true}
        maxToRenderPerBatch={device.isTablet ? 15 : 10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={device.isTablet ? 15 : 10}
        windowSize={device.isTablet ? 15 : 10}
        accessibilityLabel="월 유동비 항목 목록"
        accessibilityHint={`총 ${expenses.length}개의 유동비 항목이 있습니다. 아래로 당겨서 새로고침할 수 있습니다.`}
        accessibilityRole="list"
      />
    </View>
  );
});

