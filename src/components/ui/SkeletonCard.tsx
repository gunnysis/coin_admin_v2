import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { SPACING, RADIUS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonCardProps {
  /** 카드 전체 높이 (대략 총액 카드용) */
  height?: number;
  style?: ViewStyle;
}

/**
 * 총액 카드 형태 스켈레톤 플레이스홀더
 * isInitLoading 시 TotalAmountCard 대신 표시
 */
export const SkeletonCard = React.memo<SkeletonCardProps>(({ height = 120, style }) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          height,
          backgroundColor: colors.gray200,
          borderRadius: RADIUS.card,
          padding: SPACING.base,
          opacity,
        },
        style,
      ]}
    >
      <View style={{ width: '40%', height: 24, backgroundColor: colors.gray300, borderRadius: 4, marginBottom: SPACING.md }} />
      <View style={{ width: '70%', height: 36, backgroundColor: colors.gray300, borderRadius: 4 }} />
    </Animated.View>
  );
});
