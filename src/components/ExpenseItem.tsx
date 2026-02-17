import React, { useMemo } from 'react';
import { View, Animated } from 'react-native';
import { FixedMonthCost } from '../types';
import { formatCurrency } from '../utils/format';
import { getNextPaymentDate } from '../utils/date';
import { Card } from './ui/Card';
import { Typography } from './ui/Typography';
import { ActionButtons } from './ui/ActionButtons';
import { SPACING } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsiveMargin, getResponsiveFontSize } from '../utils/responsive';
import { useExpenseItemActions } from '../hooks/useExpenseItemActions';
import { TYPOGRAPHY } from '../constants/theme';

interface ExpenseItemProps {
  item: FixedMonthCost;
  onDelete: (id: number) => void;
  onEdit?: (item: FixedMonthCost) => void;
  isDeleting?: boolean;
}

export const ExpenseItem = React.memo<ExpenseItemProps>(({
  item,
  onDelete,
  onEdit,
  isDeleting = false,
}) => {
  const device = useDeviceDimensions();
  
  // 반응형 스타일
  const responsiveMargin = getResponsiveMargin(device, SPACING.base);
  
  // 금액 폰트 크기 미세 조정
  const amountFontSize = getResponsiveFontSize(device, TYPOGRAPHY.fontSize['3xl']);
  const adjustedAmountSize = useMemo(() => 
    device.isTablet ? amountFontSize * 0.95 : amountFontSize,
    [device.isTablet, amountFontSize]
  );

  // 공통 액션 훅 사용
  const {
    scaleAnim,
    handlePressIn,
    handlePressOut,
    handleEditPress,
    handleDeletePress,
  } = useExpenseItemActions(item, onEdit, onDelete);

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginHorizontal: 0, // 부모 컨테이너에서 패딩 처리
        marginBottom: device.isTablet ? responsiveMargin : SPACING.md,
      }}
    >
      <Card
        variant="elevated"
        padding={device.isTablet ? "lg" : "base"}
        className="border border-slate-100"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1" style={{ marginRight: SPACING.md }}>
            <Typography variant="h3" color="textPrimary" weight="semibold" className="mb-1">
              {item.name}
            </Typography>
            <Typography
              variant="h2"
              color="primary"
              weight="bold"
              tabularNums
              className="mb-1"
              style={{ fontSize: adjustedAmountSize }}
            >
              {formatCurrency(item.amount)}
            </Typography>
            <View className="flex-row items-center mt-1">
              <Typography variant="caption" color="textTertiary" className="mr-1">
                📅
              </Typography>
              <Typography variant="caption" color="textSecondary">
                결제일: {getNextPaymentDate(item.start_date)}
              </Typography>
            </View>
          </View>
          
          <ActionButtons
            onEdit={onEdit ? handleEditPress : undefined}
            onDelete={handleDeletePress}
            isDeleting={isDeleting}
            itemName={item.name}
            scaleAnim={scaleAnim}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          />
        </View>
      </Card>
    </Animated.View>
  );
});
