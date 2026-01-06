import React from 'react';
import { View, ViewStyle, AccessibilityRole } from 'react-native';
import { SPACING, SHADOWS } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof SPACING;
  className?: string;
  accessibilityRole?: AccessibilityRole;
}

const paddingMap: Record<keyof typeof SPACING, string> = {
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-3',
  base: 'p-4',
  lg: 'p-5',
  xl: 'p-6',
  '2xl': 'p-8',
  '3xl': 'p-10',
  '4xl': 'p-12',
  '5xl': 'p-16',
};

export const Card = React.memo<CardProps>(({
  children,
  style,
  variant = 'default',
  padding = 'base',
  className = '',
  accessibilityRole,
}) => {
  const variantClasses = {
    default: 'bg-white rounded-3xl',
    elevated: 'bg-white rounded-3xl border border-gray-100',
    outlined: 'bg-white rounded-3xl border border-gray-200',
  };

  const shadowStyle = variant === 'elevated' ? SHADOWS.md : undefined;

  return (
    <View 
      className={`${variantClasses[variant]} ${paddingMap[padding]} ${className}`.trim()}
      style={[shadowStyle, style]}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </View>
  );
});
