import React from 'react';
import { View, ViewStyle, AccessibilityRole } from 'react-native';
import { SPACING, SHADOWS, RADIUS } from '../../constants/theme';

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

/**
 * 카드: Flat & Shadow - 옅은 테두리(border-slate-100) + shadow-sm, rounded-2xl(16px)
 */
export const Card = React.memo<CardProps>(({
  children,
  style,
  variant = 'default',
  padding = 'base',
  className = '',
  accessibilityRole,
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800',
    elevated: 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800',
    outlined: 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
  };

  const shadowStyle = variant === 'elevated' ? SHADOWS.sm : undefined;
  const borderRadius = RADIUS.card;

  return (
    <View
      className={`${variantClasses[variant]} ${paddingMap[padding]} ${className}`.trim()}
      style={[{ borderRadius }, shadowStyle, style]}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </View>
  );
});
