import React, { useCallback, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Typography } from './ui/Typography';
import { SPACING } from '../constants/theme';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { formatMonthToDisplay } from '../utils/date';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsiveFontSize, getResponsiveValue } from '../utils/responsive';
import { TYPOGRAPHY } from '../constants/theme';
import { useHaptics } from '../hooks/useHaptics';
import { getTestProps } from '../utils/test-utils';

// 상수 정의 - UX/UI 최적화
const MIN_TOUCH_SIZE = 48; // 44px → 48px로 확대 (더 쉬운 터치)
const EXPANDED_TOUCH_SIZE = 52; // 태블릿용 더 큰 터치 영역
const HIT_SLOP = { top: 16, bottom: 16, left: 16, right: 16 }; // 12px → 16px로 확대
const BUTTON_GAP = SPACING.md; // 버튼과 월 표시 영역 간격
const ARROW_FONT_SIZE_MULTIPLIER = 1.4; // 1.2 → 1.4로 확대 (더 명확한 시각)

interface MonthSelectorProps {
  /** 월 선택 시 호출되는 콜백 */
  onMonthSelect?: () => void;
  /** 컴팩트 모드 (작은 크기) */
  compact?: boolean;
}

/**
 * 월 선택기 컴포넌트
 * 
 * 현재 선택된 월을 표시하고, 이전/다음 달로 이동할 수 있는 네비게이션을 제공합니다.
 * 향후 스와이프 제스처와 하단 시트 모달을 추가할 수 있도록 설계되었습니다.
 */
export const MonthSelector = React.memo<MonthSelectorProps>(({
  onMonthSelect,
  compact = false,
}) => {
  const device = useDeviceDimensions();
  const { triggerHaptic } = useHaptics();
  const {
    selectedMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    canGoPrevious,
    canGoNext,
    isCurrentMonth,
  } = useMonthNavigation();

  const handleMonthPress = useCallback(() => {
    triggerHaptic('light');
    onMonthSelect?.();
  }, [onMonthSelect, triggerHaptic]);

  const handlePreviousMonth = useCallback(() => {
    triggerHaptic('light');
    goToPreviousMonth();
  }, [goToPreviousMonth, triggerHaptic]);

  const handleNextMonth = useCallback(() => {
    triggerHaptic('light');
    goToNextMonth();
  }, [goToNextMonth, triggerHaptic]);

  const fontSize = useMemo(
    () => getResponsiveFontSize(device, compact ? TYPOGRAPHY.fontSize.lg : TYPOGRAPHY.fontSize.xl),
    [device, compact]
  );

  const arrowFontSize = useMemo(() => fontSize * ARROW_FONT_SIZE_MULTIPLIER, [fontSize]);

  const monthDisplayText = useMemo(() => formatMonthToDisplay(selectedMonth), [selectedMonth]);

  // 반응형 터치 영역 크기
  const touchSize = useMemo(
    () => getResponsiveValue(device, MIN_TOUCH_SIZE, device.isTablet ? EXPANDED_TOUCH_SIZE : MIN_TOUCH_SIZE),
    [device]
  );

  const containerStyle = useMemo(
    () => ({
      paddingVertical: compact ? SPACING.sm : SPACING.md,
      paddingHorizontal: SPACING.sm, // 좌우 패딩 축소하여 버튼 공간 확보
    }),
    [compact]
  );

  const buttonStyle = useMemo(
    () => ({
      width: touchSize,
      height: touchSize,
      borderRadius: touchSize / 2, // 원형 버튼
    }),
    [touchSize]
  );

  return (
    <View
      className="flex-row items-center justify-between"
      style={containerStyle}
      accessibilityRole="toolbar"
      accessibilityLabel="월 선택 도구"
      {...getTestProps('month-selector')}
    >
      {/* 이전 달 버튼 */}
      <TouchableOpacity
        onPress={handlePreviousMonth}
        disabled={!canGoPrevious}
        className="items-center justify-center"
        style={[
          buttonStyle,
          styles.navigationButton,
          canGoPrevious ? styles.buttonActive : styles.buttonDisabled,
        ]}
        activeOpacity={0.6}
        hitSlop={HIT_SLOP}
        accessibilityLabel="이전 달"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canGoPrevious }}
        {...getTestProps('month-prev')}
      >
        <Typography 
          variant="body" 
          color={canGoPrevious ? "textPrimary" : "textTertiary"} 
          weight="bold"
          style={{ fontSize: arrowFontSize }}
        >
          ‹
        </Typography>
      </TouchableOpacity>

      {/* 월 표시 (탭 가능) - 충돌 방지를 위한 간격 추가 */}
      <TouchableOpacity
        onPress={handleMonthPress}
        className="flex-1 items-center justify-center"
        style={{
          minHeight: touchSize,
          paddingHorizontal: BUTTON_GAP,
          marginHorizontal: SPACING.xs, // 버튼과의 간격 확보
        }}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={`현재 선택된 월: ${monthDisplayText}`}
        accessibilityRole="button"
        accessibilityHint="탭하여 월 선택 모달 열기"
        {...getTestProps('month-display')}
      >
        <View className="flex-row items-center">
          <Typography
            variant={compact ? "body" : "h3"}
            color="textPrimary"
            weight="semibold"
            style={{ fontSize }}
          >
            {monthDisplayText}
          </Typography>
          {isCurrentMonth && (
            <View
              className="ml-2 px-2 py-0.5 rounded-full"
              style={styles.currentMonthBadge}
            >
              <Typography variant="caption" color="primary" weight="medium">
                현재
              </Typography>
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* 다음 달 버튼 */}
      <TouchableOpacity
        onPress={handleNextMonth}
        disabled={!canGoNext}
        className="items-center justify-center"
        style={[
          buttonStyle,
          styles.navigationButton,
          canGoNext ? styles.buttonActive : styles.buttonDisabled,
        ]}
        activeOpacity={0.6}
        hitSlop={HIT_SLOP}
        accessibilityLabel="다음 달"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canGoNext }}
        {...getTestProps('month-next')}
      >
        <Typography 
          variant="body" 
          color={canGoNext ? "textPrimary" : "textTertiary"} 
          weight="bold"
          style={{ fontSize: arrowFontSize }}
        >
          ›
        </Typography>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  navigationButton: {
    // 원형 배경으로 클릭 영역 명확화
    backgroundColor: 'rgba(0, 0, 0, 0.03)', // 매우 연한 배경
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  buttonActive: {
    opacity: 1,
  },
  buttonDisabled: {
    opacity: 0.3,
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
  },
  currentMonthBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});

MonthSelector.displayName = 'MonthSelector';
