import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography } from './ui/Typography';
import { COLORS, SPACING, RADIUS, SHADOWS, ICON_SIZES } from '../constants/theme';

interface AddButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const AddButton: React.FC<AddButtonProps> = ({ onPress, disabled = false }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.button, disabled && styles.buttonDisabled]}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityLabel="고정비 추가"
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <Typography variant="h1" color="primary" weight="light" style={styles.icon}>
          +
        </Typography>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SPACING['2xl'],
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    width: ICON_SIZES.xl + SPACING.base,
    height: ICON_SIZES.xl + SPACING.base,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  buttonDisabled: {
    opacity: 0.5,
    borderColor: COLORS.gray400,
  },
  icon: {
    lineHeight: ICON_SIZES.xl,
  },
});
