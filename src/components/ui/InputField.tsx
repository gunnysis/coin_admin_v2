import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Typography } from './Typography';
import { COLORS } from '../../constants/theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

export const InputField = React.memo(
  React.forwardRef<TextInput, InputFieldProps>(({
    label,
    error,
    helperText,
    style,
    editable = true,
    ...props
  }, ref) => {
    return (
      <View className="mb-4">
        <Typography variant="label" color="textSecondary" className="mb-1">
          {label}
        </Typography>
        <TextInput
          ref={ref}
          className={`bg-slate-100 rounded-lg p-4 text-base text-slate-900 border ${
            error 
              ? 'border-expense' 
              : 'border-transparent'
          } ${!editable ? 'opacity-60 bg-slate-200' : ''}`}
          placeholderTextColor={COLORS.textTertiary}
          editable={editable}
          style={style}
          accessibilityLabel={label}
          accessibilityHint={helperText || error}
          accessibilityState={{ disabled: !editable }}
          {...props}
        />
        {error && (
          <Typography variant="caption" color="danger" className="mt-1">
            {error}
          </Typography>
        )}
        {helperText && !error && (
          <Typography variant="caption" color="textTertiary" className="mt-1">
            {helperText}
          </Typography>
        )}
      </View>
    );
  })
);
