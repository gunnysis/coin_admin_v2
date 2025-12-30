import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { COLORS, SPACING, ICON_SIZES } from '../../constants/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <View style={styles.container}>
      {icon && (
        <Typography variant="h1" color="textTertiary" style={styles.icon}>
          {icon}
        </Typography>
      )}
      <Typography variant="h3" color="textSecondary" align="center" style={styles.title}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="textTertiary" align="center" style={styles.description}>
          {description}
        </Typography>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING['5xl'],
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: ICON_SIZES.xl * 2,
    marginBottom: SPACING.base,
  },
  title: {
    marginBottom: SPACING.sm,
  },
  description: {
    marginTop: SPACING.xs,
    maxWidth: 280,
  },
  action: {
    marginTop: SPACING.xl,
  },
});
