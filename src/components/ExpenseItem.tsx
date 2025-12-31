import React, { useCallback, useRef } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { FixedMonthCost } from '../types';
import { formatCurrency } from '../utils/format';
import { getNextPaymentDate } from '../utils/date';
import { Card } from './ui/Card';
import { Typography } from './ui/Typography';
import { SPACING } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsiveMargin, getResponsiveValue, getResponsiveFontSize } from '../utils/responsive';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // 반응형 스타일
  const responsiveMargin = getResponsiveMargin(device, SPACING.base);
  const buttonSize = getResponsiveValue(device, 40, device.isTablet ? 48 : 40);
  const buttonGap = getResponsiveValue(device, SPACING.sm, device.isTablet ? SPACING.base : SPACING.sm);
  
  // 금액 폰트 크기 미세 조정 (태블릿에서 약간 작게)
  const amountFontSize = getResponsiveFontSize(device, TYPOGRAPHY.fontSize['3xl']);
  // 태블릿에서는 금액을 조금 더 작게 (기본 배율의 0.9배)
  const adjustedAmountSize = device.isTablet 
    ? amountFontSize * 0.95  // 태블릿에서 5% 감소
    : amountFontSize;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scaleAnim]);

  const handleEditPress = useCallback(() => {
    if (onEdit) {
      onEdit(item);
    }
  }, [onEdit, item]);

  const handleDeletePress = useCallback(() => {
    onDelete(item.id);
  }, [onDelete, item.id]);

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
        className="border border-gray-100"
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
          
          <View className="flex-row items-center">
            {onEdit && (
              <TouchableOpacity
                onPress={handleEditPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
                className="rounded-xl bg-amber-300 items-center justify-center shadow-md"
                style={{
                  width: buttonSize,
                  height: buttonSize,
                  marginRight: buttonGap,
                }}
                accessibilityLabel={`${item.name} 수정`}
                accessibilityRole="button"
                accessibilityHint="이 항목을 수정합니다"
              >
                <Typography variant="body" color="textPrimary">✏️</Typography>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDeletePress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isDeleting}
              activeOpacity={0.8}
              className={`rounded-xl items-center justify-center shadow-md ${
                isDeleting ? 'bg-gray-300 opacity-60' : 'bg-red-500'
              }`}
              style={{
                width: buttonSize,
                height: buttonSize,
              }}
              accessibilityLabel={`${item.name} 삭제`}
              accessibilityRole="button"
              accessibilityState={{ disabled: isDeleting }}
              accessibilityHint="이 항목을 삭제합니다"
            >
              <Typography variant="body" color="textInverse" weight="semibold">
                ✕
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
});
