import React, { useMemo, useCallback } from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { FixedMonthCost } from '../types';
import { ExpenseItem } from './ExpenseItem';
import { Typography } from './ui/Typography';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { COLORS, SPACING } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsivePadding, getResponsiveMargin } from '../utils/responsive';

interface ExpenseListProps {
  expenses: FixedMonthCost[];
  isLoading?: boolean;
  isInitLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onDelete: (id: number) => void;
  onEdit?: (item: FixedMonthCost) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  isDeleting?: boolean;
  bottomInset?: number;
  isTabletLandscape?: boolean;
}

export const ExpenseList = React.memo<ExpenseListProps>(({
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
  
  // 하단 바와 추가 버튼을 고려한 하단 패딩 계산
  const bottomPadding = useMemo(() => {
    // 태블릿 가로 모드에서는 추가 버튼이 오른쪽 하단에 있으므로 패딩 조정
    if (isTabletLandscape) {
      return bottomInset + SPACING.base;
    }
    // 추가 버튼 높이 + 여백 + 하단 SafeArea 여백
    const buttonHeight = 56; // 버튼 크기 (ICON_SIZES.xl + SPACING.base)
    const buttonMargin = Platform.OS === 'ios' ? SPACING.xl : SPACING.lg;
    const additionalPadding = SPACING.base; // 추가 여유 공간
    
    return bottomInset + buttonHeight + buttonMargin + additionalPadding;
  }, [bottomInset, isTabletLandscape]);
  
  // 반응형 스타일
  const responsivePadding = getResponsivePadding(device, SPACING.base);
  
  // 태블릿 가로 모드에서는 paddingHorizontal을 0으로 설정 (부모 컨테이너에서 이미 처리)
  // 태블릿 세로 모드에서는 적절한 패딩 적용
  const listPaddingHorizontal = 0;
  
  const renderItem = React.useCallback(({ item }: { item: FixedMonthCost }) => (
    <ExpenseItem
      item={item}
      onDelete={onDelete}
      onEdit={onEdit}
      isDeleting={isDeleting}
    />
  ), [onDelete, onEdit, isDeleting]);

  const keyExtractor = React.useCallback((item: FixedMonthCost) => item.id.toString(), []);

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={{ paddingVertical: SPACING.base, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }

    if (hasNextPage && onLoadMore) {
      return (
        <View style={{ paddingVertical: SPACING.base, alignItems: 'center' }}>
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
        <View style={{ paddingVertical: SPACING.base, alignItems: 'center' }}>
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
        icon="📋"
        title="등록된 고정비가 없습니다"
        description="하단의 + 버튼을 눌러 월 고정비를 추가해보세요"
      />
    );
  }, [isLoading, isInitLoading]);

  return (
    <View className="flex-1">
      {!isTabletLandscape && (
        <Typography
          variant="h3"
          color="textPrimary"
          style={{
            marginBottom: SPACING.base,
            marginHorizontal: device.isTablet ? 0 : responsivePadding,
          }}
        >
          월 고정비 항목
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
        accessibilityLabel="월 고정비 항목 목록"
        accessibilityHint={`총 ${expenses.length}개의 고정비 항목이 있습니다. 아래로 당겨서 새로고침할 수 있습니다.`}
        accessibilityRole="list"
      />
    </View>
  );
});
