import React, { useEffect, useRef, useCallback } from 'react';
import { View, TouchableOpacity, Animated, LayoutAnimation } from 'react-native';
import { formatCurrency } from '../utils/format';
import { ExpenseVisualization } from './ExpenseVisualization';
import { FixedMonthCost } from '../types';
import { Card } from './ui/Card';
import { Typography } from './ui/Typography';
import { SPACING } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsiveMargin, getResponsiveFontSize } from '../utils/responsive';
import { TYPOGRAPHY } from '../constants/theme';

// Note: setLayoutAnimationEnabledExperimental은 New Architecture에서 no-op입니다.
// New Architecture에서는 LayoutAnimation이 기본적으로 활성화되어 있어서
// 별도의 설정이 필요 없습니다.

interface TotalAmountCardProps {
  totalAmount: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  expenses?: FixedMonthCost[];
}

export const TotalAmountCard = React.memo<TotalAmountCardProps>(({
  totalAmount,
  isExpanded = false,
  onToggleExpand,
  expenses = [],
}) => {
  const device = useDeviceDimensions();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;
  
  // 반응형 스타일
  const responsiveMargin = getResponsiveMargin(device, SPACING.base);
  
  // 총액 폰트 크기 미세 조정 (태블릿에서 적절한 크기 유지)
  const totalAmountFontSize = getResponsiveFontSize(device, TYPOGRAPHY.fontSize['4xl']);
  // 태블릿에서는 총액을 조금 더 작게 (기본 배율의 0.92배)
  const adjustedTotalSize = device.isTablet 
    ? totalAmountFontSize * 0.92  // 태블릿에서 8% 감소
    : totalAmountFontSize;

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

  // 태블릿에서는 차트 높이를 더 크게
  const maxChartHeight = device.isTablet ? (device.isLandscape ? 400 : 350) : 300;
  const chartHeight = heightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, maxChartHeight],
  });

  const chartOpacity = heightAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View
      style={{
        marginHorizontal: 0, // 부모 컨테이너에서 패딩 처리
        marginBottom: device.isTablet ? responsiveMargin : SPACING.md,
      }}
    >
      <Card 
        variant="elevated" 
        padding={device.isTablet ? "xl" : "lg"} 
        className="relative"
        accessibilityRole="summary"
      >
        <View className="mb-3" accessibilityRole="text">
          <Typography variant="label" color="textSecondary" className="mb-1">
            이번 달 고정비 총액
          </Typography>
          <Typography 
            variant="h1" 
            color="primary" 
            weight="bold" 
            className="mb-1"
            style={{ fontSize: adjustedTotalSize }}
            accessibilityLabel={`총액 ${formatCurrency(totalAmount)}원`}
          >
            {formatCurrency(totalAmount)}
          </Typography>
          {expenses.length > 0 && (
            <Typography 
              variant="caption" 
              color="textTertiary" 
              className="mt-1"
              accessibilityLabel={`총 ${expenses.length}개 항목`}
            >
              총 {expenses.length}개 항목
            </Typography>
          )}
        </View>
        
        {onToggleExpand && (
          <TouchableOpacity
            onPress={onToggleExpand}
            className="absolute items-center justify-center"
            style={{
              top: SPACING.lg,
              right: SPACING.lg,
              padding: SPACING.sm,
              zIndex: 10,
              minWidth: 44,
              minHeight: 44,
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel={isExpanded ? '차트 접기' : '차트 펼치기'}
            accessibilityRole="button"
            accessibilityHint={isExpanded ? '차트를 접어 숨깁니다' : '고정비 차트를 펼쳐서 확인합니다'}
            accessibilityState={{ expanded: isExpanded }}
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
            className="overflow-hidden mt-4"
            style={{
              height: chartHeight,
              opacity: chartOpacity,
              marginHorizontal: -SPACING.lg, // 카드의 padding을 상쇄
              minHeight: device.isTablet ? (device.isLandscape ? 250 : 300) : 200,
            }}
          >
            <View className="flex-1" style={{ minHeight: device.isTablet ? (device.isLandscape ? 250 : 300) : 200 }}>
              <ExpenseVisualization expenses={expenses} totalAmount={totalAmount} />
            </View>
          </Animated.View>
        )}
      </Card>
    </View>
  );
});
