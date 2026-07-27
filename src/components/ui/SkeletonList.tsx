import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle } from 'react-native';
import { SPACING, RADIUS } from '../../constants/theme';
import { useTheme } from '../../contexts/ThemeContext';

const ROW_HEIGHT = 72;
const ROW_COUNT = 5;

interface SkeletonListProps {
  /** 표시할 행 수 */
  rowCount?: number;
  style?: ViewStyle;
}

/**
 * 리스트 형태 스켈레톤 플레이스홀더
 * isInitLoading 시 ExpenseList / VariableExpenseList 대신 표시
 */
export const SkeletonList = React.memo<SkeletonListProps>(({ rowCount = ROW_COUNT, style }) => {
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
    <Animated.View style={[{ opacity }, style]}>
      {Array.from({ length: rowCount }).map((_, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            height: ROW_HEIGHT,
            paddingVertical: SPACING.sm,
            paddingHorizontal: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderLight,
          }}
        >
          <View style={{ width: 48, height: 48, borderRadius: RADIUS.button, backgroundColor: colors.gray200 }} />
          <View style={{ marginLeft: SPACING.md, flex: 1 }}>
            <View style={{ width: '60%', height: 16, backgroundColor: colors.gray200, borderRadius: 4, marginBottom: SPACING.xs }} />
            <View style={{ width: '40%', height: 14, backgroundColor: colors.gray200, borderRadius: 4 }} />
          </View>
          <View style={{ width: 80, height: 20, backgroundColor: colors.gray200, borderRadius: 4 }} />
        </View>
      ))}
    </Animated.View>
  );
});
