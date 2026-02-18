import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Typography } from './Typography';
import { SPACING, COLORS, SHADOWS } from '../../constants/theme';
import { useDeviceDimensions } from '../../hooks/useDeviceDimensions';
import { getResponsiveValue } from '../../utils/responsive';

const MIN_TOUCH_SIZE = 44;

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  itemName: string;
  scaleAnim: Animated.Value;
  onPressIn: () => void;
  onPressOut: () => void;
}

export const ActionButtons = React.memo<ActionButtonsProps>(({
  onEdit,
  onDelete,
  isDeleting = false,
  itemName,
  scaleAnim,
  onPressIn,
  onPressOut,
}) => {
  const device = useDeviceDimensions();
  const buttonSize = getResponsiveValue(device, MIN_TOUCH_SIZE, device.isTablet ? 48 : MIN_TOUCH_SIZE);
  const buttonGap = getResponsiveValue(device, SPACING.sm, device.isTablet ? SPACING.base : SPACING.sm);

  return (
    <View className="flex-row items-center">
      {onEdit && (
        <TouchableOpacity
          onPress={onEdit}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={0.8}
          className="rounded-xl items-center justify-center"
          style={[
            {
              width: buttonSize,
              height: buttonSize,
              marginRight: buttonGap,
              backgroundColor: COLORS.accentLight,
            },
            SHADOWS.sm,
          ]}
          accessibilityLabel={`${itemName} 수정`}
          accessibilityRole="button"
          accessibilityHint="이 항목을 수정합니다"
        >
          <Typography variant="body" color="textPrimary">✏️</Typography>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={onDelete}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDeleting}
        activeOpacity={0.8}
        className="rounded-xl items-center justify-center"
        style={[
          {
            width: buttonSize,
            height: buttonSize,
            backgroundColor: isDeleting ? COLORS.gray300 : COLORS.danger,
            opacity: isDeleting ? 0.6 : 1,
          },
          SHADOWS.sm,
        ]}
        accessibilityLabel={`${itemName} 삭제`}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDeleting }}
        accessibilityHint="이 항목을 삭제합니다"
      >
        <Typography variant="body" color="textInverse" weight="semibold">
          ✕
        </Typography>
      </TouchableOpacity>
    </View>
  );
});

