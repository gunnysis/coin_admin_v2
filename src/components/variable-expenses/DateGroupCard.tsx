import React from 'react';
import { View } from 'react-native';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
import { formatCurrency, formatDate } from '../../utils/format';
import { VariableMonthExpense } from '../../types';

interface DateGroupCardProps {
  date: string;
  items: VariableMonthExpense[];
  total: number;
}

/**
 * 날짜별 그룹 카드 컴포넌트
 * 특정 날짜의 지출 항목들을 표시
 */
export const DateGroupCard = React.memo<DateGroupCardProps>(({ date, items, total }) => {
  const displayItems = items.slice(0, 3);
  const remainingCount = items.length - 3;

  return (
    <Card variant="outlined" padding="sm" className="mb-2">
      <View className="flex-row items-center justify-between mb-2">
        <Typography variant="body2" color="textPrimary" weight="medium">
          {formatDate(date, 'full')}
        </Typography>
        <Typography variant="body2" color="primary" weight="semibold">
          {formatCurrency(total, false)}
        </Typography>
      </View>
      <View className="space-y-1">
        {displayItems.map((item) => (
          <View key={item.id} className="flex-row items-center justify-between">
            <Typography variant="caption" color="textSecondary" numberOfLines={1}>
              {item.name}
            </Typography>
            <Typography variant="caption" color="textTertiary">
              {formatCurrency(item.amount, false)}
            </Typography>
          </View>
        ))}
        {remainingCount > 0 && (
          <Typography variant="caption" color="textTertiary">
            외 {remainingCount}개 항목
          </Typography>
        )}
      </View>
    </Card>
  );
});

DateGroupCard.displayName = 'DateGroupCard';

