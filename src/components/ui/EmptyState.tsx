import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { Typography } from './Typography';
import { SPACING } from '../../constants/theme';
import { useDeviceDimensions } from '../../hooks/useDeviceDimensions';
import { getResponsiveFontSize } from '../../utils/responsive';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState = React.memo<EmptyStateProps>(({
  icon,
  title,
  description,
  action,
}) => {
  const device = useDeviceDimensions();
  const iconSize = getResponsiveFontSize(device, 80);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <Animated.View
      className="items-center justify-center flex-1"
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        paddingVertical: SPACING['5xl'],
        paddingHorizontal: SPACING.xl,
      }}
      accessibilityLabel={`${title}${description ? `. ${description}` : ''}`}
    >
      {icon && (
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <Typography
            variant="h1"
            color="textTertiary"
            style={{ fontSize: iconSize, marginBottom: SPACING.base }}
            accessibilityRole="image"
            accessibilityLabel={icon}
          >
            {icon}
          </Typography>
        </Animated.View>
      )}
      <Typography
        variant="h3"
        color="textSecondary"
        align="center"
        style={{ marginBottom: SPACING.sm }}
        accessibilityRole="header"
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="textTertiary"
          align="center"
          style={{ marginTop: SPACING.xs, maxWidth: 280 }}
        >
          {description}
        </Typography>
      )}
      {action && <View style={{ marginTop: SPACING.lg }}>{action}</View>}
    </Animated.View>
  );
});
