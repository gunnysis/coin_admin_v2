import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { formatCurrency } from '../utils/format';
import { VariableMonthExpense } from '../types';
import { Card } from './ui/Card';
import { Typography } from './ui/Typography';
import { SPACING } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsiveMargin, getResponsiveFontSize } from '../utils/responsive';
import { TYPOGRAPHY } from '../constants/theme';
import { VariableExpenseVisualization } from './VariableExpenseVisualization';
import { MonthSelector } from './MonthSelector';
import { useHaptics } from '../hooks/useHaptics';
import {
  createRotateAnimation,
  createHeightAnimation,
  createInterpolate,
  configureLayoutAnimation,
} from '../utils/animations';

interface VariableTotalAmountCardProps {
  /** 선택된 월의 유동비 총액 */
  totalAmount: number;
  /** 차트 확장 상태 */
  isExpanded?: boolean;
  /** 차트 확장/축소 토글 핸들러 */
  onToggleExpand?: () => void;
  /** 유동비 항목 목록 (차트 시각화용) */
  expenses?: VariableMonthExpense[];
}

/**
 * 유동비 총액 카드 컴포넌트
 * 
 * 선택된 월의 유동비 총액을 표시하고, 확장 시 상세 시각화를 제공합니다.
 * - 월 선택기 통합
 * - 총액 및 항목 수 표시
 * - 확장 가능한 차트 영역
 * - 반응형 디자인 지원
 */
export const VariableTotalAmountCard = React.memo<VariableTotalAmountCardProps>(({
  totalAmount,
  isExpanded = false,
  onToggleExpand,
  expenses = [],
}) => {
  const device = useDeviceDimensions();
  const { triggerHaptic } = useHaptics();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  // 반응형 스타일 계산
  const responsiveMargin = getResponsiveMargin(device, SPACING.base);
  const totalAmountFontSize = getResponsiveFontSize(device, TYPOGRAPHY.fontSize['4xl']);
  const adjustedTotalSize = device.isTablet 
    ? totalAmountFontSize * 0.92
    : totalAmountFontSize;
  
  // 차트 높이 설정
  const maxChartHeight = device.isTablet ? (device.isLandscape ? 400 : 350) : 300;

  // 애니메이션 인터폴레이션 값
  const rotateInterpolate = useMemo(
    () => createInterpolate(rotateAnim, [0, 1], ['0deg', '180deg']),
    [rotateAnim]
  );

  const chartHeightInterpolate = useMemo(
    () => createInterpolate(heightAnim, [0, 1], [0, maxChartHeight]),
    [heightAnim, maxChartHeight]
  );

  const chartOpacityInterpolate = useMemo(
    () => createInterpolate(heightAnim, [0, 0.5, 1], [0, 0, 1]),
    [heightAnim]
  );

  // 애니메이션 효과
  useEffect(() => {
    const rotateAnimation = createRotateAnimation(rotateAnim, isExpanded ? 1 : 0);
    const heightAnimation = createHeightAnimation(heightAnim, isExpanded ? 1 : 0, {
      duration: 300,
    });

    rotateAnimation.start();
    heightAnimation.start();

    if (isExpanded) {
      configureLayoutAnimation();
    }
  }, [isExpanded, rotateAnim, heightAnim]);

  // 토글 핸들러
  const handleToggle = useCallback(() => {
    triggerHaptic('light');
    onToggleExpand?.();
  }, [onToggleExpand, triggerHaptic]);

  return (
    <View
      style={{
        marginHorizontal: 0,
        marginBottom: device.isTablet ? responsiveMargin : SPACING.md,
      }}
    >
      <Card 
        variant="elevated" 
        padding={device.isTablet ? "xl" : "lg"} 
        className="relative"
        accessibilityRole="summary"
      >
        {/* 월 선택기 */}
        <View className="mb-3">
          <MonthSelector compact />
        </View>

        {/* 총액 표시 영역 - 라벨과 토글 버튼을 같은 행에 배치 */}
        <View className="mb-3" accessibilityRole="text">
          <View className="flex-row items-center justify-between mb-1">
            <Typography variant="label" color="textSecondary">
              유동비 총액
            </Typography>
            {onToggleExpand && (
              <TouchableOpacity
                onPress={handleToggle}
                className="items-center justify-center rounded-full"
                style={{
                  width: 40,
                  height: 40,
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={isExpanded ? '차트 접기' : '차트 펼치기'}
                accessibilityRole="button"
                accessibilityHint={isExpanded ? '차트를 접어 숨깁니다' : '유동비 차트를 펼쳐서 확인합니다'}
                accessibilityState={{ expanded: isExpanded }}
              >
                <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                  <Typography variant="body" color="primary" weight="semibold" style={{ fontSize: 18 }}>
                    ▼
                  </Typography>
                </Animated.View>
              </TouchableOpacity>
            )}
          </View>
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

        {/* 차트 영역 */}
        {isExpanded && (
          <Animated.View
            className="overflow-hidden mt-4"
            style={{
              height: chartHeightInterpolate,
              opacity: chartOpacityInterpolate,
              marginHorizontal: -SPACING.lg,
              minHeight: device.isTablet ? (device.isLandscape ? 250 : 300) : 200,
            }}
          >
            <View className="flex-1" style={{ minHeight: device.isTablet ? (device.isLandscape ? 250 : 300) : 200 }}>
              <VariableExpenseVisualization 
                expenses={expenses} 
                totalAmount={totalAmount}
              />
            </View>
          </Animated.View>
        )}
      </Card>
    </View>
  );
});

