import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import { Typography } from './ui/Typography';
import { SPACING } from '../constants/theme';
import { formatMonthToDisplay } from '../utils/date';

const DISPLAY_DURATION_MS = 2000;

interface MonthTransitionBannerProps {
  /** 표시할 월 (YYYY-MM). 사용자가 월을 변경했을 때만 배너가 잠깐 표시됨 */
  month: string;
  /** 배너가 보일 때 호출 (선택) */
  onShow?: () => void;
}

/**
 * 월 전환 시 짧게 표시되는 인라인 배너 (예: "2025년 1월")
 */
export const MonthTransitionBanner = React.memo<MonthTransitionBannerProps>(({ month, onShow }) => {
  const [visible, setVisible] = useState(false);
  const [displayMonth, setDisplayMonth] = useState(month);
  const opacity = useRef(new Animated.Value(0)).current;
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setDisplayMonth(month);
    setVisible(true);
    onShow?.();

    const timer = setTimeout(() => {
      setVisible(false);
    }, DISPLAY_DURATION_MS);

    return () => clearTimeout(timer);
  }, [month, onShow]);

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(DISPLAY_DURATION_MS - 400),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      opacity.setValue(0);
    }
  }, [visible, opacity]);

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={{
        opacity,
        paddingVertical: SPACING.xs,
        paddingHorizontal: SPACING.sm,
        alignItems: 'center',
      }}
      accessibilityLiveRegion="polite"
      accessibilityLabel={`${formatMonthToDisplay(displayMonth)}로 변경됨`}
    >
      <Typography variant="caption" color="textSecondary">
        {formatMonthToDisplay(displayMonth)}
      </Typography>
    </Animated.View>
  );
});

MonthTransitionBanner.displayName = 'MonthTransitionBanner';
