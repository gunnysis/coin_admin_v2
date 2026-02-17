import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Platform, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from './ui/Typography';
import { SPACING, SHADOWS, COLORS } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsiveValue } from '../utils/responsive';
import { getTestProps } from '../utils/test-utils';

interface AddButtonProps {
  onPress: () => void;
  disabled?: boolean;
  bottomInset?: number;
}

export const AddButton = React.memo<AddButtonProps>(({ 
  onPress, 
  disabled = false,
  bottomInset = 0,
}) => {
  const device = useDeviceDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // 반응형 버튼 크기
  const buttonSize = getResponsiveValue(device, 56, device.isTablet ? 64 : 56);
  const borderWidth = getResponsiveValue(device, 2, device.isTablet ? 3 : 2);
  
  // 하단 바를 고려한 버튼 위치 계산
  const additionalBottomPadding = Platform.OS === 'ios' ? SPACING.xl : SPACING.lg;
  const bottomPosition = bottomInset + additionalBottomPadding;

  const handlePressIn = () => {
    if (!disabled) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.spring(rotateAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 8,
        }),
      ]).start();
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.spring(rotateAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 8,
      }),
    ]).start();
  };

  // Initialize interpolate immediately but store in ref to avoid re-creating
  // This ensures the interpolate result is available on first render
  const rotateRef = useRef(
    rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '135deg'],
    })
  );

  return (
    <View 
      className="absolute left-0 right-0 items-center z-10"
      style={{ bottom: bottomPosition }}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale: scaleAnim }, { rotate: rotateRef.current }],
          },
          SHADOWS.lg,
        ]}
      >
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={`
            rounded-full bg-white border-2 
            items-center justify-center
            ${disabled ? 'opacity-50 border-slate-400' : 'border-[#2563eb]'}
          `}
          style={{
            width: buttonSize,
            height: buttonSize,
            borderWidth,
            backgroundColor: COLORS.surface,
          }}
          disabled={disabled}
          activeOpacity={1}
          accessibilityLabel="항목 추가"
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          {...getTestProps('add-button')}
        >
          <Typography 
            variant="h1" 
            color="primary" 
            weight="light" 
            className="leading-10"
          >
            +
          </Typography>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});
