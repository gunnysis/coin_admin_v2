import React, { useMemo } from 'react';
import { View, Animated } from 'react-native';
import { VariableMonthExpense } from '../types';
import { formatCurrency } from '../utils/format';
import { formatDateToShort } from '../utils/date';
import { Card } from './ui/Card';
import { Typography } from './ui/Typography';
import { ActionButtons } from './ui/ActionButtons';
import { SPACING } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsiveMargin, getResponsiveFontSize } from '../utils/responsive';
import { useExpenseItemActions } from '../hooks/useExpenseItemActions';
import { TYPOGRAPHY } from '../constants/theme';

interface VariableExpenseItemProps {
  item: VariableMonthExpense;
  onDelete: (id: number) => void;
  onEdit?: (item: VariableMonthExpense) => void;
  isDeleting?: boolean;
}

export const VariableExpenseItem = React.memo<VariableExpenseItemProps>(({
  item,
  onDelete,
  onEdit,
  isDeleting = false,
}) => {
  const device = useDeviceDimensions();
  
  const responsiveMargin = getResponsiveMargin(device, SPACING.base);
  
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
        marginHorizontal: 0,
        marginBottom: device.isTablet ? responsiveMargin : SPACING.md,
      }}
    >
      <Card 
        variant="elevated" 
        padding={device.isTablet ? "lg" : "base"} 
        className="border border-gray-100"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1" style={{ marginRight: SPACING.md }}>
            <View className="flex-row items-center mb-1">
              <Typography variant="h3" color="textPrimary" weight="semibold" className="mr-2">
                {item.name}
              </Typography>
              {item.category && (
                <View className="px-2 py-0.5 bg-blue-100 rounded-md">
                  <Typography variant="caption" color="primary" weight="medium">
                    {item.category}
                  </Typography>
                </View>
              )}
            </View>
            <Typography 
              variant="h2" 
              color="primary" 
              weight="bold" 
              className="mb-1"
              style={{ fontSize: adjustedAmountSize }}
            >
              {formatCurrency(item.amount)}
            </Typography>
            <View className="flex-row items-center mt-1 flex-wrap">
              <View className="flex-row items-center mr-3">
                <Typography variant="caption" color="textTertiary" className="mr-1">
                  📅
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {formatDateToShort(item.spent_date)}
                </Typography>
              </View>
              {item.memo && (
                <View className="flex-row items-center">
                  <Typography variant="caption" color="textTertiary" className="mr-1">
                    📝
                  </Typography>
                  <Typography variant="caption" color="textSecondary" numberOfLines={1}>
                    {item.memo}
                  </Typography>
                </View>
              )}
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

