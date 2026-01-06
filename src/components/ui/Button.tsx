import React, { useRef } from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from './Typography';
import { COLORS, SHADOWS } from '../../constants/theme';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  style?: TouchableOpacityProps['style'];
}

const variantClasses = {
  primary: 'bg-blue-500',
  secondary: 'bg-green-500',
  danger: 'bg-red-500',
  outline: 'bg-transparent border-2 border-blue-500',
};

const sizeClasses = {
  sm: 'px-4 py-2',
  md: 'px-6 py-3',
  lg: 'px-8 py-4',
};

export const Button = React.memo<ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;
  const textColor = variant === 'outline' ? COLORS.primary : COLORS.textInverse;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!isDisabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = (e: any) => {
    if (!isDisabled && onPress) {
      onPress(e);
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        variant !== 'outline' && !isDisabled && SHADOWS.md,
        style,
      ]}
    >
      <TouchableOpacity
        className={`rounded-xl items-center justify-center ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? 'opacity-50' : ''}`}
        disabled={isDisabled}
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        {...props}
      >
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <Typography
            variant={size === 'sm' ? 'body2' : 'body'}
            color={variant === 'outline' ? 'primary' : 'textInverse'}
            weight="semibold"
          >
            {children}
          </Typography>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});
