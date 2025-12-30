import React, { useMemo } from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { FixedMonthCost } from '../types';
import { ExpenseItem } from './ExpenseItem';
import { Typography } from './ui/Typography';
import { EmptyState } from './ui/EmptyState';
import { Button } from './ui/Button';
import { COLORS, SPACING } from '../constants/theme';

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
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
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
}) => {
  // 하단 바와 추가 버튼을 고려한 하단 패딩 계산
  const bottomPadding = useMemo(() => {
    // 추가 버튼 높이 + 여백 + 하단 SafeArea 여백
    const buttonHeight = 56; // 버튼 크기 (ICON_SIZES.xl + SPACING.base)
    const buttonMargin = Platform.OS === 'ios' ? SPACING.xl : SPACING.lg;
    const additionalPadding = SPACING.base; // 추가 여유 공간
    
    return bottomInset + buttonHeight + buttonMargin + additionalPadding;
  }, [bottomInset]);
  const renderItem = ({ item }: { item: FixedMonthCost }) => (
    <ExpenseItem
      item={item}
      onDelete={onDelete}
      onEdit={onEdit}
      isDeleting={isDeleting}
    />
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }

    if (hasNextPage && onLoadMore) {
      return (
        <View style={styles.footer}>
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
        <View style={styles.footer}>
          <Typography variant="body2" color="textTertiary">
            모든 데이터를 불러왔습니다
          </Typography>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
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
  };

  return (
    <View style={styles.container}>
      <Typography variant="h3" color="textPrimary" style={styles.title}>
        월 고정비 항목
      </Typography>

      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomPadding }]}
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    marginBottom: SPACING.base,
    marginHorizontal: SPACING.base,
  },
  listContent: {
    // paddingBottom은 동적으로 계산되어 전달됨
  },
  footer: {
    paddingVertical: SPACING.base,
    alignItems: 'center',
  },
});
