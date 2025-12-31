import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Typography } from './Typography';
import { COLORS } from '../../constants/theme';

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
  ...props
}) => {
  const isDisabled = disabled || loading;
  const textColor = variant === 'outline' ? COLORS.primary : COLORS.textInverse;

  return (
    <TouchableOpacity
      className={`rounded-xl items-center justify-center shadow-sm ${variantClasses[variant]} ${sizeClasses[size]} ${isDisabled ? 'opacity-50' : ''}`}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={style}
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
  );
});
