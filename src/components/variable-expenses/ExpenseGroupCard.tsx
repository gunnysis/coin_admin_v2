import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Typography } from '../ui/Typography';
import { formatCurrency } from '../../utils/format';
import { useTheme } from '../../contexts/ThemeContext';
import { ExpenseGroup } from '../../types/variableExpenses';
import { createProgressAnimation, createInterpolate } from '../../utils/animations';

interface ExpenseGroupCardProps {
  group: ExpenseGroup;
  index: number;
}

/**
 * 지출 그룹 카드 컴포넌트
 * 금액 범위별 그룹을 시각화
 */
export const ExpenseGroupCard = React.memo<ExpenseGroupCardProps>(({ group, index }) => {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = createProgressAnimation(progressAnim, group.percentage, {
      duration: 800,
      delay: index * 100,
    });
    animation.start();
  }, [group.percentage, index, progressAnim]);

  const progressWidth = createInterpolate(progressAnim, [0, 100], ['0%', '100%']);

  return (
    <View className="mb-3">
      <View className="flex-row items-center justify-between mb-1">
        <Typography variant="body2" color="textPrimary" weight="medium">
          {group.label}
        </Typography>
        <View className="flex-row items-center">
          <Typography variant="body2" color="textSecondary" className="mr-2">
            {formatCurrency(group.total, false)}
          </Typography>
          <Typography variant="caption" color="textTertiary">
            {group.percentage.toFixed(1)}%
          </Typography>
        </View>
      </View>
      <View
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.gray200 }}
      >
        <Animated.View
          style={{
            height: '100%',
            width: progressWidth,
            backgroundColor: group.color,
          }}
        />
      </View>
      <Typography variant="caption" color="textTertiary" className="mt-1">
        {group.items.length}개 항목
      </Typography>
    </View>
  );
});

ExpenseGroupCard.displayName = 'ExpenseGroupCard';

