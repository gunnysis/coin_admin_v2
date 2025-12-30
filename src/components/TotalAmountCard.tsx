import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, LayoutAnimation, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/format';
import { ExpenseChart } from './ExpenseChart';
import { FixedMonthCost } from '../types';
import { Card } from './ui/Card';
import { Typography } from './ui/Typography';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';

// Note: setLayoutAnimationEnabledExperimental은 New Architecture에서 no-op입니다.
// New Architecture에서는 LayoutAnimation이 기본적으로 활성화되어 있어서
// 별도의 설정이 필요 없습니다.

interface TotalAmountCardProps {
  totalAmount: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  expenses?: FixedMonthCost[];
}

export const TotalAmountCard: React.FC<TotalAmountCardProps> = ({
  totalAmount,
  isExpanded = false,
  onToggleExpand,
  expenses = [],
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 아이콘 회전 애니메이션
    Animated.spring(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      useNativeDriver: true,
      tension: 200,
      friction: 10,
    }).start();

    // 차트 높이 애니메이션
    Animated.timing(heightAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    // 레이아웃 애니메이션
    if (isExpanded) {
      LayoutAnimation.configureNext({
        duration: 300,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
        },
      });
    }
  }, [isExpanded, rotateAnim, heightAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const chartHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300],
  });

  const chartOpacity = heightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      <Card variant="elevated" padding="lg" style={styles.card}>
        <View style={styles.header}>
          <Typography variant="label" color="textSecondary" style={styles.label}>
            이번 달 고정비 총액
          </Typography>
          <Typography variant="h1" color="primary" weight="bold" style={styles.amount}>
            {formatCurrency(totalAmount)}
          </Typography>
          {expenses.length > 0 && (
            <Typography variant="caption" color="textTertiary" style={styles.itemCount}>
              총 {expenses.length}개 항목
            </Typography>
          )}
        </View>
        
        {onToggleExpand && (
          <TouchableOpacity
            onPress={onToggleExpand}
            style={styles.toggleButton}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={isExpanded ? '차트 접기' : '차트 펼치기'}
            accessibilityRole="button"
          >
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Typography variant="body" color="textTertiary">
                ▼
              </Typography>
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* 차트 영역 */}
        {isExpanded && (
          <Animated.View
            style={[
              styles.chartContainer,
              {
                height: chartHeight,
                opacity: chartOpacity,
              },
            ]}
          >
            <View style={styles.chartWrapper}>
              <ExpenseChart expenses={expenses} />
            </View>
          </Animated.View>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
  },
  card: {
    position: 'relative',
  },
  header: {
    marginBottom: SPACING.sm,
  },
  label: {
    marginBottom: SPACING.xs,
  },
  amount: {
    marginBottom: SPACING.xs,
  },
  itemCount: {
    marginTop: SPACING.xs,
  },
  toggleButton: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    padding: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartContainer: {
    overflow: 'hidden',
    marginTop: SPACING.base,
    marginHorizontal: -SPACING.lg, // 카드의 padding을 상쇄
  },
  chartWrapper: {
    flex: 1,
  },
});
