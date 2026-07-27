import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Typography } from '../ui/Typography';
import { formatCurrency } from '../../utils/format';
import { useTheme } from '../../contexts/ThemeContext';
import { VariableMonthExpense } from '../../types';
import { createProgressAnimation, createInterpolate } from '../../utils/animations';

interface ExpenseItemProgressProps {
  item: VariableMonthExpense & { percentage: number };
  index: number;
}

/**
 * 지출 항목 Progress Bar 컴포넌트
 * 개별 항목의 비율을 시각화
 */
export const ExpenseItemProgress = React.memo<ExpenseItemProgressProps>(({ item, index }) => {
  const { colors } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = createProgressAnimation(progressAnim, item.percentage, {
      duration: 600,
      delay: index * 50,
    });
    animation.start();
  }, [item.percentage, index, progressAnim]);

  const progressWidth = createInterpolate(progressAnim, [0, 100], ['0%', '100%']);

  return (
    <View className="mb-2">
      <View className="flex-row items-center justify-between mb-1">
        <Typography variant="body2" color="textPrimary" numberOfLines={1} style={{ flex: 1 }}>
          {item.name}
        </Typography>
        <View className="flex-row items-center ml-2">
          <Typography variant="body2" color="textSecondary" className="mr-2">
            {formatCurrency(item.amount, false)}
          </Typography>
          <Typography variant="caption" color="textTertiary">
            {item.percentage.toFixed(1)}%
          </Typography>
        </View>
      </View>
      <View
        className="h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: colors.gray200 }}
      >
        <Animated.View
          style={{
            height: '100%',
            width: progressWidth,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </View>
  );
});

ExpenseItemProgress.displayName = 'ExpenseItemProgress';

