import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
  style?: TouchableOpacityProps['style'];
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  style,
  ...props
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[`size_${size}`],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textColor = variant === 'outline' ? COLORS.primary : COLORS.textInverse;

  return (
    <TouchableOpacity
      style={buttonStyle}
      disabled={disabled || loading}
      activeOpacity={0.8}
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
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  size_sm: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  size_md: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  size_lg: {
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.base,
  },
  disabled: {
    opacity: 0.5,
  },
});
