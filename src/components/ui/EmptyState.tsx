import React from 'react';
import { View } from 'react-native';
import { Typography } from './Typography';
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

  return (
    <View 
      className="py-16 px-6 items-center justify-center flex-1"
      accessibilityRole="status"
      accessibilityLabel={`${title}${description ? `. ${description}` : ''}`}
    >
      {icon && (
        <Typography 
          variant="h1" 
          color="textTertiary" 
          className="mb-4"
          style={{ fontSize: iconSize }}
          accessibilityRole="image"
          accessibilityLabel={icon}
        >
          {icon}
        </Typography>
      )}
      <Typography 
        variant="h3" 
        color="textSecondary" 
        align="center" 
        className="mb-2"
        accessibilityRole="header"
      >
        {title}
      </Typography>
      {description && (
        <Typography 
          variant="body2" 
          color="textTertiary" 
          align="center" 
          className="mt-1 max-w-[280px]"
        >
          {description}
        </Typography>
      )}
      {action && <View className="mt-6">{action}</View>}
    </View>
  );
});
