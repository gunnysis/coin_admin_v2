import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

type ColorKey = 
  | 'textPrimary' 
  | 'textSecondary' 
  | 'textTertiary' 
  | 'textInverse'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'warning'
  | 'success'
  | keyof typeof COLORS;

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'body2' | 'caption' | 'label';
  color?: ColorKey;
  weight?: keyof typeof TYPOGRAPHY.fontWeight;
  align?: 'left' | 'center' | 'right';
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'textPrimary',
  weight,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const variantStyles = {
    h1: {
      fontSize: TYPOGRAPHY.fontSize['4xl'],
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.fontSize['4xl'] * TYPOGRAPHY.lineHeight.tight,
    },
    h2: {
      fontSize: TYPOGRAPHY.fontSize['3xl'],
      fontWeight: TYPOGRAPHY.fontWeight.bold,
      lineHeight: TYPOGRAPHY.fontSize['3xl'] * TYPOGRAPHY.lineHeight.tight,
    },
    h3: {
      fontSize: TYPOGRAPHY.fontSize['2xl'],
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.fontSize['2xl'] * TYPOGRAPHY.lineHeight.normal,
    },
    body: {
      fontSize: TYPOGRAPHY.fontSize.base,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.fontSize.base * TYPOGRAPHY.lineHeight.normal,
    },
    body2: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.fontSize.sm * TYPOGRAPHY.lineHeight.normal,
    },
    caption: {
      fontSize: TYPOGRAPHY.fontSize.xs,
      fontWeight: TYPOGRAPHY.fontWeight.normal,
      lineHeight: TYPOGRAPHY.fontSize.xs * TYPOGRAPHY.lineHeight.normal,
    },
    label: {
      fontSize: TYPOGRAPHY.fontSize.sm,
      fontWeight: TYPOGRAPHY.fontWeight.semibold,
      lineHeight: TYPOGRAPHY.fontSize.sm * TYPOGRAPHY.lineHeight.normal,
    },
  };

  const colorValue = COLORS[color as keyof typeof COLORS] || COLORS.textPrimary;

  return (
    <Text
      style={[
        variantStyles[variant],
        { color: colorValue, textAlign: align },
        weight && { fontWeight: TYPOGRAPHY.fontWeight[weight] },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
