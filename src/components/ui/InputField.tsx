import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

export const InputField = React.forwardRef<TextInput, InputFieldProps>(({
  label,
  error,
  helperText,
  style,
  ...props
}, ref) => {
  return (
    <View style={styles.container}>
      <Typography variant="label" color="textSecondary" style={styles.label}>
        {label}
      </Typography>
      <TextInput
        ref={ref}
        style={[
          styles.input,
          error && styles.inputError,
          props.editable === false && styles.inputDisabled,
          style,
        ]}
        placeholderTextColor={COLORS.textTertiary}
        {...props}
      />
      {error && (
        <Typography variant="caption" color="danger" style={styles.errorText}>
          {error}
        </Typography>
      )}
      {helperText && !error && (
        <Typography variant="caption" color="textTertiary" style={styles.helperText}>
          {helperText}
        </Typography>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.base,
  },
  label: {
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.base,
    padding: SPACING.base,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  inputDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.gray200,
  },
  errorText: {
    marginTop: SPACING.xs,
  },
  helperText: {
    marginTop: SPACING.xs,
  },
});
